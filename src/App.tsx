import { useState, useEffect } from 'react';
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

  // ▼ データ取得関数
  const fetchMatches = async (userId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // 作成順の降順

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

      // 日付順ソート (念のため)
      formattedMatches.sort((a, b) => new Date(b.nichiji).getTime() - new Date(a.nichiji).getTime());

      const win = formattedMatches.filter(m => m.shouhai === "勝ち").length;
      const lose = formattedMatches.filter(m => m.shouhai === "負け").length;

      const updatedHistory = {
        matches: formattedMatches,
        winCount: win,
        loseCount: lose
      };

      setHistory(updatedHistory);
      return updatedHistory; // ★ 最新の履歴を返す
    }
  };
  
  // ▼ ゲスト時の再読込用
  const reloadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
       setHistory(JSON.parse(stored));
    }
  };

  // --------------------------------------------------------------------------
  // ★★★ 通信機能のセットアップ (ここが重要！) ★★★
  // --------------------------------------------------------------------------
  const { notifyUpdate, notifyAnimation } = useObsSync(
    syncKey,
    isObsMode,
    // ① データ更新命令が来た時の処理 (OBS画面で受信したとき)
    async (incomingHistory) => {
      if (incomingHistory) {
        setHistory(incomingHistory);
      } else {
        if (user) {
          await fetchMatches(user.id);
        } else {
          reloadFromStorage();
        }
      }
    },
    // ② アニメーション命令が来た時の処理 (OBS画面で受信したとき)
    (result) => {
      setObsAnimResult(result);
      // 3秒後にアニメ表示を消す
      setTimeout(() => setObsAnimResult(null), 3000); 
    },
    // ③ 現在のデータを要求された時の処理 (通常ブラウザ側が、OBS側からのデータ要求を受け取ったとき)
    () => history
  );


  // ▼ 初期化（コントローラー・OBSモードは認証不要のためスキップ）
  useEffect(() => {
    if (isControllerMode || isObsMode) return;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchMatches(currentUser.id);
      } else {
        window.addEventListener('storage', reloadFromStorage);
      }
      setIsLoading(false);
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
    // 画面の即時更新
    const newMatches = [newMatch, ...history.matches];
    const newWin = newMatch.shouhai === "勝ち" ? history.winCount + 1 : history.winCount;
    const newLose = newMatch.shouhai === "負け" ? history.loseCount + 1 : history.loseCount;
    const newState = { matches: newMatches, winCount: newWin, loseCount: newLose };
    
    setHistory(newState);

    // ★★★ OBS画面へ「アニメーション出せ！」と送信 ★★★
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
      
      if (!error) {
        const updated = await fetchMatches(user.id); // IDなどを確定させるため再取得
        // ★★★ OBS画面へ「DB更新したから読み込んで！」と送信 ★★★
        if (updated) notifyUpdate(updated); 
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      // ★★★ OBS画面へ「ストレージ更新したよ！」と送信 ★★★
      notifyUpdate(newState);
    }
  };

  // ---------------------------------------------------------
  // 5. 編集 (Update)
  // ---------------------------------------------------------
  const handleUpdateMatch = async (updatedMatch: MatchResult) => {
    if (selectedMatchIndex === null) return;

    const newMatches = [...history.matches];
    newMatches[selectedMatchIndex] = updatedMatch;
    newMatches.sort((a, b) => new Date(b.nichiji).getTime() - new Date(a.nichiji).getTime());
    const newWinCount = newMatches.filter(m => m.shouhai === "勝ち").length;
    const newLoseCount = newMatches.filter(m => m.shouhai === "負け").length;
    const newState = { matches: newMatches, winCount: newWinCount, loseCount: newLoseCount };

    setHistory(newState);
    setIsModalOpen(false);

    if (user && updatedMatch.id) {
      const { error } = await supabase
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

      if (error) console.error('更新エラー:', error);
      else {
        const updated = await fetchMatches(user.id);
        if (updated) notifyUpdate(updated); // ★通信: 更新通知
      }

    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      notifyUpdate(newState); // ★通信: 更新通知
    }
  };

  // ---------------------------------------------------------
  // 6. 削除 (Delete)
  // ---------------------------------------------------------
  const handleDeleteMatch = async () => {
    if (selectedMatchIndex === null) return;
    const targetMatch = history.matches[selectedMatchIndex];

    const newMatches = history.matches.filter((_, i) => i !== selectedMatchIndex);
    const newWin = targetMatch.shouhai === "勝ち" ? history.winCount - 1 : history.winCount;
    const newLose = targetMatch.shouhai === "負け" ? history.loseCount - 1 : history.loseCount;
    const newState = { matches: newMatches, winCount: newWin, loseCount: newLose };

    setHistory(newState);
    setIsModalOpen(false);

    if (user && targetMatch.id) {
      const { error } = await supabase.from('matches').delete().eq('id', targetMatch.id);
      if (error) console.error('削除エラー:', error);
      else {
        const updated = await fetchMatches(user.id);
        if (updated) notifyUpdate(updated); // ★通信: 更新通知
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      notifyUpdate(newState); // ★通信: 更新通知
    }
  };

  // ---------------------------------------------------------
  // 7. 全消去 (Reset)
  // ---------------------------------------------------------
  const handleClearResults = async () => {
    if (!window.confirm('本当に全ての履歴を削除しますか？')) return;

    if (user) {
      const { error } = await supabase.from('matches').delete().eq('user_id', user.id);
      if (error) console.error('全削除エラー:', error);
      else {
        const updated = await fetchMatches(user.id);
        if (updated) {
          notifyUpdate(updated); // ★通信: 更新通知
        } else {
          notifyUpdate({ matches: [], winCount: 0, loseCount: 0 });
        }
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      const emptyState = { matches: [], winCount: 0, loseCount: 0 };
      setHistory(emptyState);
      notifyUpdate(emptyState); // ★通信: 更新通知
    }
  };


  // =========================================================
  // ★★★ スマホコントローラー（リモコン）モード時の表示 ★★★
  // ★ 認証なしで即レンダリング（制限ブラウザ対策）
  // =========================================================
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

  // =========================================================
  // ★★★ OBSモード時の表示 (高機能オーバーレイ) ★★★
  // =========================================================
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

  // =========================================================
  // ★★★ 通常モード時の表示 ★★★
  // =========================================================
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