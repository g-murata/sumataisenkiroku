interface ResultProps {
  myWinCount: number;
  myLoseCount: number;
  results: any[];
  animateFirstItem: boolean;
}


export const Result: React.FC<ResultProps> = ({myWinCount, myLoseCount, results, animateFirstItem}) => {

  return (
    <>
      <div className="">
        <h1>今日の戦績 {myWinCount}勝{myLoseCount}敗</h1>
        {results.length > 0 &&
          <> 
            <div className="bg-white border border-neutral-800 max-h-32 w-60 overflow-y-auto hide-scrollbar">
              {results.map((result, index) => (
                <div className={index === 0 && animateFirstItem ? "fadeIn" : ""} key={index}>
                <div className="bg-white border border-neutral-400 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ">
                    <div className="flex p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                      <img src={`${process.env.PUBLIC_URL}${result.player.imageUrl}`} alt={result.player.name} />
                      <label>VS</label>
                      <img src={`${process.env.PUBLIC_URL}${result.opponentPlayer.imageUrl}`} alt={result.opponentPlayer.name} />
                      <label >{result.shouhai}</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
          }
      </div>
    </>
  )
}