import { useState } from "react";
import { MatchHistory, MatchResult } from '../types';
import { characterList } from "./Character";

interface ResultProps {
  filteredMatches: { match: MatchResult; originalIndex: number }[];
  history: MatchHistory;
  setHistory: any;
  haishin: boolean;

  // フィルター操作用関数
  filterMyCharId: number | null;
  setFilterMyCharId: (id: number | null) => void;
  filterOppCharId: number | null;
  setFilterOppCharId: (id: number | null) => void;
  
  // 日付フィルター型定義更新
  filterDateRange: "all" | "today" | "week" | "custom";
  setFilterDateRange: (range: "all" | "today" | "week" | "custom") => void;
  
  // カスタム日付用
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;

  // ★追加: 行がクリックされたことを親に伝える関数
  onRowClick: (index: number) => void;
}

export const Result: React.FC<ResultProps> = ({ 
  filteredMatches, 
  history, setHistory, haishin,
  filterMyCharId, setFilterMyCharId,
  filterOppCharId, setFilterOppCharId,
  filterDateRange, setFilterDateRange,
  customStartDate, setCustomStartDate,
  customEndDate, setCustomEndDate,
  onRowClick
}) => {

  const [hoverRowIndex, setHoverRowIndex] = useState<number | null>(null);
  
  // ▼ 勝敗数の計算
  const filteredWinCount = filteredMatches.filter(item => item.match.shouhai === "勝ち").length;
  const filteredLoseCount = filteredMatches.filter(item => item.match.shouhai === "負け").length;
  const totalFilteredMatches = filteredWinCount + filteredLoseCount;
  
  // ▼ 勝率の計算
  const winRateNum = totalFilteredMatches > 0 ? (filteredWinCount / totalFilteredMatches) * 100 : 0;
  const winRate = winRateNum.toFixed(1);

  // ▼ 連勝数を計算
  const calculateStreak = () => {
    let streak = 0;
    for (let i = 0; i < filteredMatches.length; i++) {
      if (filteredMatches[i].match.shouhai === '勝ち') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const formatJST = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
  };

  const streakCount = calculateStreak();

  return (
    <div className="flex flex-col h-full gap-3">
      {/* --- 戦績統計ヘッダー --- */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-slate-200">
              <span className="text-red-400 font-black">{filteredWinCount}</span> 
              <span className="text-slate-400 text-xs mx-1">W</span>
              <span className="text-slate-500 text-xs">-</span>
              <span className="text-blue-400 font-black ml-1">{filteredLoseCount}</span> 
              <span className="text-slate-400 text-xs mx-1">L</span>
            </span>
            <span className="text-xs font-bold text-slate-400">({winRate}%)</span>
          </div>

          {streakCount >= 2 && (
            <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full animate-bounce">
              <span className="text-xs">🔥</span>
              <span className="text-[10px] font-black tracking-wider neon-text-gold">
                {streakCount}連勝中!
              </span>
            </div>
          )}
        </div>

        {/* --- ネオンスプリットプログレスバー --- */}
        <div className="w-full h-2.5 bg-slate-950/60 rounded-full border border-white/5 overflow-hidden flex relative">
          {totalFilteredMatches > 0 ? (
            <>
              <div 
                className="h-full winrate-gradient-win transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                style={{ width: `${winRateNum}%` }}
              ></div>
              <div 
                className="h-full winrate-gradient-lose transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                style={{ width: `${100 - winRateNum}%` }}
              ></div>
              {/* スプリット中点光るインジケータ */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] z-10 transition-all duration-500"
                style={{ left: `${winRateNum}%` }}
              ></div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-800 transition-all duration-500"></div>
          )}
        </div>
      </div>

      {/* ▼ フィルターUIエリア (配信モードでは非表示) */}
      {!haishin && (
        <div className="flex flex-col gap-2 p-3 bg-slate-950/40 border border-white/5 rounded-xl">
          {/* 日付フィルター */}
          <div className="flex flex-col gap-2 w-full">
             <select
                className="glass-input text-xs w-full font-bold cursor-pointer"
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value as any)}
             >
               <option value="all">📅 全期間</option>
               <option value="today">🔥 今日</option>
               <option value="week">📅 直近1週間</option>
               <option value="custom">🛠️ 期間指定</option>
             </select>

             {/* ▼ 期間指定が選ばれた時だけ表示される日付ピッカー */}
             {filterDateRange === "custom" && (
                <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-white/5 animate-fadeIn">
                  <input 
                    type="date" 
                    className="glass-input py-1 px-1.5 text-xxs w-full bg-transparent border-none text-slate-200"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                  <span className="text-slate-600 text-xs">~</span>
                  <input 
                    type="date" 
                    className="glass-input py-1 px-1.5 text-xxs w-full bg-transparent border-none text-slate-200"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
             )}
          </div>

          {/* キャラフィルター */}
          <div className="flex gap-2 w-full items-center">
            <select 
              className="glass-input text-xxs w-1/2 cursor-pointer"
              value={filterMyCharId || ""}
              onChange={(e) => setFilterMyCharId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">👤 自分の全キャラ</option>
              {characterList.map(c => (
                <option key={`my-${c.characterNo}`} value={c.characterNo}>{c.characterName}</option>
              ))}
            </select>
            <span className="text-slate-600 text-[10px] font-bold">vs</span>
            <select 
              className="glass-input text-xxs w-1/2 cursor-pointer"
              value={filterOppCharId || ""}
              onChange={(e) => setFilterOppCharId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">⚔️ 相手の全キャラ</option>
              {characterList.map(c => (
                <option key={`opp-${c.characterNo}`} value={c.characterNo}>{c.characterName}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ▼ タイムライン / 対戦結果カードリスト */}
      <div className={`flex-grow overflow-hidden ${haishin ? 'h-[160px]' : 'h-full md:max-h-[50vh] lg:max-h-[60vh]'} flex flex-col`}>
        <div className="flex-grow overflow-y-auto hide-scrollbar pr-1 flex flex-col gap-2">
          {filteredMatches.map(({ match, originalIndex }, loopIndex) => {
            const isWin = match.shouhai === "勝ち";
            const borderGlow = isWin
              ? "border-red-500/10 hover:border-red-500/40 bg-red-950/5"
              : "border-blue-500/10 hover:border-blue-500/40 bg-blue-950/5";

            return (
              <div 
                key={originalIndex}
                className={`p-2.5 rounded-xl glass-panel flex items-center justify-between border cursor-pointer transition-all duration-200 ${borderGlow} ${
                  hoverRowIndex === loopIndex ? 'scale-[1.01] bg-slate-900/60' : ''
                }`}
                onMouseEnter={() => setHoverRowIndex(loopIndex)}
                onMouseLeave={() => setHoverRowIndex(null)}
                onClick={() => onRowClick(originalIndex)}
              >
                {/* 左側: ファイターアバター対面 */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-1.5">
                    {/* 自分アバター */}
                    <div className={`w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center p-0.5 z-10 ${
                      isWin ? "border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]" : "border-slate-800"
                    }`}>
                      <img src={match.player?.imageUrl} alt={match.player?.characterName} className="w-full h-full object-contain" />
                    </div>
                    
                    <span className="text-[8px] text-slate-500 font-extrabold bg-slate-950 border border-white/5 px-1 rounded-md z-20 scale-90">VS</span>

                    {/* 相手アバター */}
                    <div className={`w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center p-0.5 ${
                      isWin ? "border-slate-800" : "border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    }`}>
                      <img src={match.opponentPlayer?.imageUrl} alt={match.opponentPlayer?.characterName} className="w-full h-full object-contain" />
                    </div>
                  </div>

                  {/* キャラクター名 & 日時 (配信モードでは非表示) */}
                  {!haishin && (
                    <div className="flex flex-col">
                      <div className="text-[10px] font-bold text-slate-200 leading-tight">
                        {match.player?.characterName} <span className="text-slate-600 font-normal">vs</span> {match.opponentPlayer?.characterName}
                      </div>
                      <div className="text-[8px] text-slate-500 mt-0.5">
                        {formatJST(match.nichiji)}
                      </div>
                    </div>
                  )}
                </div>

                {/* メモプレビュー (配信モードでは非表示) */}
                {!haishin && match.memo && (
                  <div className="hidden sm:block flex-grow mx-4 max-w-[40%] text-left">
                    <p className="text-[9px] text-slate-400 truncate bg-slate-950/40 px-2 py-0.5 rounded border border-white/5">
                      📝 {match.memo}
                    </p>
                  </div>
                )}

                {/* 右側: 結果バッジ */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    isWin 
                      ? "bg-red-500/10 text-red-400 border-red-500/30 neon-text-win" 
                      : "bg-blue-500/10 text-blue-400 border-blue-500/30 neon-text-lose"
                  }`}>
                    {isWin ? "WIN" : "LOSE"}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredMatches.length === 0 && (
            <div className="glass-panel border-dashed border-white/5 py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <span className="text-lg">📭</span>
              <span>
                {filterDateRange === "custom" && (!customStartDate || !customEndDate) 
                  ? "期間を指定してください" 
                  : "条件に一致する対戦記録がありません"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};