import { useState } from 'react';
import { useEffect } from 'react';

// import { Header } from '../components/Header';
import { Charactar } from './Charactar';
import {Result} from './Result'
import { Footer } from '../components/Footer';


export const Home = () => {
  const [selectedMyChara, setSelectedMyChara] = useState<number | null>(null);
  const [selectedOpponentChara, setSelectedOpponentChara] = useState<number | null>(null);
  const bothCharactersSelected = selectedMyChara && selectedOpponentChara;

  const [myWinCount, setMyWinCount] = useState(0);
  const [myLoseCount, setMyLoseCount] = useState(0);

  interface MatchResult {
    player: any;
    opponentPlayer: any;
    shouhai: any;
  }
  
  const [results, setResults] = useState<MatchResult[]>([]);
  const [animateFirstItem, setAnimateFirstItem] = useState(false);

  const kekka = (player: any, opponentPlayer:any, shouhai:any) => {
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
  };

  // 最初の要素にのみアニメーションを適用するためのフラグを設定
  useEffect(() => {
    if (results.length > 0) {
      setAnimateFirstItem(true);
    }
  }, [results]);

  return (
    <>
      {/* <Header /> */}
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="w-7/12"> 
          <div className="flex">
            <div>  
              <label>使用キャラ</label>
              <Charactar
                player={"あなた"}
                onSelect={setSelectedMyChara} 
                selectChara={selectedMyChara}
              />
            </div>

            <div>
              <label>相手キャラ</label>
              <Charactar 
                player={"相手"}
                onSelect={setSelectedOpponentChara}  
                selectChara={selectedOpponentChara}                
              />
            </div>
          </div>
        </div>
        <div className="py-5"> 
          <div className="flex">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold mx-5 py-4 px-8 rounded"
              onClick={() => versusWinResult()}
              disabled={!bothCharactersSelected}
            >
              勝ち
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold mx-5 py-4 px-8 rounded"
              onClick={() => versusopponentPlayeresult()}
              disabled={!bothCharactersSelected}
            >
              負け
            </button>
          </div>
        </div>

        <div className="py-5"> 
          <Result 
            myWinCount={myWinCount}
            myLoseCount={myLoseCount}
            results={results}
            animateFirstItem={animateFirstItem}
          />
        </div>

        <div className="py-5"> 
          <Footer />
        </div>
      </div>
    </>
  )
}