import { useState } from 'react';
import { useEffect } from 'react';

import { Header } from '../components/Header';
import { Charactar } from './Charactar';
// import { Setting } from './Setting';
import { Result } from './Result'


export const Home = () => {
  const [selectedMyChara, setSelectedMyChara] = useState<number | null>(null);
  const [selectedOpponentChara, setSelectedOpponentChara] = useState<number | null>(null);
  const bothCharactersSelected = (selectedMyChara !== null && selectedOpponentChara !== null);

  // 🏆 個々の試合の記録
  interface MatchResult {
    player: any;
    opponentPlayer: any;
    shouhai: any;
  }

// 📊 全体の試合履歴 & 勝敗数を管理するオブジェクト
  interface MatchHistory {
    matches: MatchResult[];
    winCount: number;
    loseCount: number;
  }

  const STORAGE_KEY = "gameResults";
  const [history, setHistory] = useState<MatchHistory>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {matches: [], winCount: 0, loseCount: 0 };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // console.log(history)

  const clearResults = () => {
    const isConfirmed = window.confirm('本当にリセットしますか？');
    if (!isConfirmed) { return } 

    localStorage.removeItem(STORAGE_KEY);
    setHistory({matches: [], winCount: 0, loseCount: 0}); // ステートもクリア
  }

  const comingSoon = () => {
    alert("coming soon...")    
  }

  const [animateFirstItem, setAnimateFirstItem] = useState(false);
  const [winOrLose, setWinOrLose] = useState<boolean>(true)

  const kekka = (player: any, opponentPlayer: any, shouhai: any) => {
    setHistory(prevResults => ({
      matches: [{ player, opponentPlayer, shouhai }, ...prevResults.matches],  // 試合履歴を追加
      winCount: shouhai === "勝ち" ? prevResults.winCount + 1 : prevResults.winCount,  // 勝ち数更新
      loseCount: shouhai === "負け" ? prevResults.loseCount + 1 : prevResults.loseCount,  // 負け数更新
    }));    
  };

  const versusWinResult = () => {
    setAnimateFirstItem(false);
    kekka(selectedMyChara, selectedOpponentChara, "勝ち")

    setSelectedOpponentChara(null);
  };

  const versusopponentPlayeresult = () => {
    setAnimateFirstItem(false);
    kekka(selectedMyChara, selectedOpponentChara, "負け")

    setSelectedOpponentChara(null);
    setWinOrLose(true);
  };

  const backgroundColorClass = (event: any, color: any) => {
    if (event === true) {
      switch (color) {
        case "red":
          return "bg-red-500"
        case "blue":
          return "bg-blue-500"
        case "green":
          return "bg-green-500 hover:bg-green-600"
        default:
          return "bg-gray-500"
      }
    } else {
      return `bg-gray-400 hover:bg-gray-500`;
    }
  };

  // 最初の要素にのみアニメーションを適用するためのフラグを設定
  useEffect(() => {
    if (history.matches.length > 0) {
      setAnimateFirstItem(true);
    }
  }, [history.matches]);

  return (
    <>
      <Header />
      <div className="flex flex-col justify-center items-center">
        <div className="md:flex">
          <div className="w-full md:w-1/3">
            <div className= "px-5 py-2">
              <div>
                <Charactar
                  player={"あなた"}
                  onSelectChara={setSelectedMyChara}
                  selectedChara={selectedMyChara}
                />
              </div>
              <div>
                <Charactar
                  player={"相手"}
                  onSelectChara={setSelectedOpponentChara}
                  selectedChara={selectedOpponentChara}
                />
              </div>
            </div>
          <div className="">
            <div className="">
              <div className="flex justify-center items-center">
                <button
                  className={`${backgroundColorClass(winOrLose, "red")} text-white font-bold m-2 py-4 px-8 rounded`}
                  onClick={() => setWinOrLose(true)}
                  disabled={!bothCharactersSelected}
                >
                  勝ち
                </button>
                <button
                  className={`${backgroundColorClass(!winOrLose, "blue")} text-white font-bold m-2 py-4 px-8 rounded`}
                  onClick={() => setWinOrLose(false)}
                  disabled={!bothCharactersSelected}
                >
                  負け
                </button>
              </div>                
            </div>
              <div className="flex justify-center items-center py-5">
                <button className={`${backgroundColorClass((bothCharactersSelected), "green")} text-white font-bold mx-5 py-4 px-10 rounded`}
                  onClick={() => winOrLose ? versusWinResult() : versusopponentPlayeresult()}
                  disabled={!bothCharactersSelected}
                >
                  結果送信
                </button>
              </div>
          </div>

          </div>          
          <div className="md:h-90vh flex flex-col px-10" id= "win-lose-area">
            <Result
              myWinCount={history.winCount}
              myLoseCount={history.loseCount}
              history={history}
              setHistory={setHistory}
              animateFirstItem={animateFirstItem}
              haishin={false}
            />
          </div>

          <div className="md:h-90vh flex flex-col px-10 mt-auto">
            <div className="hidden md:block h-4/5" id= "win-lose-area-haishin">
              <Result
                myWinCount={history.winCount}
                myLoseCount={history.loseCount}
                history={history}
                setHistory={setHistory}
                animateFirstItem={animateFirstItem}
                haishin={true}
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <button className="py-5" onClick={clearResults}>勝敗記録一括削除</button>

              {/* <div>
                <h1>👷‍♂️coming soon...</h1>
                <span>キャラおまかせルーレット</span>
                <img 
                  src={`${process.env.PUBLIC_URL}/fighter/mario.png`} alt={"TODO:はてなマークが良いな。"}>
                </img> 
              </div>
              <h1>オプション：</h1>
              <span className="" onClick={comingSoon}>削除確認ON/OFF</span> */}
            </div>
          </div>

        </div>
      </div>        
    </>
  )
}
