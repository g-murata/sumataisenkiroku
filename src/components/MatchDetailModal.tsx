import React, { useState, useEffect } from "react";
import { MatchResult } from "./Home";

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchResult | null;
  onSave: (updatedMatch: MatchResult) => void;
  onDelete: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ isOpen, onClose, match, onSave, onDelete }) => {
  const [memo, setMemo] = useState("");
  const [dateStr, setDateStr] = useState("");

  // モーダルが開かれたとき、propsのデータでstateを初期化
  useEffect(() => {
    if (match) {
      setMemo(match.memo || "");
      // 日時の変換処理 (input type="datetime-local" 用のフォーマットに合わせる)
      // 例: "2024/1/1 12:00:00" -> "2024-01-01T12:00"
      const d = new Date(match.nichiji);
      if (!isNaN(d.getTime())) {
        // 日本時間に合わせる簡易的な処理
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        const hours = (`0${d.getHours()}`).slice(-2);
        const minutes = (`0${d.getMinutes()}`).slice(-2);
        setDateStr(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        setDateStr("");
      }
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const handleSaveClick = () => {
    // 日付文字列を元のフォーマットに戻す（簡易版）
    const newDate = dateStr ? new Date(dateStr).toLocaleString() : match.nichiji;
    
    onSave({
      ...match,
      nichiji: newDate,
      memo: memo,
    });
  };

  const handleDeleteClick = () => {
    if (window.confirm("本当にこの対戦記録を削除しますか？")) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* ヘッダー */}
        <div className="bg-green-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">対戦詳細・編集</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* ボディ */}
        <div className="p-6">
          {/* 対戦カード表示 */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="text-center">
              <span className="text-xs text-gray-500">自分</span>
              <img src={match.player?.imageUrl} alt={match.player?.characterName} className="w-16 h-16 object-contain mx-auto" />
            </div>
            <div className="text-2xl font-bold text-gray-400">VS</div>
            <div className="text-center">
              <span className="text-xs text-gray-500">相手</span>
              <img src={match.opponentPlayer?.imageUrl} alt={match.opponentPlayer?.characterName} className="w-16 h-16 object-contain mx-auto" />
            </div>
          </div>

          <div className="text-center mb-6">
            <span className={`text-2xl font-bold ${match.shouhai === "勝ち" ? "text-red-600" : "text-blue-600"}`}>
              {match.shouhai}
            </span>
          </div>

          {/* 編集フォーム */}
          <div className="space-y-4">
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
                rows={4}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                placeholder="対戦の振り返りを入力..."
              />
            </div>
          </div>
        </div>

        {/* フッター（アクションボタン） */}
        <div className="bg-gray-100 p-4 flex justify-between">
          <button 
            onClick={handleDeleteClick}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            削除
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              キャンセル
            </button>
            <button 
              onClick={handleSaveClick}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};