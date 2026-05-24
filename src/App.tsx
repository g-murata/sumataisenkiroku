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

const STORAGE_KEY = "gameResults";

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const isObsMode = searchParams.get('mode') === 'obs';
  const urlSyncKey = searchParams.get('sync');

  const [user, setUser] = useState<any>(null);
  // コントローラー/OBSモードは認証不要 → 最初からisLoading=false
  const [isLoading, setIsLoading] = useState(
    !isObsMode
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
  const [obsAnimResult, setObsAnimResult] = useState<"勝ち" | "負け" | null>(null);

  const [showEffect, setShowEffect] = useState<{
    shouhai: "勝ち" | "負け";
    playerUrl: string;
    oppUrl: string;
    playerName: string;
    oppName: string;
    id: number;
  } | null>(null);
  const [animateWin, setAnimateWin] = useState(false);
  const [animateLose, setAnimateLose] = useState(false);

  const [history, setHistory] = useState<MatchHistory>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { matches: [], winCount: 0, loseCount: 0 };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(null);

  // ▼ 他の端末からの更新を受信中かどうかを追跡するフラグ
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);

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
        // ★ 外部からの更新であることを記録（これによりHome画面の自動放送を止める）
        setIsRemoteUpdate(true);
        setHistory(incomingHistory);

        // 絞り込みデータでなければ、Refも更新
        if (!isFiltered) {
          currentFilteredHistoryRef.current = incomingHistory;
        }

        // 次のレンダリングサイクルでフラグを戻す
        setTimeout(() => setIsRemoteUpdate(false), 100);

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
    if (isObsMode) return;

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
    if (newMatch.player && newMatch.opponentPlayer) {
      setShowEffect({
        shouhai: newMatch.shouhai,
        playerUrl: newMatch.player.imageUrl,
        oppUrl: newMatch.opponentPlayer.imageUrl,
        playerName: newMatch.player.characterName,
        oppName: newMatch.opponentPlayer.characterName,
        id: Date.now()
      });
    }

    if (newMatch.shouhai === "勝ち") {
      setAnimateWin(true);
      setTimeout(() => setAnimateWin(false), 500);
    } else {
      setAnimateLose(true);
      setTimeout(() => setAnimateLose(false), 500);
    }

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
        isRemoteUpdate={isRemoteUpdate}
        animateWin={animateWin}
        animateLose={animateLose}
      />
      <MatchDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatchIndex !== null ? history.matches[selectedMatchIndex] : null}
        onSave={handleUpdateMatch}
        onDelete={handleDeleteMatch}
      />

      {/* 通常画面用の録画完了アニメーションオーバーレイ */}
      {showEffect && (
        <div
          key={showEffect.id}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-6 bg-black/10 backdrop-blur-[1px]"
        >
          {showEffect.shouhai === "勝ち" ? (
            <div
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) setShowEffect(null);
              }}
              className="animate-record-pop bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-amber-500 shadow-[0_10px_40px_rgba(245,158,11,0.3)] rounded-3xl p-5 flex flex-col items-center gap-3.5 text-center max-w-[260px] w-full"
            >
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-400 rounded-full flex items-center justify-center text-3xl animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                🏆
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-black">RECORDED</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  VICTORY!
                </span>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border-2 border-red-500 bg-slate-950 p-0.5 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                    <img src={showEffect.playerUrl} alt={showEffect.playerName} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[9px] font-bold text-red-400 max-w-[60px] truncate">{showEffect.playerName}</span>
                </div>
                <span className="text-slate-500 text-xs font-black">VS</span>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-950 p-0.5">
                    <img src={showEffect.oppUrl} alt={showEffect.oppName} className="w-full h-full object-contain opacity-50" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 max-w-[60px] truncate">{showEffect.oppName}</span>
                </div>
              </div>
              <span className="text-[9px] text-amber-300/80 font-medium">勝敗が記録されました</span>
            </div>
          ) : (
            <div
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) setShowEffect(null);
              }}
              className="animate-record-pop bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-blue-500 shadow-[0_10px_40px_rgba(59,130,246,0.3)] rounded-3xl p-5 flex flex-col items-center gap-3.5 text-center max-w-[260px] w-full"
            >
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-400 rounded-full flex items-center justify-center text-3xl animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                ⚔️
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-blue-400 font-black">RECORDED</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-300 drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
                  LOSE
                </span>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-950 p-0.5">
                    <img src={showEffect.playerUrl} alt={showEffect.playerName} className="w-full h-full object-contain opacity-50" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 max-w-[60px] truncate">{showEffect.playerName}</span>
                </div>
                <span className="text-slate-500 text-xs font-black">VS</span>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-slate-950 p-0.5 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                    <img src={showEffect.oppUrl} alt={showEffect.oppName} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[9px] font-bold text-blue-400 max-w-[60px] truncate">{showEffect.oppName}</span>
                </div>
              </div>
              <span className="text-[9px] text-blue-300/80 font-medium">勝敗が記録されました</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
