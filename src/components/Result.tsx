import { useState } from "react";

interface ResultProps {
  myWinCount: number;
  myLoseCount: number;
  results: any[];
  setResults: any;
  setMyWinCount: any;
  setMyLoseCount: any;
  animateFirstItem: boolean;
}


export const Result: React.FC<ResultProps> = ({myWinCount, myLoseCount, results, setResults, setMyWinCount, setMyLoseCount, animateFirstItem}) => {

  const [hoverRowIndex, setHoverRowIndex] = useState<number | null>(null)

  const deleteItem = (index :number) => {

    // 勝敗カウントリセット
    if (results[index].shouhai === "勝ち"){
      setMyWinCount((myWinCount :number) => myWinCount - 1) 
    }else{
      setMyLoseCount((myLoseCount :number) => myLoseCount - 1)       
    }

    setResults(results.filter(result => result !== results[index]));
  };

  return (
    <>
      <h1>今日の戦績 {myWinCount}勝{myLoseCount}敗</h1>
        <div className="h-32 w-60 bg-gray-100 border border-neutral-800 overflow-y-auto hide-scrollbar">
          <table className="w-full ">
            <thead className="bg-gray-400 text-white">
              <th className="px-5">自分</th>
              <th className="px-5">相手</th>
              <th className="px-5">結果</th>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr className={`cursor-pointer 
                    ${index === 0 && animateFirstItem ? "fadeIn" : ""} ${hoverRowIndex === index ? 'bg-gray-200' : ''}`} 
                    key={index}
                    onMouseEnter={() => setHoverRowIndex(index)}
                    onMouseLeave={() => setHoverRowIndex(null)}
                    onClick={() => deleteItem(index)}
                >                  
                  <td className="px-5 py-1">
                    <img src={`${process.env.PUBLIC_URL}${result.player.imageUrl}`} alt={result.player.name} />
                  </td>                  
                  <td className="px-5 py-1">
                    <img src={`${process.env.PUBLIC_URL}${result.opponentPlayer.imageUrl}`} alt={result.opponentPlayer.name} />
                  </td>                
                  <td className={`${result.shouhai === "勝ち" ? "text-blue-600 " : "text-red-600 "} text-center p-1`}>{result.shouhai}</td>                
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </>
  )
}