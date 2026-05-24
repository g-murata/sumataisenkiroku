import { useState } from 'react';
import { createPortal } from 'react-dom';

import { supabase } from '../supabaseClient';
import { Character } from './Character';
import { Result } from './Result';
import { ResultAnimation } from './ResultAnimation';
import { CharacterType, MatchHistory, MatchResult } from '../types';

interface HomeProps {
  history: MatchHistory;
  onAddResult: (match: MatchResult) => void;
  onRowClick: (index: number) => void;
  onClearResults: () => void;
  user: any;
}

export const Home: React.FC<HomeProps> = ({ history, onAddResult, onRowClick, onClearResults, user }) => {
  // ▼ UI用のState
  const [selectedMyCharacter, setSelectedMyCharacter] = useState<CharacterType | null>(null);
  const [selectedOpponentCharacter, setSelectedOpponentCharacter] = useState<CharacterType | null>(null);
  
  const bothCharactersSelected = (selectedMyCharacter !== null && selectedOpponentCharacter !== null);

  // ▼ フィルター用State
  const [filterMyCharId, setFilterMyCharId] = useState<number | null>(null);
  const [filterOppCharId, setFilterOppCharId] = useState<number | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<"all" | "today" | "week" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // ▼ アニメーション制御用State
  const [showResultAnimation, setShowResultAnimation] = useState(false);
  const [lastResultForAnim, setLastResultForAnim] = useState<"勝ち" | "負け">("勝ち");

  // ★ PiPウインドウの状態管理
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // ▼ コピー通知State
  const [copied, setCopied] = useState(false);

  const STORAGE_KEY = "gameResults";

  // ----------------------------------------------------------------------
  // ★ Document Picture-in-Picture (PiP) を制御する関数
  // ----------------------------------------------------------------------
  const togglePip = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    if (!("documentPictureInPicture" in window)) {
      alert("このブラウザは対応していません。PC版ChromeまたはEdgeを使ってください。");
      return;
    }

    try {
      // @ts-ignore
      const win = await window.documentPictureInPicture.requestWindow({
        width: 260,
        height: 180,
      });

      win.document.title = "スマ対戦記録（OBS配信枠）";
      win.document.body.style.background = "#0a0a12";
      win.document.body.style.margin = "0";

      // 親ウインドウのCSS (Tailwindなど) をすべてコピーして適用する
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const newLink = document.createElement("link");
            newLink.rel = "stylesheet";
            newLink.href = styleSheet.href;
            win.document.head.appendChild(newLink);
          } else if (styleSheet.cssRules) {
            const newStyle = document.createElement("style");
            Array.from(styleSheet.cssRules).forEach((rule) => {
              newStyle.appendChild(document.createTextNode(rule.cssText));
            });
            win.document.head.appendChild(newStyle);
          }
        } catch (e) {
          console.error("Style copy error:", e);
        }
      });

      win.addEventListener("pagehide", () => {
        setPipWindow(null);
      });

      setPipWindow(win);

    } catch (err) {
      console.error("PiP failed:", err);
    }
  };

  // ----------------------------------------------------------------------
  // ▼ フィルタリングロジック
  const filteredMatchesWithIndex = history.matches
    .map((match, index) => ({ match, originalIndex: index }))
    .filter(({ match }) => {
      const isMyCharMatch = filterMyCharId ? match.player?.characterNo === filterMyCharId : true;
      const isOppCharMatch = filterOppCharId ? match.opponentPlayer?.characterNo === filterOppCharId : true;
      
      let isDateMatch = true;
      const matchDate = new Date(match.nichiji);
      const now = new Date();

      if (filterDateRange === "today") {
        isDateMatch = matchDate.toDateString() === now.toDateString();
      } else if (filterDateRange === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        isDateMatch = matchDate >= oneWeekAgo;
      } else if (filterDateRange === "custom") {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0); 
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999); 
          isDateMatch = matchDate >= start && matchDate <= end;
        }
      }
      return isMyCharMatch && isOppCharMatch && isDateMatch;
    });

  // ----------------------------------------------------------------------
  // ▼ データ移行ロジック
  const migrateData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインしてから実行してください！");
      return;
    }

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      alert("ローカルストレージにデータがありません。");
      return;
    }
    
    const parsedData = JSON.parse(storedData);
    const localMatches = parsedData.matches;

    if (localMatches.length === 0) {
      alert("移行するデータがありません。");
      return;
    }

    if (!window.confirm(`${localMatches.length}件のデータをDBに移行しますか？`)) {
      return;
    }

    const insertData = localMatches.map((m: any) => ({
      user_id: user.id,
      created_at: new Date(m.nichiji).toISOString(),
      date: new Date(m.nichiji).toISOString(),
      my_char_id: m.player.characterNo,
      opp_char_id: m.opponentPlayer.characterNo,
      my_char: m.player.characterName,
      opponent_char: m.opponentPlayer.characterName,
      result: m.shouhai,
      memo: m.memo || ""
    }));

    const { error } = await supabase.from('matches').insert(insertData);

    if (error) {
      alert(`移行エラー: ${error.message}`);
    } else {
      alert("🎉 移行が完了しました!");
      if (window.confirm("💻 続けて、移行元の対戦結果を一括削除しますか？")) {
        localStorage.removeItem(STORAGE_KEY);
        alert("移行元の対戦結果を削除しました。");
      }  
      window.location.reload();
    }
  };

  // ----------------------------------------------------------------------
  // ▼ 記録ロジック
  const recordResult = (shouhai: "勝ち" | "負け"): void => {
    setLastResultForAnim(shouhai);
    setShowResultAnimation(true);

    onAddResult({
      nichiji: new Date().toISOString(),
      player: selectedMyCharacter,
      opponentPlayer: selectedOpponentCharacter,
      shouhai,
      memo: ""
    });

    setSelectedOpponentCharacter(null);
  };

  // OBS配信URLコピー処理
  const handleCopyObsUrl = () => {
    const obsUrl = `${window.location.origin}${window.location.pathname}?mode=obs`;
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ★ Resultコンポーネントを描画する関数
  const renderResult = (isPipMode: boolean) => (
    <Result
      filteredMatches={filteredMatchesWithIndex}
      history={history}
      setHistory={() => {}}
      onRowClick={isPipMode ? () => {} : onRowClick}
      haishin={isPipMode}
      filterMyCharId={filterMyCharId}
      setFilterMyCharId={isPipMode ? () => {} : setFilterMyCharId}
      filterOppCharId={filterOppCharId}
      setFilterOppCharId={isPipMode ? () => {} : setFilterOppCharId}
      filterDateRange={filterDateRange}
      setFilterDateRange={isPipMode ? () => {} : setFilterDateRange}
      customStartDate={customStartDate}
      setCustomStartDate={isPipMode ? () => {} : setCustomStartDate}
      customEndDate={customEndDate}
      setCustomEndDate={isPipMode ? () => {} : setCustomEndDate}
    />
  );

  return (
    <>
      {showResultAnimation && (
        <ResultAnimation 
          result={lastResultForAnim} 
          mode="fixed"
          onComplete={() => setShowResultAnimation(false)}
        />
      )}

      <div className="flex flex-col justify-center items-center py-4 px-2 md:px-6">
        <div className="flex flex-col md:flex-row w-full max-w-7xl gap-6">
          
          {/* --- 🕹️ コントロールパネル / キャラ選択 & 入力 (左カラム) --- */}
          <div className="w-full md:w-[35%] flex flex-col gap-4">
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-slate-300 border-b border-white/5 pb-2 flex items-center gap-2">
                🎮 ファイターエントリー
              </h2>
              
              <div className="flex flex-col gap-4">
                <Character
                  player={"あなた"}
                  onSelectCharacter={setSelectedMyCharacter}
                  selectedCharacter={selectedMyCharacter}
                  matches={history.matches}
                />
                
                <div className="flex items-center justify-center -my-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent w-full relative">
                    <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-0.5 text-xxs font-extrabold text-slate-400 tracking-widest border border-white/10 rounded-full shadow">
                      VS
                    </span>
                  </div>
                </div>

                <Character
                  player={"相手"}
                  onSelectCharacter={setSelectedOpponentCharacter}
                  selectedCharacter={selectedOpponentCharacter}
                  matches={history.matches}
                />
              </div>
            </div>

            {/* --- 勝敗結果送信 (ゲームコントローラー風) --- */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
              {/* 勝敗ボタン (即座に記録するアーケードスタイル) */}
              <div className="flex justify-center items-center gap-3">
                <button
                  className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm text-white transition-all transform active:scale-95 flex items-center justify-center gap-1.5 ${
                    !bothCharactersSelected
                      ? "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_4px_15px_rgba(239,68,68,0.3)] border border-red-400"
                  }`}
                  onClick={() => recordResult("勝ち")}
                  disabled={!bothCharactersSelected}
                >
                  <i className="fas fa-trophy text-amber-400"></i> 勝ち
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm text-white transition-all transform active:scale-95 flex items-center justify-center gap-1.5 ${
                    !bothCharactersSelected
                      ? "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_15px_rgba(59,130,246,0.3)] border border-blue-400"
                  }`}
                  onClick={() => recordResult("負け")}
                  disabled={!bothCharactersSelected}
                >
                  <i className="fas fa-times-circle text-sky-400"></i> 負け
                </button>
              </div>
            </div>
          </div>
          
          {/* --- 📊 戦績タイムライン / 履歴 (中央カラム) --- */}
          <div className="w-full md:w-[35%] flex flex-col" id="win-lose-area">
            <div className="glass-panel p-5 rounded-2xl flex flex-col h-full min-h-[50vh] md:max-h-[85vh]">
              {renderResult(false)}
            </div>
          </div>

          {/* --- 🎥 配信コントロール & ツール (右カラム) --- */}
          <div className="w-full md:w-[30%] flex flex-col gap-4">
            
            {/* OBS配信用ランチャーカード */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-900/40 border border-white/10 group min-h-[16rem]">
              {/* 装飾用の光る球体背景 */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl transition-all group-hover:bg-indigo-600/20"></div>
              
              <div className="w-16 h-16 rounded-full bg-slate-950/60 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                <i className="fas fa-desktop text-2xl text-indigo-400 group-hover:scale-110 transition-transform"></i>
              </div>

              <h3 className="text-slate-200 font-extrabold text-base mb-1.5">OBS配信モード</h3>
              <p className="text-xxs text-slate-400 mb-5 leading-relaxed max-w-[15rem]">
                オーバーレイとして配信画面に直接配置できる、<br/>
                勝敗数同期型の別ウィンドウを立ち上げます。
              </p>

              <div className="flex flex-col gap-2 w-full max-w-[14rem]">
                {/* 専用ウィンドウ起動 */}
                <button 
                  onClick={togglePip}
                  className={`
                    w-full font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs
                    ${pipWindow 
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-500/30" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-400/20"}
                  `}
                >
                  {pipWindow ? (
                    <>
                      <i className="fas fa-window-close text-red-400"></i> ウィンドウを閉じる
                    </>
                  ) : (
                    <>
                      <i className="fas fa-external-link-alt text-indigo-300"></i> 専用ウィンドウを開く
                    </>
                  )}
                </button>

                {/* OBSリンクコピー */}
                <button
                  onClick={handleCopyObsUrl}
                  className={`
                    w-full py-2 px-4 rounded-xl text-xxs font-bold border transition-all flex items-center justify-center gap-1.5
                    ${copied 
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                      : "bg-slate-950/50 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800/80 hover:border-white/10"}
                  `}
                >
                  {copied ? (
                    <>
                      <i className="fas fa-check text-emerald-400"></i> コピー完了！
                    </>
                  ) : (
                    <>
                      <i className="fas fa-copy"></i> OBS配信用URLをコピー
                    </>
                  )}
                </button>

                {/* 連動に関するヘルプテキスト */}
                <p className="text-[9px] text-slate-500 mt-2 text-left leading-relaxed border-t border-white/5 pt-2">
                  <i className="fas fa-info-circle text-indigo-400/80 mr-1"></i>
                  <strong>リアルタイム連動の注意:</strong><br />
                  勝敗スコアやスタンプアニメを即時同期するには、「専用ウィンドウ」を開いておく必要があります。邪魔な場合はウィンドウを最小サイズに縮小し、画面の端などに置いておけばOKです！
                </p>
              </div>
            </div>

            {/* 一括削除 & 移行等のシステムボタン群 */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col gap-2 bg-slate-900/30">
              <button 
                className="py-2 px-4 bg-slate-950/40 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-900/40 rounded-xl text-xxs font-bold transition-all w-full flex items-center justify-center gap-1.5" 
                onClick={onClearResults}
              >
                <i className="fas fa-trash-alt"></i> 全対戦記録の一括削除
              </button>
              
              {user && localStorage.getItem(STORAGE_KEY) && (
                <button 
                  className="py-2 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xxs font-bold transition-all w-full shadow-md flex items-center justify-center gap-1.5 border border-orange-500/30 animate-pulse"
                  onClick={migrateData}
                >
                  <i className="fas fa-laptop-medical"></i> ローカル履歴をクラウドDBへ移行する
                </button>
              )}
            </div>
            
            {/* PiPウインドウへの転送ポータル */}
            {pipWindow && createPortal(
              <div className="h-full bg-[#07070d] text-white flex flex-col justify-between p-3.5 overflow-hidden relative select-none font-sans border border-white/5 box-border">
                {/* 🟢 Live Sync Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,1)]"></span>
                    </span>
                    <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase animate-pulse">
                      LIVE SYNC ACTIVE
                    </span>
                  </div>
                  {/* 連勝インジケータ */}
                  {(() => {
                    let streak = 0;
                    for (const m of history.matches || []) {
                      if (m.shouhai === "勝ち") streak++;
                      else break;
                    }
                    return streak >= 2 ? (
                      <div className="flex items-center gap-0.5 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded-md text-[8px] font-black text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)] animate-pulse">
                        🔥 {streak}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* 📊 Score display (Big and beautiful) */}
                <div className="flex flex-col items-center justify-center my-1">
                  <div className="flex items-baseline gap-1 font-black leading-none">
                    <span className="text-3xl text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      {history.winCount ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold mx-0.5">W</span>
                    <span className="text-slate-600 text-lg">-</span>
                    <span className="text-3xl text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] ml-1">
                      {history.loseCount ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold mx-0.5">L</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">
                    WIN RATE: {(() => {
                      const total = (history.winCount ?? 0) + (history.loseCount ?? 0);
                      return total > 0 ? (((history.winCount ?? 0) / total) * 100).toFixed(1) : "0.0";
                    })()}%
                  </span>
                </div>

                {/* ⚠️ Warning and guide message */}
                <div className="bg-slate-950/60 border border-white/5 p-1.5 rounded-lg text-[8px] text-slate-500 text-center leading-relaxed">
                  <i className="fas fa-info-circle text-indigo-400 mr-0.5 animate-pulse"></i>
                  連動用ウィンドウです。画面の端等に縮めて置いてください。
                </div>

                {/* Win / Lose Stamp Overlay */}
                {showResultAnimation && (
                  <div className="absolute inset-0 bg-[#07070d]/80 backdrop-blur-xs flex items-center justify-center animate-fadeIn z-50">
                    <ResultAnimation 
                      result={lastResultForAnim} 
                      mode="absolute"
                    />
                  </div>
                )}
              </div>,
              pipWindow.document.body
            )}
          </div>
        </div>
      </div>
    </>
  );
};