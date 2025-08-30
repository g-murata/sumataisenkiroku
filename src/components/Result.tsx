import { useState } from "react";

interface ResultProps {
  myWinCount: number;
  myLoseCount: number;
  history: any;
  setHistory: any;
  animateFirstItem: boolean;
}


export const Result: React.FC<ResultProps> = ({
  myWinCount, myLoseCount, history, setHistory, animateFirstItem}) => {

  const [hoverRowIndex, setHoverRowIndex] = useState<number | null>(null)

  const deleteItem = (index: number) => {
    const isConfirmed = window.confirm('本当に削除しますか？');
    if (!isConfirmed) { return }

    const newMatches = history.matches.filter((matche: any) =>
      matche !== history.matches[index]
    )    
    setHistory((prevResults: any) => ({
      matches: newMatches,  // 試合履歴を追加
      winCount: prevResults.matches[index].shouhai === "勝ち" ? history.winCount - 1 : history.winCount,  // 勝ち数更新
      loseCount: prevResults.matches[index].shouhai === "負け" ? history.loseCount - 1 : history.loseCount,  // 負け数更新
    }));     
  };

  // 連勝数を計算する関数
  const calculateStreak = () => {
    let streak = 0;
    for (let i = 0; i < history.matches.length; i++) {
      if (history.matches[i].shouhai === '勝ち') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const updateMemo = (index: number, newMemo: string) => {
    setHistory((prev: any) => {
      const newMatches = [...prev.matches];
      newMatches[index] = { ...newMatches[index], memo: newMemo };
      return { ...prev, matches: newMatches };
    });
  };


  return (
    <>
      <div className="">
        <span className="px-5">戦績 {myWinCount}勝{myLoseCount}敗</span>
        <span className={`${calculateStreak() >= 2 ? 'inline-block' : 'hidden'} font-bold text-red-600`}>{calculateStreak()}連勝中！</span>
      </div>
      <div className="h-48 w-96 bg-gray-100 overflow-y-auto hide-scrollbar md:w-full">
        <table className="w-full ">
          <thead className="bg-gray-400 text-white">
            <th className="px-5 sticky top-0 bg-gray-400 z-10 md:w-24">自分</th>
            <th className="px-5 sticky top-0 bg-gray-400 z-10 md:w-24">相手</th>
            <th className="px-5 sticky top-0 bg-gray-400 z-10 md:w-24">結果</th>
            <th className="px-5 sticky top-0 bg-gray-400 z-10 md:w-60">メモ</th>
            <th className="px-2 sticky top-0 bg-gray-400 z-10"></th>
          </thead>
          <tbody>
            {history.matches.map((matche: any, index: number) => (
              <tr className={`group cursor-pointer 
                    ${index === 0 && animateFirstItem ? "fadeIn" : ""} ${(hoverRowIndex === index) ? 'md:hover:bg-gray-200' : ''}`}
                key={index}
                onMouseEnter={() => setHoverRowIndex(index)}
                onMouseLeave={() => setHoverRowIndex(null)}
              >
                <td className="px-5 py-1">
                  <img src={`${process.env.PUBLIC_URL}${matche.player.imageUrl}`} alt={matche.player.name} />
                </td>
                <td className="px-5 py-1">
                  <img src={`${process.env.PUBLIC_URL}${matche.opponentPlayer.imageUrl}`} alt={matche.opponentPlayer.name} />
                </td>
                <td className={`${matche.shouhai === "勝ち" ? "text-red-600" : "text-blue-600"} text-center p-1`}>{matche.shouhai}</td>
                <td className="py-1">
                  <textarea
                    value={matche.memo || ""}
                    onChange={(e) => updateMemo(index, e.target.value)}
                    placeholder="対戦の反省を書こう"
                    rows={3} // 行数調整
                    className="w-full border rounded px-2 py-1 text-sm resize-y"
                  />
                </td>
                <td className="text-center text-xxs md:text-xs">
                  <button className="md:hidden group-hover:inline-block text-red-600" onClick={() => deleteItem(index)}>◀</button>
                </td>                 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
