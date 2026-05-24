import { useState, useMemo } from 'react';
import { CharacterType, MatchHistory, MatchResult } from '../types';
import { characterList } from './Character';

interface MobileControllerProps {
  history: MatchHistory;
  onAddResult: (match: MatchResult) => void;
  user: any;
}

// ひらがなからカタカナへの変換ユーティリティ
const toKatakana = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
};

export const MobileController: React.FC<MobileControllerProps> = ({
  history,
  onAddResult,
  user
}) => {
  // ▼ 選択中のキャラクターState
  const [selectedMyCharacter, setSelectedMyCharacter] = useState<CharacterType | null>(null);
  const [selectedOpponentCharacter, setSelectedOpponentCharacter] = useState<CharacterType | null>(null);

  // ▼ グリッド展開フラグ
  const [showMyAll, setShowMyAll] = useState(false);
  const [showOppAll, setShowOppAll] = useState(false);

  // ▼ 検索ワードState
  const [mySearch, setMySearch] = useState("");
  const [oppSearch, setOppSearch] = useState("");

  const bothCharactersSelected = (selectedMyCharacter !== null && selectedOpponentCharacter !== null);

  // ----------------------------------------------------------------------
  // ▼ お気に入り（よく使うキャラ）を対戦履歴から動的に集計 (最大6件)
  // ----------------------------------------------------------------------
  const getFrequentCharacters = (isYou: boolean) => {
    const counts: Record<number, number> = {};
    const targetMatches = isYou ? history.matches.slice(0, 30) : history.matches;

    targetMatches.forEach((m) => {
      const char = isYou ? m.player : m.opponentPlayer;
      if (char && char.characterNo) {
        counts[char.characterNo] = (counts[char.characterNo] || 0) + 1;
      }
    });

    const sortedIds = Object.keys(counts)
      .map(Number)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 6); // リモコン用に少し多めの最大6件をクイック表示

    return sortedIds
      .map(id => characterList.find(c => c.characterNo === id))
      .filter((c): c is CharacterType => !!c);
  };

  const myFavorites = useMemo(() => getFrequentCharacters(true), [history.matches]);
  const oppFavorites = useMemo(() => getFrequentCharacters(false), [history.matches]);

  // ----------------------------------------------------------------------
  // ▼ 検索フィルタリング
  // ----------------------------------------------------------------------
  const filterList = (search: string) => {
    return characterList.filter(char => {
      if (!search) return true;
      const query = toKatakana(search.trim().toLowerCase());
      const name = toKatakana(char.characterName.toLowerCase());
      return name.includes(query);
    });
  };

  const myFilteredList = useMemo(() => filterList(mySearch), [mySearch]);
  const oppFilteredList = useMemo(() => filterList(oppSearch), [oppSearch]);

  // ----------------------------------------------------------------------
  // ▼ 勝敗記録
  // ----------------------------------------------------------------------
  const handleRecord = (shouhai: "勝ち" | "負け") => {
    if (!bothCharactersSelected) return;

    onAddResult({
      nichiji: new Date().toISOString(),
      player: selectedMyCharacter,
      opponentPlayer: selectedOpponentCharacter,
      shouhai,
      memo: ""
    });

    // 相手キャラのみ選択をクリアして次の対戦へスムーズに移行
    setSelectedOpponentCharacter(null);
    setShowOppAll(false);
    setOppSearch("");
  };

  // 連勝数の計算
  const streak = useMemo(() => {
    let count = 0;
    for (const m of history.matches || []) {
      if (m.shouhai === "勝ち") count++;
      else break;
    }
    return count;
  }, [history.matches]);

  // 勝率の計算
  const winRate = useMemo(() => {
    const total = history.winCount + history.loseCount;
    return total > 0 ? ((history.winCount / total) * 100).toFixed(1) : "0.0";
  }, [history.winCount, history.loseCount]);

  return (
    <div className="h-screen w-screen bg-[#07070d] text-white flex flex-col justify-between p-4 overflow-hidden select-none font-sans box-border">
      
      {/* 🟢 ヘッダー: LIVE接続ランプと現在スコアの簡易ボード */}
      <div className="glass-panel p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between shadow-lg">
        {/* LIVE SYNC 表示 */}
        <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,1)]"></span>
          </span>
          <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase animate-pulse">
            REMOTE LIVE
          </span>
        </div>

        {/* トータルスコア */}
        <div className="flex items-baseline gap-1 font-black">
          <span className="text-xl text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">{history.winCount}</span>
          <span className="text-[9px] text-slate-500 font-bold">W</span>
          <span className="text-slate-600 text-sm mx-0.5">-</span>
          <span className="text-xl text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">{history.loseCount}</span>
          <span className="text-[9px] text-slate-500 font-bold">L</span>
          <span className="text-[9px] text-slate-400 font-semibold ml-2">({winRate}%)</span>
        </div>

        {/* 連勝数 */}
        {streak >= 2 ? (
          <div className="flex items-center gap-0.5 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg text-[9px] font-black text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] animate-pulse">
            🔥 {streak}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-xs opacity-40">🎮</div>
        )}
      </div>

      {/* 🕹️ メイン領域: キャラ選択 (縦分割スクロール可能、アFavoritesは1画面に収まる) */}
      <div className="flex-grow flex flex-col justify-center gap-3 my-3 overflow-hidden">
        
        {/* 1. あなたのエントリー */}
        <div className="glass-panel p-3 rounded-2xl bg-slate-900/30 border border-white/5 flex flex-col gap-2 relative">
          <span className="text-[10px] font-black tracking-wider text-red-400 uppercase flex items-center gap-1">
            👤 あなたのファイター: {selectedMyCharacter?.characterName || "未選択"}
          </span>

          {/* クイック選択お気に入り */}
          <div className="flex gap-2 items-center overflow-x-auto hide-scrollbar py-0.5 min-h-[3.25rem]">
            {myFavorites.map(char => {
              const isSelected = selectedMyCharacter?.characterNo === char.characterNo;
              return (
                <button
                  key={`controller-my-${char.characterNo}`}
                  onClick={() => isSelected ? setSelectedMyCharacter(null) : setSelectedMyCharacter(char)}
                  className={`w-12 h-12 rounded-full p-1 bg-slate-950/60 border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                    isSelected ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] scale-105" : "border-white/10"
                  }`}
                >
                  <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
                </button>
              );
            })}
            
            {/* 🔍 展開ボタン */}
            <button
              onClick={() => setShowMyAll(!showMyAll)}
              className={`w-12 h-12 rounded-full border-2 border-dashed flex-shrink-0 flex items-center justify-center text-slate-500 font-bold transition-all text-xs ${
                showMyAll ? "border-red-500 text-red-400 bg-red-950/10" : "border-slate-800 hover:border-slate-600"
              }`}
            >
              {showMyAll ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
            </button>
          </div>

          {/* 全キャラリストアコーディオン */}
          {showMyAll && (
            <div className="flex flex-col gap-2 mt-1 bg-slate-950/70 p-2.5 rounded-xl border border-white/5 absolute left-2 right-2 top-[4.5rem] z-30 shadow-2xl max-h-[30vh] overflow-hidden">
              <input
                type="text"
                placeholder="ファイター名で検索..."
                className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-white/5 bg-slate-900/60 text-slate-200"
                value={mySearch}
                onChange={(e) => setMySearch(e.target.value)}
              />
              <div className="overflow-y-auto pr-1 flex-grow grid grid-cols-5 gap-1.5">
                {myFilteredList.map(char => {
                  const isSelected = selectedMyCharacter?.characterNo === char.characterNo;
                  return (
                    <button
                      key={`all-my-${char.characterNo}`}
                      onClick={() => {
                        setSelectedMyCharacter(char);
                        setShowMyAll(false);
                      }}
                      className={`w-10 h-10 p-1.5 rounded-lg border bg-slate-900/30 flex items-center justify-center transition-all ${
                        isSelected ? "border-red-500 bg-red-950/30 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "border-transparent"
                      }`}
                    >
                      <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. 相手のエントリー */}
        <div className="glass-panel p-3 rounded-2xl bg-slate-900/30 border border-white/5 flex flex-col gap-2 relative">
          <span className="text-[10px] font-black tracking-wider text-blue-400 uppercase flex items-center gap-1">
            ⚔️ 相手のファイター: {selectedOpponentCharacter?.characterName || "未選択"}
          </span>

          {/* クイック選択お気に入り */}
          <div className="flex gap-2 items-center overflow-x-auto hide-scrollbar py-0.5 min-h-[3.25rem]">
            {oppFavorites.map(char => {
              const isSelected = selectedOpponentCharacter?.characterNo === char.characterNo;
              return (
                <button
                  key={`controller-opp-${char.characterNo}`}
                  onClick={() => isSelected ? setSelectedOpponentCharacter(null) : setSelectedOpponentCharacter(char)}
                  className={`w-12 h-12 rounded-full p-1 bg-slate-950/60 border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                    isSelected ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] scale-105" : "border-white/10"
                  }`}
                >
                  <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
                </button>
              );
            })}
            
            {/* 🔍 展開ボタン */}
            <button
              onClick={() => setShowOppAll(!showOppAll)}
              className={`w-12 h-12 rounded-full border-2 border-dashed flex-shrink-0 flex items-center justify-center text-slate-500 font-bold transition-all text-xs ${
                showOppAll ? "border-blue-500 text-blue-400 bg-blue-950/10" : "border-slate-800 hover:border-slate-600"
              }`}
            >
              {showOppAll ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
            </button>
          </div>

          {/* 全キャラリストアコーディオン */}
          {showOppAll && (
            <div className="flex flex-col gap-2 mt-1 bg-slate-950/70 p-2.5 rounded-xl border border-white/5 absolute left-2 right-2 top-[4.5rem] z-30 shadow-2xl max-h-[30vh] overflow-hidden">
              <input
                type="text"
                placeholder="ファイター名で検索..."
                className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-white/5 bg-slate-900/60 text-slate-200"
                value={oppSearch}
                onChange={(e) => setOppSearch(e.target.value)}
              />
              <div className="overflow-y-auto pr-1 flex-grow grid grid-cols-5 gap-1.5">
                {oppFilteredList.map(char => {
                  const isSelected = selectedOpponentCharacter?.characterNo === char.characterNo;
                  return (
                    <button
                      key={`all-opp-${char.characterNo}`}
                      onClick={() => {
                        setSelectedOpponentCharacter(char);
                        setShowOppAll(false);
                      }}
                      className={`w-10 h-10 p-1.5 rounded-lg border bg-slate-900/30 flex items-center justify-center transition-all ${
                        isSelected ? "border-blue-500 bg-blue-950/30 shadow-[0_0_8px_rgba(59,130,246,0.4)]" : "border-transparent"
                      }`}
                    >
                      <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 🔴 下部: 巨大な「WIN」「LOSE」ボタン (親指にフィットする超巨大サイズ) */}
      <div className="flex gap-4 justify-between items-center h-[20vh] min-h-[5.5rem] max-h-[7rem] mb-1">
        <button
          onClick={() => handleRecord("勝ち")}
          disabled={!bothCharactersSelected}
          className={`flex-1 h-full rounded-[1.5rem] font-black text-lg transition-all transform active:scale-95 flex flex-col justify-center items-center gap-1 shadow-2xl ${
            !bothCharactersSelected
              ? "bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-rose-600 text-white border-2 border-red-400 shadow-[0_4px_25px_rgba(239,68,68,0.4)]"
          }`}
        >
          <span className="text-xl">🏆</span>
          <span>WIN (勝ち)</span>
        </button>

        <button
          onClick={() => handleRecord("負け")}
          disabled={!bothCharactersSelected}
          className={`flex-1 h-full rounded-[1.5rem] font-black text-lg transition-all transform active:scale-95 flex flex-col justify-center items-center gap-1 shadow-2xl ${
            !bothCharactersSelected
              ? "bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-2 border-blue-400 shadow-[0_4px_25px_rgba(59,130,246,0.4)]"
          }`}
        >
          <span className="text-lg">⚔️</span>
          <span>LOSE (負け)</span>
        </button>
      </div>

    </div>
  );
};
