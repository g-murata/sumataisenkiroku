import React, { useEffect } from 'react';

interface ResultAnimationProps {
  result: "勝ち" | "負け";
  onComplete: () => void;
}

export const ResultAnimation: React.FC<ResultAnimationProps> = ({ result, onComplete }) => {
  
  useEffect(() => {
    // 1.2秒後に消える（少し短縮）
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const isWin = result === "勝ち";
  // 色味は維持しつつ、文字を英語から日本語や短めの英語にしてマイルドに
  const text = isWin ? "WIN!" : "LOSE...";
  // 勝ちなら「赤・黄色系」、負けなら「青・グレー系」
  const textColor = isWin ? "text-red-500 drop-shadow-md" : "text-blue-500 drop-shadow-md";
  const animClass = isWin ? "animate-stamp-in" : "animate-slide-shake";

  return (
    // 背景色(bg-black...)を削除し、pointer-events-noneを追加（後ろのボタンが見える＆間違って押さないように）
    <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
      
      {/* 文字のコンテナ */}
      <div className={`
          flex flex-col items-center justify-center
          bg-white px-8 py-4 rounded-xl shadow-2xl border-4
          ${isWin ? "border-red-500 rotate-[-5deg]" : "border-blue-500 rotate-[5deg]"}
          ${animClass}
        `}
      >
        <h1 className={`text-5xl md:text-6xl font-black italic tracking-tighter ${textColor} stroke-white`}>
          {text}
        </h1>
      </div>

    </div>
  );
};