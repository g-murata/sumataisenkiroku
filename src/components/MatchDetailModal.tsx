import React, { useState, useEffect } from "react";
import { MatchResult } from "./Home";
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

      // 初期表示用の日付文字列をセット
      setDateStr(toDateTimeInputStr(match.nichiji));
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const handleSaveClick = () => {
    // ▼ ここが修正ポイント！
    // 1. 元の日時の「分まで」の文字列を作る
    const originalDateInputStr = toDateTimeInputStr(match.nichiji);
    
    // 2. ユーザーがいじった inputの値(dateStr) と比較する
    //    一緒なら「時間は変えてない」とみなして、元の match.nichiji (秒あり) を採用
    //    違うなら「時間を変更した」とみなして、新しい日付 (秒は00になる) を採用
    const finalDate = (dateStr === originalDateInputStr)
      ? match.nichiji 
      : new Date(dateStr).toLocaleString();

    const newMyChar = characterList.find(c => c.characterNo === myCharId) || match.player;
    const newOppChar = characterList.find(c => c.characterNo === oppCharId) || match.opponentPlayer;

    onSave({
      ...match,
      nichiji: finalDate, // 判定後の日付を使う
      memo: memo,
      shouhai: shouhai,
      player: newMyChar || null,
      opponentPlayer: newOppChar || null,
    });
  };

  const handleDeleteClick = () => {
    if (window.confirm("本当にこの対戦記録を削除しますか？")) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-blue-400 text-white p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold">対戦詳細・編集</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* ボディ */}
        <div className="p-6">
          
          {/* 勝敗の変更 */}
          <div className="flex justify-center mb-6 gap-4">
            <button
              onClick={() => setShouhai("勝ち")}
              className={`py-2 px-8 rounded font-bold border-2 ${shouhai === "勝ち" ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-400 border-gray-200"}`}
            >
              勝ち
            </button>
            <button
              onClick={() => setShouhai("負け")}
              className={`py-2 px-8 rounded font-bold border-2 ${shouhai === "負け" ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-400 border-gray-200"}`}
            >
              負け
            </button>
          </div>

          <div className="space-y-4">
            {/* キャラ変更エリア */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">自分</label>
                 <select 
                    className="w-full border rounded p-2 text-sm bg-gray-50"
                    value={myCharId}
                    onChange={(e) => setMyCharId(Number(e.target.value))}
                 >
                    {characterList.map(c => (
                      <option key={`my-edit-${c.characterNo}`} value={c.characterNo}>{c.characterName}</option>
                    ))}
                 </select>
                 <div className="flex justify-center mt-2">
                    <img 
                      src={characterList.find(c => c.characterNo === myCharId)?.imageUrl} 
                      className="h-16 w-16 object-contain"
                      alt="my char"
                    />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">相手</label>
                 <select 
                    className="w-full border rounded p-2 text-sm bg-gray-50"
                    value={oppCharId}
                    onChange={(e) => setOppCharId(Number(e.target.value))}
                 >
                    {characterList.map(c => (
                      <option key={`opp-edit-${c.characterNo}`} value={c.characterNo}>{c.characterName}</option>
                    ))}
                 </select>
                 <div className="flex justify-center mt-2">
                    <img 
                      src={characterList.find(c => c.characterNo === oppCharId)?.imageUrl} 
                      className="h-16 w-16 object-contain"
                      alt="opp char"
                    />
                 </div>
               </div>
            </div>

            <hr className="my-4"/>

            {/* 日時とメモ */}
            <div>
              <label className="block text-sm font-bold text-gray-700">日時</label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">メモ</label>
              <textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                placeholder="対戦の振り返りを入力..."
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="bg-gray-100 p-4 flex justify-between sticky bottom-0">
          <button 
            onClick={handleDeleteClick}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
          >
            削除
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-sm"
            >
              キャンセル
            </button>
            <button 
              onClick={handleSaveClick}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};