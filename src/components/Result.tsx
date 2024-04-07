import { useState } from "react";

interface ResultProps {
  myWinCount: number;
  myLoseCount: number;
  results: any[];
  setResults: any;
  setMyWinCount: any;
  setMyLoseCount: any;
  renshouCount: number;
  setRenshouCount: any;
  animateFirstItem: boolean;
  deleteMode: boolean;
}


export const Result: React.FC<ResultProps> = ({
  myWinCount, myLoseCount, results, setResults, setMyWinCount, setMyLoseCount, renshouCount, setRenshouCount, animateFirstItem, deleteMode }) => {

  const [hoverRowIndex, setHoverRowIndex] = useState<number | null>(null)
  const hoverColor = deleteMode ? 'md:hover:bg-red-400' : 'md:hover:bg-gray-200';

  const deleteItem = (index: number) => {
    const isConfirmed = window.confirm('本当に削除しますか？');
    if (!isConfirmed) { return }

    // 勝敗カウントリセット
    if (results[index].shouhai === "勝ち") {
      setMyWinCount((myWinCount: number) => myWinCount - 1)
      // 連勝カウントのリセット（renshouCountがindexより大きい時のみ連勝カウントを-1する。 ■勝敗レコードの要素は最新が0からスタートしている。）
      renshouCount > index && setRenshouCount((renshouCount: number) => renshouCount - 1)
    } else {
      setMyLoseCount((myLoseCount: number) => myLoseCount - 1)
    }

    setResults(results.filter(result => result !== results[index]));
  };

  return (
    <>
      <div className="flex justify-between">
        <h1>今日の戦績 {myWinCount}勝{myLoseCount}敗</h1>
        <h1 className={`${renshouCount > 1 ? 'inline-block' : 'hidden'} font-bold text-red-600`}>{renshouCount}連勝中！</h1>
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
