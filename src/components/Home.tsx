import { useState } from 'react';
// import { Header } from '../components/Header';
import { Charactar } from './Charactar';
import {Result} from './Result'
import { Footer } from '../components/Footer';


export const Home = () => {
  const [selectedMyChara, setSelectedMyChara] = useState<number | null>(null);
  const [selectedOpponentChara, setSelectedOpponentChara] = useState<number | null>(null);
  const bothCharactersSelected = selectedMyChara && selectedOpponentChara;

  const versusWinResult = (selectedMyChara : any, selectedOpponentChara  : any) => {

    alert(`${selectedMyChara.name} VS ${selectedOpponentChara.name} あんたの勝ちィ！！`)    
    setSelectedOpponentChara(null);
  };

  const versusLoseResult = (selectedMyChara : any, selectedOpponentChara  : any) => {

    alert(`${selectedMyChara.name} VS ${selectedOpponentChara.name} 君の負けぇ～～`)    
    setSelectedOpponentChara(null);
  };

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
              onClick={() => versusWinResult(selectedMyChara, selectedOpponentChara)}
              disabled={!bothCharactersSelected}
            >
              勝ち
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold mx-5 py-4 px-8 rounded"
              onClick={() => versusLoseResult(selectedMyChara, selectedOpponentChara)}
              disabled={!bothCharactersSelected}
            >
              負け
            </button>
          </div>
        </div>

        <div className="py-5"> 
          <Result />
        </div>

        <div className="py-5"> 
          <Footer />
        </div>
      </div>
    </>
  )
}