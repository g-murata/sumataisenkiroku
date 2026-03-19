import { useState } from "react";
import { MatchHistory, MatchResult } from '../types';
import { characterList } from "./Character";
// ★削除: MatchDetailModalのimportは不要になりました

interface ResultProps {
  // 親で計算済みのリストを受け取る
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
  onRowClick // ★受け取り
}) => {

  const [hoverRowIndex, setHoverRowIndex] = useState<number | null>(null);
  
  // ★削除: ここにあった isModalOpen や handleModalSave などのロジックは全て削除しました。

  // ▼ 勝敗数の計算
  const filteredWinCount = filteredMatches.filter(item => item.match.shouhai === "勝ち").length;
  const filteredLoseCount = filteredMatches.filter(item => item.match.shouhai === "負け").length;
  const totalFilteredMatches = filteredWinCount + filteredLoseCount;
  
  // ▼ 勝率の計算
  const winRate = totalFilteredMatches > 0 
    ? ((filteredWinCount / totalFilteredMatches) * 100).toFixed(1)
    : "0.0";

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


  return (
    <>
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center">
          <span className="px-5 font-bold text-lg whitespace-nowrap">
            {filteredWinCount}勝{filteredLoseCount}敗
            <span className="ml-2 text-gray-600 text-sm">({winRate}%)</span>
          </span>
          <span className={`${calculateStreak() >= 2 ? 'inline-block' : 'hidden'} font-bold text-red-600 animate-bounce ml-2`}>
            {calculateStreak()}連勝!
          </span>
        </div>
      </div>

      {/* ▼ フィルターUIエリア (配信モードでは非表示) */}
      {!haishin && (
        <div className="flex flex-col gap-2 mb-2 px-2 bg-gray-100 p-2 rounded">
          {/* 日付フィルター */}
          <div className="flex flex-col gap-2 w-full">
             <select
                aria-label="日付範囲"
                className="border rounded p-1 text-sm bg-white w-full font-bold text-gray-700 cursor-pointer hover:bg-gray-50"
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
                <div className="flex items-center gap-1 bg-white p-1 rounded border animate-fadeIn">
                  <input 
                    type="date" 
                    className="border rounded px-1 text-sm w-full"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                  <span className="text-gray-500">~</span>
                  <input 
                    type="date" 
                    className="border rounded px-1 text-sm w-full"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
             )}
          </div>

          {/* キャラフィルター */}
          <div className="flex gap-2 w-full items-center">
            <select 
              aria-label="自分の使用キャラ"
              className="border rounded p-1 text-sm bg-white w-1/2 cursor-pointer hover:bg-gray-50"
              value={filterMyCharId || ""}
              onChange={(e) => setFilterMyCharId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">自分の全キャラ</option>
              {characterList.map(c => (
                <option key={`my-${c.characterNo}`} value={c.characterNo}>{c.characterName}</option>
              ))}
            </select>
            <span className="text-gray-400 text-xs">vs</span>
            <select 
              aria-label="相手の使用キャラ"
              className="border rounded p-1 text-sm bg-white w-1/2 cursor-pointer hover:bg-gray-50"
              value={filterOppCharId || ""}
              onChange={(e) => setFilterOppCharId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">相手の全キャラ</option>
              {characterList.map(c => (
                <option key={`opp-${c.characterNo}`} value={c.characterNo}>{c.characterName}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ▼ 結果リスト表示 */}
      <div className={`${haishin ? 'h-auto' : 'h-80 md:h-4/5'} flex`}>
        <div className={`${haishin ? 'h-38' : 'h-full'} w-full bg-white border rounded-lg shadow-inner overflow-y-auto hide-scrollbar md:w-full`}>
          <table className="w-full table-fixed">
            <thead className="bg-gray-600 text-white text-xs">
              <tr>
                {!haishin && <th className="sticky top-0 bg-gray-600 z-10 w-16 py-2">日時</th>}
                <th className="sticky top-0 bg-gray-600 z-10 w-12">自分</th>
                <th className="sticky top-0 bg-gray-600 z-10 w-12">相手</th>
                <th className="sticky top-0 bg-gray-600 z-10 w-12">結果</th>
                {!haishin && <th className="sticky top-0 bg-gray-600 z-10">メモ</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map(({ match, originalIndex }, loopIndex) => (
                <tr className={`group cursor-pointer border-b border-gray-100 ${(hoverRowIndex === loopIndex) ? 'bg-blue-50' : ''}`}
                  key={originalIndex}
                  onMouseEnter={() => setHoverRowIndex(loopIndex)}
                  onMouseLeave={() => setHoverRowIndex(null)}
                  // ★修正: ここで親から渡された関数を実行！
                  onClick={() => onRowClick(originalIndex)}
                >
                  {!haishin &&
                    <td className="text-center text-xxs py-2 text-gray-500">
                      {formatJST(match.nichiji)}
                    </td>
                  }

                  <td className="py-1 text-center">
                    <img src={match.player?.imageUrl} alt={match.player?.characterName} className="h-8 w-8 mx-auto object-contain"/>
                  </td>

                  <td className="py-1 text-center">
                    <img src={match.opponentPlayer?.imageUrl} alt={match.opponentPlayer?.characterName} className="h-8 w-8 mx-auto object-contain"/>
                  </td>

                  <td className={`text-center font-bold text-sm ${match.shouhai === "勝ち" ? "text-red-500" : "text-blue-500"} p-1`}>
                    {match.shouhai}
                  </td>

                  {!haishin &&
                    <td className="py-2 px-2">
                       <p className="text-xs text-gray-600 truncate">{match.memo}</p>
                    </td>
                  }
                </tr>
              ))}
              {filteredMatches.length === 0 && (
                <tr>
                  <td 
                    colSpan={haishin ? 3 : 5} 
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    {filterDateRange === "custom" && (!customStartDate || !customEndDate) 
                      ? "期間を指定してください" 
                      : "条件に一致する記録がありません"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* ★削除: MatchDetailModal の配置も削除 */}
    </>
  )
}