import React, { useState, useEffect } from "react";
import { MatchResult } from '../types';
import { characterList } from "./Character";

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchResult | null;
  onSave: (updatedMatch: MatchResult) => void;
  onDelete: () => void;
}

// 日付オブジェクトから input type="datetime-local" 用の文字列 (yyyy-MM-ddThh:mm) を生成する関数
const toDateTimeInputStr = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const day = (`0${d.getDate()}`).slice(-2);
  const hours = (`0${d.getHours()}`).slice(-2);
  const minutes = (`0${d.getMinutes()}`).slice(-2);
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ isOpen, onClose, match, onSave, onDelete }) => {
  const [memo, setMemo] = useState("");
  const [dateStr, setDateStr] = useState("");
  
  const [shouhai, setShouhai] = useState<"勝ち" | "負け">("勝ち");
  const [myCharId, setMyCharId] = useState<number>(0);
  const [oppCharId, setOppCharId] = useState<number>(0);

  useEffect(() => {
    if (match) {
      setMemo(match.memo || "");
      setShouhai(match.shouhai);
      setMyCharId(match.player?.characterNo || 0);
      setOppCharId(match.opponentPlayer?.characterNo || 0);
      setDateStr(toDateTimeInputStr(match.nichiji));
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const handleSaveClick = () => {
    const originalDateInputStr = toDateTimeInputStr(match.nichiji);
    
    const finalDate = (dateStr === originalDateInputStr)
      ? match.nichiji 
      : new Date(dateStr).toLocaleString();

    const newMyChar = characterList.find(c => c.characterNo === myCharId) || match.player;
    const newOppChar = characterList.find(c => c.characterNo === oppCharId) || match.opponentPlayer;

    onSave({
      ...match,
      nichiji: finalDate,
      memo: memo,
      shouhai: shouhai,
      player: newMyChar || null,
      opponentPlayer: newOppChar || null,
    });
  };

  const handleDeleteClick = () => {
    onDelete();
  };

  const isWin = shouhai === "勝ち";

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] w-full max-w-lg overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto hide-scrollbar" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-slate-950/80 px-5 py-4 border-b border-white/10 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
            📝 対戦ログの編集・確認
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* ボディ */}
        <div className="p-5 flex flex-col gap-5">
          
          {/* 勝敗のトグル */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShouhai("勝ち")}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all border ${
                isWin 
                  ? "bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                  : "bg-slate-950/40 text-slate-500 border-white/5 hover:text-slate-300"
              }`}
            >
              👑 勝ち (WIN)
            </button>
            <button
              onClick={() => setShouhai("負け")}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all border ${
                !isWin 
                  ? "bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                  : "bg-slate-950/40 text-slate-500 border-white/5 hover:text-slate-300"
              }`}
            >
              ❌ 負け (LOSE)
            </button>
          </div>

          {/* キャラ変更エリア */}
          <div className="grid grid-cols-2 gap-4">
             {/* 自分 */}
             <div className="p-3 bg-slate-950/30 border border-white/5 rounded-xl flex flex-col items-center gap-3">
               <label className="text-[10px] font-bold text-slate-400 self-start uppercase tracking-wider">👤 あなたのキャラ</label>
               <select 
                  className="w-full glass-input text-xs"
                  value={myCharId}
                  onChange={(e) => setMyCharId(Number(e.target.value))}
               >
                  {characterList.map(c => (
                    <option key={`my-edit-${c.characterNo}`} value={c.characterNo}>{c.characterName}</option>
                  ))}
               </select>
               <div className={`w-16 h-16 rounded-full bg-slate-950 border flex items-center justify-center p-1.5 mt-1 shadow-inner ${
                 isWin ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-slate-800"
               }`}>
                  <img 
                    src={characterList.find(c => c.characterNo === myCharId)?.imageUrl} 
                    className="w-full h-full object-contain"
                    alt="my char"
                  />
               </div>
             </div>

             {/* 相手 */}
             <div className="p-3 bg-slate-950/30 border border-white/5 rounded-xl flex flex-col items-center gap-3">
               <label className="text-[10px] font-bold text-slate-400 self-start uppercase tracking-wider">⚔️ 相手のキャラ</label>
               <select 
                  className="w-full glass-input text-xs"
                  value={oppCharId}
                  onChange={(e) => setOppCharId(Number(e.target.value))}
               >
                  {characterList.map(c => (
                    <option key={`opp-edit-${c.characterNo}`} value={c.characterNo}>{c.characterName}</option>
                  ))}
               </select>
               <div className={`w-16 h-16 rounded-full bg-slate-950 border flex items-center justify-center p-1.5 mt-1 shadow-inner ${
                 isWin ? "border-slate-800" : "border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
               }`}>
                  <img 
                    src={characterList.find(c => c.characterNo === oppCharId)?.imageUrl} 
                    className="w-full h-full object-contain"
                    alt="opp char"
                  />
               </div>
             </div>
          </div>

          <div className="flex flex-col gap-4 bg-slate-950/30 p-4 border border-white/5 rounded-xl">
            {/* 日時 */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📅 対戦日時</label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full glass-input text-xs bg-slate-950/50"
              />
            </div>
            
            {/* メモ */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📝 対戦メモ・振り返り</label>
              <textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full glass-input text-xs bg-slate-950/50 resize-none"
                placeholder="立ち回りや反省点、対戦相手の特徴などを入力..."
              />
            </div>
          </div>
        </div>

        {/* フッターアクション */}
        <div className="bg-slate-950/60 p-4 border-t border-white/10 flex justify-between sticky bottom-0 z-10">
          <button 
            onClick={handleDeleteClick}
            className="bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-400 hover:text-red-300 font-extrabold py-2 px-4 rounded-xl text-xs transition-all"
          >
            <i className="fas fa-trash-alt mr-1.5"></i>削除
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all border border-white/5"
            >
              キャンセル
            </button>
            <button 
              onClick={handleSaveClick}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 px-5 rounded-xl text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-400/20 transition-all"
            >
              保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};