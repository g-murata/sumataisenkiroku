import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

import { supabase } from './supabaseClient';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Result } from './components/Result';
import { ResultAnimation } from './components/ResultAnimation';
import { MatchHistory, MatchResult } from './types';
import { MatchDetailModal } from './components/MatchDetailModal';
import { characterList } from './components/Character';
// ★追加: フックをインポート
import { useObsSync } from './hooks/useObsSync';
import { ObsOverlay } from './components/ObsOverlay';
import { MobileController } from './components/MobileController';

const STORAGE_KEY = "gameResults";

export default function App() {
  // ▼ URLパラメータで「OBSモード」または「リモコンモード」かどうか判定（最初に評価）
  const searchParams = new URLSearchParams(window.location.search);
  const isObsMode = searchParams.get('mode') === 'obs';
  const isControllerMode = searchParams.get('mode') === 'controller';
  const urlSyncKey = searchParams.get('sync');

  const [user, setUser] = useState<any>(null);
  // コントローラー/OBSモードは認証不要 → 最初からisLoading=false
  const [isLoading, setIsLoading] = useState(
    !isControllerMode && !isObsMode
  );

  // ゲスト用の一意な同期キーを管理 (未ログイン時のOBS同期に使用)
  const [guestSyncKey] = useState<string>(() => {
    const stored = localStorage.getItem("guestSyncKey");
    if (stored) return stored;
    const newKey = "guest_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem("guestSyncKey", newKey);
    return newKey;
  });

  // 接続に用いる同期キーを決定
  const syncKey = urlSyncKey || user?.id || guestSyncKey;

  // ▼ OBS側のアニメーション制御用State
  const [obsAnimResult, setObsAnimResult] = useState<"勝ち"|"負け" | null>(null);

  const [history, setHistory] = useState<MatchHistory>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { matches: [], winCount: 0, loseCount: 0 };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(null);

  // ▼ OBSへ現在見せているデータを保持するRef（新しい接続への応答用）
  const currentFilteredHistoryRef = useRef<MatchHistory>(history);

  // ▼ データ取得関数
  const fetchMatches = async (userId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('データ取得エラー:', error);
      return;
    }

    if (data) {
      const formattedMatches: MatchResult[] = data.map((d: any) => ({
        id: d.id,
        user_id: d.user_id,
        nichiji: d.date,
        shouhai: d.result,
        memo: d.memo,
        player: characterList.find(c => c.characterNo === d.my_char_id) || null,
        opponentPlayer: characterList.find(c => c.characterNo === d.opp_char_id) || null,
      }));

      formattedMatches.sort((a, b) => new Date(b.nichiji).getTime() - new Date(a.nichiji).getTime());

      const win = formattedMatches.filter(m => m.shouhai === "勝ち").length;
      const lose = formattedMatches.filter(m => m.shouhai === "負け").length;

      const updatedHistory = {
        matches: formattedMatches,
        winCount: win,
        loseCount: lose
      };

      setHistory(updatedHistory);
      return updatedHistory;
    }
  };
  
  const reloadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
       setHistory(JSON.parse(stored));
    }
  };

  // --------------------------------------------------------------------------
  // ★★★ 通信機能のセットアップ ★★★
  // --------------------------------------------------------------------------
  const { notifyUpdate, notifyAnimation } = useObsSync(
    syncKey,
    isObsMode,
    // ① データ更新命令が来た時の処理 (受信したとき)
    async (incomingHistory, isFiltered) => {
      if (incomingHistory) {
        setHistory(incomingHistory);
        // 絞り込みデータでなければ、Refも更新（次にOBSが繋がった時用）
        if (!isFiltered) {
          currentFilteredHistoryRef.current = incomingHistory;
        }
      } else {
        if (user) {
          await fetchMatches(user.id);
        } else {
          reloadFromStorage();
        }
      }
    },
    // ② アニメーション命令が来た時の処理
    (result) => {
      setObsAnimResult(result);
      setTimeout(() => setObsAnimResult(null), 3000); 
    },
    // ③ 現在のデータを要求された時の処理
    () => currentFilteredHistoryRef.current
  );


  // --------------------------------------------------------------------------
  // ★★★ 絞り込み同期機能のメモ化 ★★★
  // --------------------------------------------------------------------------
  const handleFilterHistoryChange = useCallback((filteredHistory: MatchHistory) => {
    // 絞り込まれた戦績をRefに保持
    currentFilteredHistoryRef.current = filteredHistory;
    // ★ OBSだけに通知する（isFiltered=true）
    notifyUpdate(filteredHistory, true);
  }, [notifyUpdate]);

  // ▼ 初期化
  useEffect(() => {
    if (isControllerMode || isObsMode) return;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchMatches(currentUser.id);
        } else {
          window.addEventListener('storage', reloadFromStorage);
        }
      } catch (e) {
        console.error("初期化エラー:", e);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchMatches(currentUser.id);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        setHistory(stored ? JSON.parse(stored) : { matches: [], winCount: 0, loseCount: 0 });
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', reloadFromStorage);
    };
  }, []);


  // ---------------------------------------------------------
  // 4. 新規登録 (Create)
  // ---------------------------------------------------------
  const handleAddResult = async (newMatch: MatchResult) => {
    setHistory(prev => {
      const newMatches = [newMatch, ...prev.matches];
      const newWin = newMatch.shouhai === "勝ち" ? prev.winCount + 1 : prev.winCount;
      const newLose = newMatch.shouhai === "負け" ? prev.loseCount + 1 : prev.loseCount;
      const newState = { matches: newMatches, winCount: newWin, loseCount: newLose };
      
      if (!user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
      // ★ 本当のデータ更新なので、全員に通知する（isFiltered=false）
      notifyUpdate(newState, false);
      return newState;
    });

    notifyAnimation(newMatch.shouhai);

    if (user) {
      const { error } = await supabase.from('matches').insert([{
          user_id: user.id,
          my_char_id: newMatch.player?.characterNo,
          opp_char_id: newMatch.opponentPlayer?.characterNo,
          my_char: newMatch.player?.characterName,
          opponent_char: newMatch.opponentPlayer?.characterName,
          result: newMatch.shouhai,
          date: newMatch.nichiji,
          memo: newMatch.memo
        }]);
      
      if (error) console.error('クラウド保存エラー:', error);
    }
  };

  // ---------------------------------------------------------
  // 5. 編集 (Update)
  // ---------------------------------------------------------
  const handleUpdateMatch = async (updatedMatch: MatchResult) => {
    if (selectedMatchIndex === null) return;

    setHistory(prev => {
      const newMatches = [...prev.matches];
      newMatches[selectedMatchIndex] = updatedMatch;
      newMatches.sort((a, b) => new Date(b.nichiji).getTime() - new Date(a.nichiji).getTime());
      
      const win = newMatches.filter(m => m.shouhai === "勝ち").length;
      const lose = newMatches.filter(m => m.shouhai === "負け").length;
      
      const newState = { matches: newMatches, winCount: win, loseCount: lose };
      if (!user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
      // ★ 全員に通知
      notifyUpdate(newState, false);
      return newState;
    });

    setIsModalOpen(false);

    if (user && updatedMatch.id) {
      await supabase
        .from('matches')
        .update({
          my_char_id: updatedMatch.player?.characterNo,
          opp_char_id: updatedMatch.opponentPlayer?.characterNo,
          my_char: updatedMatch.player?.characterName,
          opponent_char: updatedMatch.opponentPlayer?.characterName,
          result: updatedMatch.shouhai,
          date: new Date(updatedMatch.nichiji).toISOString(),
          memo: updatedMatch.memo
        })
        .eq('id', updatedMatch.id);
    }
  };

  // ---------------------------------------------------------
  // 6. 削除 (Delete)
  // ---------------------------------------------------------
  const handleDeleteMatch = async () => {
    if (selectedMatchIndex === null) return;
    const targetMatch = history.matches[selectedMatchIndex];

    setHistory(prev => {
      const newMatches = prev.matches.filter((_, i) => i !== selectedMatchIndex);
      const win = newMatches.filter(m => m.shouhai === "勝ち").length;
      const lose = newMatches.filter(m => m.shouhai === "負け").length;
      const newState = { matches: newMatches, winCount: win, loseCount: lose };
      
      if (!user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
      // ★ 全員に通知
      notifyUpdate(newState, false);
      return newState;
    });

    setIsModalOpen(false);

    if (user && targetMatch.id) {
      await supabase.from('matches').delete().eq('id', targetMatch.id);
    }
  };

  // ---------------------------------------------------------
  // 7. 全消去 (Reset)
  // ---------------------------------------------------------
  const handleClearResults = async () => {
    if (!window.confirm('本当に全ての履歴を削除しますか？')) return;

    if (user) {
      const { error } = await supabase.from('matches').delete().eq('user_id', user.id);
      if (!error) {
        await fetchMatches(user.id);
        // fetchMatches内で notifyUpdate を呼ばないので、ここで呼ぶ必要があるかもしれないが、
        // fetchMatchesが再レンダリングを走らせ、Home画面のuseEffectが動くので自動で同期されます。
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      const emptyState = { matches: [], winCount: 0, loseCount: 0 };
      setHistory(emptyState);
      notifyUpdate(emptyState, false);
    }
  };

  if (isControllerMode) {
    return (
      <MobileController 
        history={history}
        onAddResult={handleAddResult}
        user={user}
      />
    );
  }

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#07070d]" />;
  }

  if (isObsMode) {
    return (
      <div className="h-screen w-screen bg-transparent overflow-hidden relative flex items-start justify-start">
        <ObsOverlay 
          history={history} 
          animationResult={obsAnimResult}
          onAnimationComplete={() => setObsAnimResult(null)}
        />
      </div>
    );
  }

  return (    
    <div>
      <Header user={user} syncKey={syncKey} />
      <Home 
        history={history}
        onAddResult={handleAddResult}
        onRowClick={(index) => {
          setSelectedMatchIndex(index);
          setIsModalOpen(true);
        }}
        onClearResults={handleClearResults}
        user={user}
        onFilterHistoryChange={handleFilterHistoryChange}
      />
      <MatchDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatchIndex !== null ? history.matches[selectedMatchIndex] : null}
        onSave={handleUpdateMatch}
        onDelete={handleDeleteMatch}
      />
    </div>
  );
}
