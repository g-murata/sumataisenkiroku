import { useState, useMemo, useRef } from 'react';
import { CharacterType, MatchHistory, MatchResult } from '../types';
import { characterList } from './Character';

interface MobileControllerProps {
  history: MatchHistory;
  onAddResult: (match: MatchResult) => void;
  user: any;
}

const toKatakana = (str: string) =>
  str.replace(/[\u3041-\u3096]/g, (m) => String.fromCharCode(m.charCodeAt(0) + 0x60));

// ============================================================
// キャラ全選択オーバーレイ（fixed）
// ============================================================
const CharacterPickerOverlay = ({
  color, search, setSearch, filteredList, selected, onSelect, onClose, idPrefix,
}: {
  color: "red" | "blue";
  search: string; setSearch: (v: string) => void;
  filteredList: CharacterType[];
  selected: CharacterType | null;
  onSelect: (c: CharacterType) => void;
  onClose: () => void;
  idPrefix: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const accent = color === "red"
    ? "border-red-500/50" : "border-blue-500/50";
  const gridSel = color === "red"
    ? "border-red-500 bg-red-950/30 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
    : "border-blue-500 bg-blue-950/30 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
  const title = color === "red" ? "👤 あなたのファイターを選択" : "⚔️ 相手のファイターを選択";
  const titleColor = color === "red" ? "text-red-400" : "text-blue-400";

  return (
    <div className="fixed inset-0 z-50 bg-[#07070d]/96 backdrop-blur-sm flex flex-col p-4 gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <span className={`text-sm font-black ${titleColor}`}>{title}</span>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className={`flex items-center gap-2 bg-slate-900/80 border rounded-xl px-3 py-2 flex-shrink-0 ${accent}`}>
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
          <button onClick={() => setSearch("")} className="text-slate-500">
            <i className="fas fa-times text-xs"></i>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-6 gap-2 pb-2">
          {filteredList.map(char => {
            const isSel = selected?.characterNo === char.characterNo;
            return (
              <button key={`${idPrefix}-ov-${char.characterNo}`}
                onClick={() => { onSelect(char); onClose(); }}
                className={`aspect-square rounded-xl border p-1 flex items-center justify-center transition-all active:scale-90 ${
                  isSel ? gridSel : "border-transparent bg-slate-900/30"
                }`}>
                <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// メイン
// ============================================================
export const MobileController: React.FC<MobileControllerProps> = ({ history, onAddResult }) => {
  const [myChar, setMyChar] = useState<CharacterType | null>(null);
  const [oppChar, setOppChar] = useState<CharacterType | null>(null);
  const [overlay, setOverlay] = useState<"my" | "opp" | null>(null);
  const [mySearch, setMySearch] = useState("");
  const [oppSearch, setOppSearch] = useState("");
  const [showEffect, setShowEffect] = useState<{
    shouhai: "勝ち" | "負け";
    playerUrl: string;
    oppUrl: string;
    playerName: string;
    oppName: string;
    id: number;
  } | null>(null);
  const [animateWin, setAnimateWin] = useState(false);
  const [animateLose, setAnimateLose] = useState(false);

  const bothSelected = myChar !== null && oppChar !== null;

  const getFrequent = (isYou: boolean): CharacterType[] => {
    const counts: Record<number, number> = {};
    history.matches.slice(0, 50).forEach(m => {
      const c = isYou ? m.player : m.opponentPlayer;
      if (c?.characterNo) counts[c.characterNo] = (counts[c.characterNo] || 0) + 1;
    });
    return Object.keys(counts).map(Number)
      .sort((a, b) => counts[b] - counts[a]).slice(0, 5)
      .map(id => characterList.find(c => c.characterNo === id)!).filter(Boolean);
  };

  const myFavs = useMemo(() => getFrequent(true), [history.matches]);
  const oppFavs = useMemo(() => getFrequent(false), [history.matches]);

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
    return t > 0 ? ((history.winCount / t) * 100).toFixed(1) : "100.0";
  }, [history.winCount, history.loseCount]);

  const handleRecord = (shouhai: "勝ち" | "負け") => {
    if (!bothSelected || !myChar || !oppChar) return;

    setShowEffect({
      shouhai,
      playerUrl: myChar.imageUrl,
      oppUrl: oppChar.imageUrl,
      playerName: myChar.characterName,
      oppName: oppChar.characterName,
      id: Date.now()
    });

    if (shouhai === "勝ち") {
      setAnimateWin(true);
      setTimeout(() => setAnimateWin(false), 500);
    } else {
      setAnimateLose(true);
      setTimeout(() => setAnimateLose(false), 500);
    }

    onAddResult({ nichiji: new Date().toISOString(), player: myChar, opponentPlayer: oppChar, shouhai, memo: "" });
    setOppChar(null);
  };

  // キャラ選択パネル行
  const CharRow = ({
    label, color, selected, onSelect, favs, onOpenOverlay,
  }: {
    label: string; color: "red" | "blue";
    selected: CharacterType | null;
    onSelect: (c: CharacterType | null) => void;
    favs: CharacterType[];
    onOpenOverlay: () => void;
  }) => {
    const glow = color === "red"
      ? "border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
      : "border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.7)]";
    const labelCol = color === "red" ? "text-red-400" : "text-blue-400";
    const icon = color === "red" ? "fas fa-user" : "fas fa-times";

    return (
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl px-3 pt-1.5 pb-2 flex flex-col gap-1.5">
        {/* 上行: ラベル左 / 選択キャラ名右 */}
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${labelCol}`}>
            <i className={`${icon} text-[8px]`}></i> {label}
          </span>
          <span className="text-[10px] font-bold text-slate-300">
            {selected?.characterName || <span className="text-slate-600 font-normal">未選択</span>}
          </span>
        </div>

        {/* 下行: アイコン列 */}
        <div className="flex items-center gap-2">
          {/* 選択中キャラ（大きめ） */}
          <button
            onClick={() => selected ? onSelect(null) : onOpenOverlay()}
            className={`w-11 h-11 flex-shrink-0 rounded-full border-2 p-0.5 bg-slate-950/70 flex items-center justify-center transition-all active:scale-90 ${
              selected ? glow : "border-white/10 border-dashed"
            }`}
          >
            {selected
              ? <img src={selected.imageUrl} alt={selected.characterName} className="w-full h-full object-contain pointer-events-none" />
              : <span className="text-slate-600 text-lg">?</span>
            }
          </button>

          {/* セパレーター */}
          <div className="w-px h-7 bg-white/5 flex-shrink-0"></div>

          {/* ファボ一覧 */}
          <div className="flex gap-1.5 items-center overflow-x-auto hide-scrollbar flex-1">
            {favs.map(char => {
              const isSel = selected?.characterNo === char.characterNo;
              const favGlow = color === "red"
                ? "border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                : "border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
              return (
                <button key={`fav-${color}-${char.characterNo}`}
                  onClick={() => isSel ? onSelect(null) : onSelect(char)}
                  className={`w-9 h-9 flex-shrink-0 rounded-full border-2 p-0.5 bg-slate-950/70 flex items-center justify-center transition-all active:scale-90 ${
                    isSel ? favGlow : "border-white/10"
                  }`}>
                  <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
                </button>
              );
            })}
          </div>

          {/* 検索ボタン */}
          <button onClick={onOpenOverlay}
            className="w-8 h-8 rounded-full flex-shrink-0 border border-white/10 bg-slate-800/60 flex items-center justify-center text-slate-500 active:scale-90 transition-all">
            <i className="fas fa-search text-[10px]"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 録画完了アニメーションオーバーレイ */}
      {showEffect && (
        <div
          key={showEffect.id}
          onAnimationEnd={() => setShowEffect(null)}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-6 bg-black/10 backdrop-blur-[1px]"
        >
          {showEffect.shouhai === "勝ち" ? (
            <div className="animate-record-pop bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-amber-500 shadow-[0_10px_40px_rgba(245,158,11,0.3)] rounded-3xl p-5 flex flex-col items-center gap-3.5 text-center max-w-[260px] w-full">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-400 rounded-full flex items-center justify-center text-3xl animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                🏆
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-black">RECORDED</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  VICTORY!
                </span>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border-2 border-red-500 bg-slate-950 p-0.5 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                    <img src={showEffect.playerUrl} alt={showEffect.playerName} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[9px] font-bold text-red-400 max-w-[60px] truncate">{showEffect.playerName}</span>
                </div>
                <span className="text-slate-500 text-xs font-black">VS</span>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-950 p-0.5">
                    <img src={showEffect.oppUrl} alt={showEffect.oppName} className="w-full h-full object-contain opacity-50" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 max-w-[60px] truncate">{showEffect.oppName}</span>
                </div>
              </div>
              <span className="text-[9px] text-amber-300/80 font-medium">勝敗が記録されました</span>
            </div>
          ) : (
            <div className="animate-record-pop bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-blue-500 shadow-[0_10px_40px_rgba(59,130,246,0.3)] rounded-3xl p-5 flex flex-col items-center gap-3.5 text-center max-w-[260px] w-full">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-400 rounded-full flex items-center justify-center text-3xl animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                ⚔️
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-blue-400 font-black">RECORDED</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-300 drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
                  DEFEAT
                </span>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-950 p-0.5">
                    <img src={showEffect.playerUrl} alt={showEffect.playerName} className="w-full h-full object-contain opacity-50" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 max-w-[60px] truncate">{showEffect.playerName}</span>
                </div>
                <span className="text-slate-500 text-xs font-black">VS</span>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-slate-950 p-0.5 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                    <img src={showEffect.oppUrl} alt={showEffect.oppName} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[9px] font-bold text-blue-400 max-w-[60px] truncate">{showEffect.oppName}</span>
                </div>
              </div>
              <span className="text-[9px] text-blue-300/80 font-medium">勝敗が記録されました</span>
            </div>
          )}
        </div>
      )}

      {overlay === "my" && (
        <CharacterPickerOverlay color="red" search={mySearch} setSearch={setMySearch}
          filteredList={myFiltered} selected={myChar} onSelect={setMyChar}
          onClose={() => { setOverlay(null); setMySearch(""); }} idPrefix="my" />
      )}
      {overlay === "opp" && (
        <CharacterPickerOverlay color="blue" search={oppSearch} setSearch={setOppSearch}
          filteredList={oppFiltered} selected={oppChar} onSelect={setOppChar}
          onClose={() => { setOverlay(null); setOppSearch(""); }} idPrefix="opp" />
      )}

      <div className="h-screen w-screen bg-[#07070d] text-white flex flex-col overflow-hidden select-none font-sans box-border">

        {/* ヘッダー */}
        <div className="px-3 py-1.5 flex items-center justify-between border-b border-white/5 bg-slate-950/60 flex-shrink-0">
          {/* LIVE */}
          <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[7px] font-black tracking-widest text-emerald-400 uppercase">連携中</span>
          </div>

          {/* スコア（中央） */}
          <div className="flex items-baseline gap-1 font-black">
            <span className={`text-lg text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] inline-block transition-all duration-200 ${animateWin ? 'animate-score-pop text-amber-300' : ''}`}>{history.winCount}</span>
            <span className="text-[9px] text-slate-500">勝</span>
            <span className="text-slate-600 mx-0.5">-</span>
            <span className={`text-lg text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] inline-block transition-all duration-200 ${animateLose ? 'animate-score-pop text-sky-300' : ''}`}>{history.loseCount}</span>
            <span className="text-[9px] text-slate-500">敗</span>
            <span className="text-[9px] text-slate-400 ml-1">({winRate}%)</span>
          </div>

          {/* 連勝 or アイコン */}
          {streak >= 2 ? (
            <div className="text-[8px] font-black text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded-lg animate-pulse">
              🔥{streak}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-xs opacity-40">🎮</div>
          )}
        </div>

        {/* キャラ選択 */}
        <div className="flex flex-col gap-2 px-3 pt-2 flex-shrink-0">
          <CharRow label="あなた" color="red"
            selected={myChar} onSelect={setMyChar} favs={myFavs}
            onOpenOverlay={() => setOverlay("my")} />
          <CharRow label="相手" color="blue"
            selected={oppChar} onSelect={setOppChar} favs={oppFavs}
            onOpenOverlay={() => setOverlay("opp")} />
        </div>

        {/* スペーサー */}
        <div className="flex-1 min-h-0"></div>

        {/* WIN / LOSE ボタン */}
        <div className="px-3 pb-3 pt-1 flex gap-2.5 flex-shrink-0">
          <button
            onClick={() => handleRecord("勝ち")}
            disabled={!bothSelected}
            className={`flex-1 rounded-2xl font-black transition-all transform active:scale-95 flex flex-col justify-center items-center gap-1 ${
              !bothSelected
                ? "bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed"
                : "bg-gradient-to-br from-red-500 to-rose-700 text-white border-2 border-red-400/50 shadow-[0_4px_30px_rgba(239,68,68,0.4)]"
            }`}
            style={{ height: 'clamp(100px, 24vh, 140px)' }}
          >
            <span className="text-2xl">🏆</span>
            <span className="text-xl tracking-wide">勝ち</span>
            <span className="text-[10px] font-semibold opacity-75">WIN</span>
          </button>

          <button
            onClick={() => handleRecord("負け")}
            disabled={!bothSelected}
            className={`flex-1 rounded-2xl font-black transition-all transform active:scale-95 flex flex-col justify-center items-center gap-1 ${
              !bothSelected
                ? "bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed"
                : "bg-gradient-to-br from-blue-500 to-indigo-700 text-white border-2 border-blue-400/50 shadow-[0_4px_30px_rgba(59,130,246,0.4)]"
            }`}
            style={{ height: 'clamp(100px, 24vh, 140px)' }}
          >
            <span className="text-2xl">⚔️</span>
            <span className="text-xl tracking-wide">負け</span>
            <span className="text-[10px] font-semibold opacity-75">LOSE</span>
          </button>
        </div>

      </div>
    </>
  );
};
