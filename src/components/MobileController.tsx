import { useState, useMemo, useRef } from 'react';
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

// ====================================================================
// ▼ キャラ全選択オーバーレイ（fixed で画面全体に被せる → レイアウト不変）
// ====================================================================
const CharacterPickerOverlay = ({
  color,
  search,
  setSearch,
  filteredList,
  selected,
  onSelect,
  onClose,
  idPrefix,
}: {
  color: "red" | "blue";
  search: string;
  setSearch: (v: string) => void;
  filteredList: CharacterType[];
  selected: CharacterType | null;
  onSelect: (c: CharacterType) => void;
  onClose: () => void;
  idPrefix: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const accentBorder = color === "red"
    ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
    : "border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]";
  const gridSelected = color === "red"
    ? "border-red-500 bg-red-950/30 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
    : "border-blue-500 bg-blue-950/30 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
  const title = color === "red" ? "👤 あなたのファイターを選択" : "⚔️ 相手のファイターを選択";
  const titleColor = color === "red" ? "text-red-400" : "text-blue-400";

  return (
    <div
      className="fixed inset-0 z-50 bg-[#07070d]/95 backdrop-blur-sm flex flex-col p-4 gap-3"
      style={{ touchAction: 'none' }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-shrink-0">
        <span className={`text-sm font-black tracking-wide ${titleColor}`}>{title}</span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* 検索バー */}
      <div className={`flex items-center gap-2 bg-slate-900/80 border rounded-xl px-3 py-2 flex-shrink-0 ${accentBorder}`}>
        <i className="fas fa-search text-slate-500 text-xs"></i>
        <input
          ref={inputRef}
          type="text"
          placeholder="ファイター名で検索..."
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-500 hover:text-white">
            <i className="fas fa-times text-xs"></i>
          </button>
        )}
      </div>

      {/* キャラグリッド */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-6 gap-2 pb-2">
          {filteredList.map(char => {
            const isSelected = selected?.characterNo === char.characterNo;
            return (
              <button
                key={`${idPrefix}-overlay-${char.characterNo}`}
                onClick={() => { onSelect(char); onClose(); }}
                className={`aspect-square rounded-xl border p-1 flex items-center justify-center transition-all active:scale-90 ${
                  isSelected ? gridSelected : "border-transparent bg-slate-900/30 hover:border-white/20"
                }`}
              >
                <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// ▼ メインコンポーネント
// ====================================================================
export const MobileController: React.FC<MobileControllerProps> = ({
  history,
  onAddResult,
}) => {
  const [selectedMyCharacter, setSelectedMyCharacter] = useState<CharacterType | null>(null);
  const [selectedOpponentCharacter, setSelectedOpponentCharacter] = useState<CharacterType | null>(null);

  // どちらのオーバーレイを開くか ("my" | "opp" | null)
  const [overlayOpen, setOverlayOpen] = useState<"my" | "opp" | null>(null);

  const [mySearch, setMySearch] = useState("");
  const [oppSearch, setOppSearch] = useState("");

  const bothSelected = selectedMyCharacter !== null && selectedOpponentCharacter !== null;

  // よく使うキャラ（最大5件）
  const getFrequent = (isYou: boolean): CharacterType[] => {
    const counts: Record<number, number> = {};
    history.matches.slice(0, 50).forEach((m) => {
      const char = isYou ? m.player : m.opponentPlayer;
      if (char?.characterNo) counts[char.characterNo] = (counts[char.characterNo] || 0) + 1;
    });
    return Object.keys(counts)
      .map(Number)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 5)
      .map(id => characterList.find(c => c.characterNo === id)!)
      .filter(Boolean);
  };

  const myFavorites = useMemo(() => getFrequent(true), [history.matches]);
  const oppFavorites = useMemo(() => getFrequent(false), [history.matches]);

  const myFiltered = useMemo(() => {
    if (!mySearch) return characterList;
    const q = toKatakana(mySearch.trim().toLowerCase());
    return characterList.filter(c => toKatakana(c.characterName.toLowerCase()).includes(q));
  }, [mySearch]);

  const oppFiltered = useMemo(() => {
    if (!oppSearch) return characterList;
    const q = toKatakana(oppSearch.trim().toLowerCase());
    return characterList.filter(c => toKatakana(c.characterName.toLowerCase()).includes(q));
  }, [oppSearch]);

  const streak = useMemo(() => {
    let n = 0;
    for (const m of history.matches) { if (m.shouhai === "勝ち") n++; else break; }
    return n;
  }, [history.matches]);

  const winRate = useMemo(() => {
    const t = history.winCount + history.loseCount;
    return t > 0 ? ((history.winCount / t) * 100).toFixed(1) : "0.0";
  }, [history.winCount, history.loseCount]);

  const handleRecord = (shouhai: "勝ち" | "負け") => {
    if (!bothSelected) return;
    onAddResult({
      nichiji: new Date().toISOString(),
      player: selectedMyCharacter,
      opponentPlayer: selectedOpponentCharacter,
      shouhai,
      memo: ""
    });
    setSelectedOpponentCharacter(null);
  };

  // キャラ選択行コンポーネント（ファボ + 検索ボタン）
  const SelectorRow = ({
    color, selected, onSelect, favorites, onOpenOverlay,
  }: {
    color: "red" | "blue";
    selected: CharacterType | null;
    onSelect: (c: CharacterType | null) => void;
    favorites: CharacterType[];
    onOpenOverlay: () => void;
  }) => {
    const glow = color === "red"
      ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] scale-105"
      : "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] scale-105";
    const labelColor = color === "red" ? "text-red-400" : "text-blue-400";
    const label = color === "red" ? "👤 あなた" : "⚔️ 相手";

    return (
      <div className="glass-panel px-3 py-2.5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col gap-2">
        {/* ラベル + 選択中キャラ名 */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black tracking-wider ${labelColor} uppercase`}>
            {label}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {selected?.characterName || <span className="text-slate-600">未選択</span>}
          </span>
        </div>

        {/* ファボアイコン + 検索ボタン */}
        <div className="flex items-center gap-2">
          {/* 選択中キャラ大きく表示 */}
          {selected ? (
            <button
              onClick={() => onSelect(null)}
              className={`w-11 h-11 rounded-full flex-shrink-0 border-2 p-0.5 bg-slate-950/60 flex items-center justify-center transition-all ${glow}`}
            >
              <img src={selected.imageUrl} alt={selected.characterName} className="w-full h-full object-contain pointer-events-none" />
            </button>
          ) : (
            <div className="w-11 h-11 rounded-full flex-shrink-0 border-2 border-dashed border-white/10 bg-slate-950/40 flex items-center justify-center text-slate-600 text-lg">?</div>
          )}

          <div className="w-px h-8 bg-white/5 flex-shrink-0"></div>

          {/* ファボ一覧 */}
          <div className="flex gap-1.5 items-center overflow-x-auto hide-scrollbar flex-1">
            {favorites.map(char => {
              const isSel = selected?.characterNo === char.characterNo;
              return (
                <button
                  key={`fav-${color}-${char.characterNo}`}
                  onClick={() => isSel ? onSelect(null) : onSelect(char)}
                  className={`w-10 h-10 rounded-full flex-shrink-0 border-2 p-0.5 bg-slate-950/60 flex items-center justify-center transition-all ${
                    isSel ? glow : "border-white/10 active:scale-90"
                  }`}
                >
                  <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
                </button>
              );
            })}
          </div>

          {/* 全キャラ検索ボタン */}
          <button
            onClick={onOpenOverlay}
            className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 transition-all hover:border-slate-500 hover:text-slate-300 active:scale-90"
          >
            <i className="fas fa-search text-xs"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ====== キャラ検索オーバーレイ（fixed: レイアウトに影響しない） ====== */}
      {overlayOpen === "my" && (
        <CharacterPickerOverlay
          color="red"
          search={mySearch}
          setSearch={setMySearch}
          filteredList={myFiltered}
          selected={selectedMyCharacter}
          onSelect={setSelectedMyCharacter}
          onClose={() => { setOverlayOpen(null); setMySearch(""); }}
          idPrefix="my"
        />
      )}
      {overlayOpen === "opp" && (
        <CharacterPickerOverlay
          color="blue"
          search={oppSearch}
          setSearch={setOppSearch}
          filteredList={oppFiltered}
          selected={selectedOpponentCharacter}
          onSelect={setSelectedOpponentCharacter}
          onClose={() => { setOverlayOpen(null); setOppSearch(""); }}
          idPrefix="opp"
        />
      )}

      {/* ====== メイン画面（常に1画面に収まる） ====== */}
      <div className="h-screen w-screen bg-[#07070d] text-white flex flex-col p-3 gap-3 overflow-hidden select-none font-sans box-border">

        {/* 🟢 ヘッダー */}
        <div className="glass-panel px-3 py-2.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between shadow-lg flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,1)]"></span>
            </span>
            <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase">REMOTE LIVE</span>
          </div>

          <div className="flex items-baseline gap-1 font-black">
            <span className="text-xl text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">{history.winCount}</span>
            <span className="text-[9px] text-slate-500">W</span>
            <span className="text-slate-600 text-sm mx-0.5">-</span>
            <span className="text-xl text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">{history.loseCount}</span>
            <span className="text-[9px] text-slate-500">L</span>
            <span className="text-[9px] text-slate-400 ml-1.5">({winRate}%)</span>
          </div>

          {streak >= 2 ? (
            <div className="flex items-center gap-0.5 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg text-[9px] font-black text-amber-400 animate-pulse">
              🔥 {streak}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-xs opacity-40">🎮</div>
          )}
        </div>

        {/* 🕹️ キャラ選択エリア */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <SelectorRow
            color="red"
            selected={selectedMyCharacter}
            onSelect={setSelectedMyCharacter}
            favorites={myFavorites}
            onOpenOverlay={() => setOverlayOpen("my")}
          />
          <SelectorRow
            color="blue"
            selected={selectedOpponentCharacter}
            onSelect={setSelectedOpponentCharacter}
            favorites={oppFavorites}
            onOpenOverlay={() => setOverlayOpen("opp")}
          />
        </div>

        {/* スペーサー */}
        <div className="flex-1"></div>

        {/* 🔴 WIN / LOSE ボタン（常に画面内） */}
        <div className="flex gap-3 flex-shrink-0" style={{ height: 'clamp(90px, 22vh, 130px)' }}>
          <button
            onClick={() => handleRecord("勝ち")}
            disabled={!bothSelected}
            className={`flex-1 h-full rounded-[1.5rem] font-black text-xl transition-all transform active:scale-95 flex flex-col justify-center items-center gap-1.5 shadow-2xl ${
              !bothSelected
                ? "bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed"
                : "bg-gradient-to-br from-red-500 to-rose-700 text-white border-2 border-red-400/60 shadow-[0_4px_30px_rgba(239,68,68,0.45)]"
            }`}
          >
            <span className="text-2xl">🏆</span>
            <span>WIN</span>
            <span className="text-xs font-semibold opacity-70">勝ち</span>
          </button>

          <button
            onClick={() => handleRecord("負け")}
            disabled={!bothSelected}
            className={`flex-1 h-full rounded-[1.5rem] font-black text-xl transition-all transform active:scale-95 flex flex-col justify-center items-center gap-1.5 shadow-2xl ${
              !bothSelected
                ? "bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed"
                : "bg-gradient-to-br from-blue-500 to-indigo-700 text-white border-2 border-blue-400/60 shadow-[0_4px_30px_rgba(59,130,246,0.45)]"
            }`}
          >
            <span className="text-2xl">⚔️</span>
            <span>LOSE</span>
            <span className="text-xs font-semibold opacity-70">負け</span>
          </button>
        </div>

      </div>
    </>
  );
};
