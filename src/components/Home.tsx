import { useState } from 'react';
import { useEffect } from 'react';

import { Header } from '../components/Header';
import { Charactar } from './Charactar';
// import { Setting } from './Setting';
import { Result } from './Result'
import { Footer } from '../components/Footer';


export const Home = () => {
  const [selectedMyChara, setSelectedMyChara] = useState<number | null>(null);
  const [selectedOpponentChara, setSelectedOpponentChara] = useState<number | null>(null);
  const bothCharactersSelected = (selectedMyChara !== null && selectedOpponentChara !== null);

  const [myWinCount, setMyWinCount] = useState(0);
  const [myLoseCount, setMyLoseCount] = useState(0);

  const [deleteMode, setdeleteMode] = useState<boolean>(false)

  interface MatchResult {
    player: any;
    opponentPlayer: any;
    shouhai: any;
  }

  const STORAGE_KEY = "gameResults";
  const [results, setResults] = useState<MatchResult[]>(() => { 
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    console.log("useEffect後")
    console.log(results)
  }, [results]);

  const clearResults = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResults([]); // ステートもクリア
  }

  const [animateFirstItem, setAnimateFirstItem] = useState(false);
  const [winOrLose, setWinOrLose] = useState<boolean>(true)

  const kekka = (player: any, opponentPlayer: any, shouhai: any) => {
    setResults(prevResults => [{ player, opponentPlayer, shouhai }, ...prevResults]);
  }


  const versusWinResult = () => {
    setAnimateFirstItem(false);
    setMyWinCount(prevCount => prevCount + 1)
    kekka(selectedMyChara, selectedOpponentChara, "勝ち")

    setSelectedOpponentChara(null);
  };

  const versusopponentPlayeresult = () => {
    setAnimateFirstItem(false);
    setMyLoseCount(prevCount => prevCount + 1)
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
    if (results.length > 0) {
      setAnimateFirstItem(true);
    }
  }, [results]);

  return (
    <>
      <Header />
      <div className="flex flex-col justify-center items-center">
        <div className="py-5 w-4/5 md:w-3/5">
          <div className="md:flex">
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
        </div>

        <div className="py-5">
          <div className="flex">
            <button
              className={`${backgroundColorClass(winOrLose, "red")} text-white font-bold mx-5 py-4 px-8 rounded`}
              onClick={() => setWinOrLose(true)}
              disabled={!bothCharactersSelected}
            >
              勝ち
            </button>
            <button
              className={`${backgroundColorClass(!winOrLose, "blue")} text-white font-bold mx-5 py-4 px-8 rounded`}
              onClick={() => setWinOrLose(false)}
              disabled={!bothCharactersSelected}
            >
              負け
            </button>
          </div>
        </div>
        <button className={`${backgroundColorClass((bothCharactersSelected), "green")} text-white font-bold mx-5 py-4 px-8 rounded`}
          onClick={() => winOrLose ? versusWinResult() : versusopponentPlayeresult()}
          disabled={!bothCharactersSelected}
        >
          結果送信
        </button>
        
        <div className="py-5">
          <Result
            myWinCount={myWinCount}
            myLoseCount={myLoseCount}
            results={results}
            setResults={setResults}
            setMyWinCount={setMyWinCount}
            setMyLoseCount={setMyLoseCount}
            animateFirstItem={animateFirstItem}
            deleteMode={deleteMode}
          />
        </div>

        <div className="py-5">
          <Footer
            deleteMode={deleteMode}
            setdeleteMode={setdeleteMode}
          />
        </div>

        <button onClick={clearResults}>勝敗記録リセット</button>

      </div>
    </>
  )
}
