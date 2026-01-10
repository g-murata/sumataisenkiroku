import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Character } from './Character';
import { Result } from './Result';
import { ResultAnimation } from './ResultAnimation';

// キャラクター情報
export interface CharacterType {
  characterNo: number;
  characterName: string;
  imageUrl: string;
}

// 🏆 個々の試合の記録
export interface MatchResult {
  nichiji: string;
  player: CharacterType | null;
  opponentPlayer: CharacterType | null;
  shouhai: "勝ち" | "負け";
  memo: any;
}

// 📊 全体の試合履歴 & 勝敗数を管理するオブジェクト
export interface MatchHistory {
  matches: MatchResult[];
  winCount: number;
  loseCount: number;
}

export const Home = () => {
  const [selectedMyCharacter, setSelectedMyCharacter] = useState<CharacterType | null>(null);
  const [selectedOpponentCharacter, setSelectedOpponentCharacter] = useState<CharacterType | null>(null);
  const bothCharactersSelected = (selectedMyCharacter !== null && selectedOpponentCharacter !== null);

  // 🥞 localStorage
  const STORAGE_KEY = "gameResults";
  const [history, setHistory] = useState<MatchHistory>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { matches: [], winCount: 0, loseCount: 0 };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // ▼ フィルター用State
  const [filterMyCharId, setFilterMyCharId] = useState<number | null>(null);
  const [filterOppCharId, setFilterOppCharId] = useState<number | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<"all" | "today" | "week" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // ▼ アニメーション制御用State
  const [showResultAnimation, setShowResultAnimation] = useState(false);
  const [lastResultForAnim, setLastResultForAnim] = useState<"勝ち" | "負け">("勝ち");

  // ▼ フィルタリングロジック
  const filteredMatchesWithIndex = history.matches
    .map((match, index) => ({ match, originalIndex: index }))
    .filter(({ match }) => {
      // キャラフィルター
      const isMyCharMatch = filterMyCharId ? match.player?.characterNo === filterMyCharId : true;
      const isOppCharMatch = filterOppCharId ? match.opponentPlayer?.characterNo === filterOppCharId : true;
      
      // 日付フィルター
      let isDateMatch = true;
      const matchDate = new Date(match.nichiji);
      const now = new Date();

      if (filterDateRange === "today") {
        isDateMatch = matchDate.toDateString() === now.toDateString();
      } else if (filterDateRange === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        isDateMatch = matchDate >= oneWeekAgo;
      } else if (filterDateRange === "custom") {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0); 
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999); 
          isDateMatch = matchDate >= start && matchDate <= end;
        } else {
          isDateMatch = true;
        }
      }
      return isMyCharMatch && isOppCharMatch && isDateMatch;
    });

  const clearResults = () => {
    const isConfirmed = window.confirm('本当にリセットしますか？');
    if (!isConfirmed) { return }

    localStorage.removeItem(STORAGE_KEY);
    setHistory({ matches: [], winCount: 0, loseCount: 0 });
  }

  const [animateFirstItem, setAnimateFirstItem] = useState(false);
  const [selectedResult, setSelectedResult] = useState<"勝ち" | "負け">("勝ち");

  const kekka = (match: MatchResult) => {
    setHistory(prevResults => ({
      matches: [match, ...prevResults.matches],
      winCount: match.shouhai === "勝ち" ? prevResults.winCount + 1 : prevResults.winCount,
      loseCount: match.shouhai === "負け" ? prevResults.loseCount + 1 : prevResults.loseCount,
    }));
  };

  const recordResult = (shouhai: "勝ち" | "負け"): void => {
    setAnimateFirstItem(false);

    // ▼ アニメーション開始トリガー
    setLastResultForAnim(shouhai);
    setShowResultAnimation(true);

    kekka({
      nichiji: new Date().toLocaleString(),
      player: selectedMyCharacter,
      opponentPlayer: selectedOpponentCharacter,
      shouhai,
      memo: ""
    });

    setSelectedOpponentCharacter(null);

    if (shouhai === "負け") {
      setSelectedResult("勝ち");
    }
  };

  const colorMap: Record<"red" | "blue" | "green", string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500 hover:bg-green-600",
  };

  const backgroundColorClass = (isActive: boolean, color: keyof typeof colorMap) => {
    return isActive ? colorMap[color] : "bg-gray-400 hover:bg-gray-500";
  };

  useEffect(() => {
    if (history.matches.length > 0) {
      setAnimateFirstItem(true);
    }
  }, [history.matches]);

  return (
    <>
      <Header />

      {/* ▼ 全画面用アニメーション (fixed) */}
      {showResultAnimation && (
        <ResultAnimation 
          result={lastResultForAnim} 
          mode="fixed"
          onComplete={() => setShowResultAnimation(false)}
        />
      )}

      <div className="flex flex-col justify-center items-center">
        <div className="md:flex w-full max-w-7xl">
          <div className="w-full md:w-1/3">
            <div className="px-5 py-2 flex flex-col justify-center items-center">
              <div>
                <Character
                  player={"あなた"}
                  onSelectCharacter={setSelectedMyCharacter}
                  selectedCharacter={selectedMyCharacter}
                />
              </div>
              <div>
                <Character
                  player={"相手"}
                  onSelectCharacter={setSelectedOpponentCharacter}
                  selectedCharacter={selectedOpponentCharacter}
                />
              </div>
            </div>
            <div className="">
              <div className="">
                <div className="flex justify-center items-center">
                  <button
                    className={`${backgroundColorClass(selectedResult === "勝ち", "red")} text-white font-bold m-2 py-4 px-8 rounded`}
                    onClick={() => setSelectedResult("勝ち")}
                    disabled={!bothCharactersSelected}
                  >
                    勝ち
                  </button>
                  <button
                    className={`${backgroundColorClass(selectedResult === "負け", "blue")} text-white font-bold m-2 py-4 px-8 rounded`}
                    onClick={() => setSelectedResult("負け")}
                    disabled={!bothCharactersSelected}
                  >
                    負け
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center py-3">
                <button className={`${backgroundColorClass((bothCharactersSelected), "green")} text-white font-bold mx-5 py-4 px-10 rounded`}
                  onClick={() => recordResult(selectedResult)}
                  disabled={!bothCharactersSelected}
                >
                  結果送信
                </button>
              </div>
            </div>
          </div>
          
          {/* ▼ メイン結果画面エリア */}
          <div className="md:w-1/3 md:h-90vh flex flex-col px-2 md:px-5" id="win-lose-area">
            <Result
              filteredMatches={filteredMatchesWithIndex}
              history={history}
              setHistory={setHistory}
              animateFirstItem={animateFirstItem}
              haishin={false}
              filterMyCharId={filterMyCharId}
              setFilterMyCharId={setFilterMyCharId}
              filterOppCharId={filterOppCharId}
              setFilterOppCharId={setFilterOppCharId}
              filterDateRange={filterDateRange}
              setFilterDateRange={setFilterDateRange}
              customStartDate={customStartDate}
              setCustomStartDate={setCustomStartDate}
              customEndDate={customEndDate}
              setCustomEndDate={setCustomEndDate}
            />
          </div>

          {/* ▼ 配信画面エリア */}
          <div className="md:w-1/3 flex flex-col px-10">
            {/* ここが点線枠（OBS用取り込みエリア） */}
            <div className="hidden md:flex flex-col border-4 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 items-center justify-center relative mt-2">
               {/* ラベル */}
               <span className="absolute -top-3 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                 🔴 配信用 (OBS取り込み枠)
               </span>

               {/* 白いカード部分（トリミング対象） */}
               <div className="w-full bg-white rounded-lg shadow-lg p-2 overflow-hidden relative" id="win-lose-area-haishin">
                  <Result
                    filteredMatches={filteredMatchesWithIndex}
                    history={history}
                    setHistory={setHistory}
                    animateFirstItem={animateFirstItem}
                    haishin={true}
                    // ダミー関数
                    filterMyCharId={filterMyCharId}
                    setFilterMyCharId={() => {}}
                    filterOppCharId={filterOppCharId}
                    setFilterOppCharId={() => {}}
                    filterDateRange={filterDateRange}
                    setFilterDateRange={() => {}}
                    customStartDate={customStartDate}
                    setCustomStartDate={() => {}}
                    customEndDate={customEndDate}
                    setCustomEndDate={() => {}}
                  />

                  {/* ▼ 配信枠用アニメーション (absolute配置) */}
                  {showResultAnimation && (
                    <ResultAnimation 
                      result={lastResultForAnim} 
                      mode="absolute"
                    />
                  )}
               </div>

               <p className="text-gray-400 text-xxs mt-2">※OBSでこの枠の内側をトリミングしてください</p>
            </div>

            <div className="flex flex-col justify-center items-center mt-6">
              <button className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300 text-sm" onClick={clearResults}>
                勝敗記録一括削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}