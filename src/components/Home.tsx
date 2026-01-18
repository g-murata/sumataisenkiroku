import { useState } from 'react';
import { createPortal } from 'react-dom';

import { supabase } from '../supabaseClient';
import { Character } from './Character';
import { Result } from './Result';
import { ResultAnimation } from './ResultAnimation';
import { CharacterType, MatchHistory, MatchResult } from '../types';

interface HomeProps {
  history: MatchHistory;
  onAddResult: (match: MatchResult) => void;
  onRowClick: (index: number) => void;
  onClearResults: () => void;
  user: any;
}

export const Home: React.FC<HomeProps> = ({ history, onAddResult, onRowClick, onClearResults, user }) => {
  // ▼ UI用のState
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

  // ★ PiPウインドウの状態管理
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const STORAGE_KEY = "gameResults";

  // ----------------------------------------------------------------------
  // ★ Document Picture-in-Picture (PiP) を制御する関数
  // ----------------------------------------------------------------------
  const togglePip = async () => {
    // すでに開いていれば閉じる
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    // ブラウザ対応チェック
    if (!("documentPictureInPicture" in window)) {
      alert("このブラウザは対応していません。PC版ChromeまたはEdgeを使ってください。");
      return;
    }

    try {
      // ▼ 初期サイズ指定 (幅350px, 高さ400px くらいが画像に近いサイズ感)
      // @ts-ignore
      const win = await window.documentPictureInPicture.requestWindow({
        width: 350,
        height: 200,
      });

      // ★★★ タイトル変更 ★★★
      win.document.title = "スマ対戦記録（OBS配信枠）";

      // 親ウインドウのCSS (Tailwindなど) をすべてコピーして適用する
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const newLink = document.createElement("link");
            newLink.rel = "stylesheet";
            newLink.href = styleSheet.href;
            win.document.head.appendChild(newLink);
          } else if (styleSheet.cssRules) {
            const newStyle = document.createElement("style");
            Array.from(styleSheet.cssRules).forEach((rule) => {
              newStyle.appendChild(document.createTextNode(rule.cssText));
            });
            win.document.head.appendChild(newStyle);
          }
        } catch (e) {
          console.error("Style copy error:", e);
        }
      });

      // ウインドウが閉じられた（×ボタンなど）時の処理
      win.addEventListener("pagehide", () => {
        setPipWindow(null);
      });

      setPipWindow(win);

    } catch (err) {
      console.error("PiP failed:", err);
    }
  };

  // ----------------------------------------------------------------------
  // ▼ フィルタリングロジック
  const filteredMatchesWithIndex = history.matches
    .map((match, index) => ({ match, originalIndex: index }))
    .filter(({ match }) => {
      const isMyCharMatch = filterMyCharId ? match.player?.characterNo === filterMyCharId : true;
      const isOppCharMatch = filterOppCharId ? match.opponentPlayer?.characterNo === filterOppCharId : true;
      
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
        }
      }
      return isMyCharMatch && isOppCharMatch && isDateMatch;
    });

  // ----------------------------------------------------------------------
  // ▼ データ移行ロジック
  const migrateData = async () => {
    // 1. ログインチェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインしてから実行してください！");
      return;
    }

    // 2. LocalStorageからデータ取得
    const storedData = localStorage.getItem(STORAGE_KEY);
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
      created_at: new Date(m.nichiji).toISOString(),
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
      alert(`移行エラー: ${error.message}`);
    } else {
      // 5. 完了＆削除確認
      alert("🎉 移行が完了しました!");
      if (window.confirm("💻 続けて、移行元の対戦結果を一括削除しますか？")) {
        localStorage.removeItem(STORAGE_KEY);
        alert("移行元の対戦結果を削除しました。");
      }  
      window.location.reload();
    }
  };

  // ----------------------------------------------------------------------
  // ▼ 記録ロジック
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

  const colorMap: Record<"red" | "blue" | "green", string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500 hover:bg-green-600",
  };

  const backgroundColorClass = (isActive: boolean, color: keyof typeof colorMap) => {
    return isActive ? colorMap[color] : "bg-gray-400 hover:bg-gray-500";
  };

  // ★ Resultコンポーネントを描画する関数
  const renderResult = (isPipMode: boolean) => (
    <Result
      filteredMatches={filteredMatchesWithIndex}
      history={history}
      setHistory={() => {}}
      onRowClick={isPipMode ? () => {} : onRowClick}
      haishin={isPipMode} // PiPなら配信モード(true)
      filterMyCharId={filterMyCharId}
      setFilterMyCharId={isPipMode ? () => {} : setFilterMyCharId}
      filterOppCharId={filterOppCharId}
      setFilterOppCharId={isPipMode ? () => {} : setFilterOppCharId}
      filterDateRange={filterDateRange}
      setFilterDateRange={isPipMode ? () => {} : setFilterDateRange}
      customStartDate={customStartDate}
      setCustomStartDate={isPipMode ? () => {} : setCustomStartDate}
      customEndDate={customEndDate}
      setCustomEndDate={isPipMode ? () => {} : setCustomEndDate}
    />
  );

  return (
    <>
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
          
          {/* ▼ 真ん中の履歴エリア */}
          <div className="md:w-1/3 md:h-90vh flex flex-col px-2 md:px-5" id="win-lose-area">
             {/* 通常時はここでResult(false)を表示 */}
             {renderResult(false)}
          </div>

          {/* ▼ 右側のOBS配信モードエリア（ここをデザイン変更！） */}
          <div className="md:w-1/3 flex flex-col px-10 mt-4 md:mt-0">
            {/* PiPが起動中かどうかで表示を変えてもいいが、ボタンで制御する */}
            
            {/* ★ デザイン通りの「ランチャーボックス」 */}
            <div className="w-full border-4 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-gray-50 text-center h-64 shadow-sm relative">
               
               {/* 起動中の場合、ここにResultAnimationを出してもいいが、PiP側に出るのでここでは静かにしておく */}
               
               {/* アイコン（FontAwesomeのPCアイコン） */}
               <i className="fas fa-desktop text-5xl text-gray-300 mb-4"></i>

               <h2 className="text-gray-600 font-bold text-lg mb-2">OBS配信モード</h2>
               <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                 ここをクリックすると、<br/>
                 配信レイアウト専用の<br/>
                 別ウィンドウが立ち上がります。
               </p>

               {/* 専用ウィンドウボタン */}
               <button 
                  onClick={togglePip}
                  className={`
                    font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 text-white
                    ${pipWindow ? "bg-gray-500 hover:bg-gray-600" : "bg-indigo-600 hover:bg-indigo-700"}
                  `}
               >
                  {pipWindow ? (
                     <>
                       <i className="fas fa-times-circle"></i> 元に戻す
                     </>
                  ) : (
                     <>
                       <i className="fas fa-external-link-alt"></i> 専用ウィンドウを開く
                     </>
                  )}
               </button>
            </div>

            {/* 下部のボタン群 */}
            <div className="flex flex-col justify-center items-center mt-6 gap-3">
              <button className="py-2 px-6 bg-gray-200 rounded hover:bg-gray-300 text-sm text-gray-600 font-bold w-full max-w-xs" onClick={onClearResults}>
                勝敗記録一括削除
              </button>
              {(user && localStorage.getItem(STORAGE_KEY)) && (
                <button 
                  className="py-2 px-6 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-bold w-full max-w-xs shadow-md"
                  onClick={migrateData}
                >
                  <i className="fas fa-laptop-medical mr-2"></i> デバイスの対戦結果を移行する
                </button>
                )}
            </div>
            
            {/* ★ PiPウインドウへの転送ポータル
              pipWindowが存在する時だけ、ここ経由で「Result(true)」を向こうのWindowへ送り込む
            */}
            {pipWindow && createPortal(
              <div className="h-full bg-white flex flex-col overflow-hidden relative">
                 {/* PiPウインドウの中身: 勝敗アニメーションもこっちに出す */}
                 {renderResult(true)}
                 {showResultAnimation && (
                    <ResultAnimation 
                      result={lastResultForAnim} 
                      mode="absolute" // 枠内絶対配置
                    />
                  )}
              </div>, 
              pipWindow.document.body
            )}
          </div>
        </div>
      </div>
    </>
  )
}