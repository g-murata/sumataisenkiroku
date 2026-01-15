import  { useState } from 'react';

import { supabase } from '../supabaseClient';
import { Character } from './Character';
import { Result } from './Result';
import { ResultAnimation } from './ResultAnimation';
import { CharacterType, MatchHistory, MatchResult } from '../types';

// ★ 親（App）から受け取るものを定義
interface HomeProps {
  history: MatchHistory;
  onAddResult: (match: MatchResult) => void;
  onRowClick: (index: number) => void;
  onClearResults: () => void;
  user: any; // ★追加: ログイン情報を受け取る
}

export const Home: React.FC<HomeProps> = ({ history, onAddResult, onRowClick, onClearResults }) => {
  // ▼ UI用のState（キャラ選択やフィルターはHome持ちのままでOK）
  const [selectedMyCharacter, setSelectedMyCharacter] = useState<CharacterType | null>(null);
  const [selectedOpponentCharacter, setSelectedOpponentCharacter] = useState<CharacterType | null>(null);
  const [selectedResult, setSelectedResult] = useState<"勝ち" | "負け">("勝ち");
  
  const bothCharactersSelected = (selectedMyCharacter !== null && selectedOpponentCharacter !== null);

  // ▼ フィルター用State
  const [filterMyCharId, setFilterMyCharId] = useState<number | null>(null);
  const [filterOppCharId, setFilterOppCharId] = useState<number | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<"all" | "today" | "week" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // ▼ アニメーション制御用State
  const [showResultAnimation, setShowResultAnimation] = useState(false);
  const [lastResultForAnim, setLastResultForAnim] = useState<"勝ち" | "負け">("勝ち");

  // ▼ フィルタリングロジック（historyはPropsから来るが、計算はここで行う）
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

  const migrateData = async () => {
    // 1. ログインチェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインしてから実行してください！");
      return;
    }

    // 2. LocalStorageからデータ取得
    const storedData = localStorage.getItem("gameResults");
    if (!storedData) {
      alert("ローカルストレージにデータがありません。");
      return;
    }
    
    const parsedData = JSON.parse(storedData);
    const localMatches = parsedData.matches;

    if (localMatches.length === 0) {
      alert("移行するデータがありません。");
      return;
    }

    if (!window.confirm(`${localMatches.length}件のデータをDB（データベース）に移行しますか？`)) {
      return;
    }

    // 3. データ変換（自分のIDを付与）
    const insertData = localMatches.map((m: any) => ({
      user_id: user.id,
      date: new Date(m.nichiji).toISOString(),
      my_char_id: m.player.characterNo,
      opp_char_id: m.opponentPlayer.characterNo,
      my_char: m.player.characterName,
      opponent_char: m.opponentPlayer.characterName,
      result: m.shouhai,
      memo: m.memo || ""
    }));

    // 4. 一括登録
    const { error } = await supabase.from('matches').insert(insertData);

    if (error) {
      console.error("移行エラー:", error);
      alert(`エラー: ${error.message}`);
    } else {
      alert("🎉 移行完了！リロードします。");      
      window.location.reload();
    }
  };


  // ▼ 記録ボタンが押された時の処理
  const recordResult = (shouhai: "勝ち" | "負け"): void => {
    setLastResultForAnim(shouhai);
    setShowResultAnimation(true);

    onAddResult({
      nichiji: new Date().toISOString(),
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

  // ▼ 色管理のヘルパー
  const colorMap: Record<"red" | "blue" | "green", string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500 hover:bg-green-600",
  };

  const backgroundColorClass = (isActive: boolean, color: keyof typeof colorMap) => {
    return isActive ? colorMap[color] : "bg-gray-400 hover:bg-gray-500";
  };

  return (
    <>
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
          {/* --- 入力エリア --- */}
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
              setHistory={() => {}} 
              
              onRowClick={onRowClick} // ★重要: これでApp.tsxのモーダルが開くようになります！
              
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
               <span className="absolute -top-3 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                 🔴 配信用 (OBS取り込み枠)
               </span>

               <div className="w-full bg-white rounded-lg shadow-lg p-2 overflow-hidden relative" id="win-lose-area-haishin">
                  <Result
                    filteredMatches={filteredMatchesWithIndex}
                    history={history}
                    setHistory={() => {}}
                    
                    onRowClick={() => {}} // ★配信画面はクリックしても何も起きなくてOK
                    
                    haishin={true}
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
              <button className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300 text-sm" onClick={onClearResults}>
                勝敗記録一括削除
              </button>
              {/* {user && (
                <button 
                  className="py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-bold"
                  onClick={migrateData}
                >
                  💻 デバイスの対戦結果を移行する
                </button>
                )} */}
              <button 
                className="py-2 px-4 bg-orange-300 text-white rounded hover:bg-orange-400 font-bold m-2"
                onClick={migrateData}
              >
                💻 デバイスの対戦結果を移行する
              </button>              

            </div>
          </div>
        </div>
      </div>
    </>
  )
}