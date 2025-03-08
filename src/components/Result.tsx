import { useState } from "react";

interface ResultProps {
  myWinCount: number;
  myLoseCount: number;
  results: any[];
  kekka: any;
  animateFirstItem: boolean;
  deleteMode: boolean;
}


export const Result: React.FC<ResultProps> = ({
  myWinCount, myLoseCount, results, kekka, animateFirstItem, deleteMode }) => {

  const [hoverRowIndex, setHoverRowIndex] = useState<number | null>(null)
  const hoverColor = deleteMode ? 'md:hover:bg-red-400' : 'md:hover:bg-gray-200';

  const deleteItem = (index: number) => {
    const isConfirmed = window.confirm('本当に削除しますか？');
    if (!isConfirmed) { return }

    const newMatches = results.filter(result => result !== results[index])
    kekka(newMatches);
  };

  // 連勝数を計算する関数
  const calculateStreak = () => {
    let streak = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].shouhai === '勝ち') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <>
      <div className="flex justify-between">
        <h1>今日の戦績 {myWinCount}勝{myLoseCount}敗</h1>
        <h1 className={`${calculateStreak() >= 2 ? 'inline-block' : 'hidden'} font-bold text-red-600`}>{calculateStreak()}連勝中！</h1>
      </div>
      <div className="h-44 w-60 bg-gray-100 border border-neutral-800 overflow-y-auto hide-scrollbar">
        <table className="w-full ">
          <thead className="bg-gray-400 text-white">
            <th className="px-5">自分</th>
            <th className="px-5">相手</th>
            <th className="px-5">結果</th>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr className={`cursor-pointer 
                    ${index === 0 && animateFirstItem ? "fadeIn" : ""} ${(hoverRowIndex === index) ? hoverColor : ''}`}
                key={index}
                onMouseEnter={() => setHoverRowIndex(index)}
                onMouseLeave={() => setHoverRowIndex(null)}
                onClick={() => deleteMode && deleteItem(index)}
              >
                <td className="px-5 py-1">
                  <img src={`${process.env.PUBLIC_URL}${result.player.imageUrl}`} alt={result.player.name} />
                </td>
                <td className="px-5 py-1">
                  <img src={`${process.env.PUBLIC_URL}${result.opponentPlayer.imageUrl}`} alt={result.opponentPlayer.name} />
                </td>
                <td className={`${result.shouhai === "勝ち" ? "text-red-600" : "text-blue-600"} text-center p-1`}>{result.shouhai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
