import React, { useEffect } from 'react';

interface ResultAnimationProps {
  result: "勝ち" | "負け";
  onComplete?: () => void; 
  mode?: "fixed" | "absolute";
}

export const ResultAnimation: React.FC<ResultAnimationProps> = ({ result, onComplete, mode = "fixed" }) => {
  
  useEffect(() => {
    // onCompleteが渡されている場合のみタイマーセット
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  const isWin = result === "勝ち";
  const text = isWin ? "WIN!" : "LOSE...";
  const textColor = isWin ? "text-red-500 drop-shadow-md" : "text-blue-500 drop-shadow-md";
  const borderColor = isWin ? "border-red-500" : "border-blue-500";
  const rotateClass = isWin ? "rotate-[-5deg]" : "rotate-[5deg]";
  const animClass = isWin ? "animate-stamp-in" : "animate-slide-shake";

  // モードによって配置スタイルを変える
  // fixed: 画面全体（手前に表示）
  // absolute: 親要素（配信枠）の中に表示
  const positionClass = mode === "fixed" ? "fixed inset-0 z-50" : "absolute inset-0 z-10";
  
  // 配信枠内(absolute)のときは、少し文字と余白を小さくする
  const textSizeClass = mode === "fixed" ? "text-6xl md:text-7xl" : "text-4xl";
  const paddingClass = mode === "fixed" ? "px-12 py-6" : "px-4 py-2";

  return (
    <div className={`${positionClass} flex justify-center items-center pointer-events-none overflow-hidden`}>
      <div className={`
          flex flex-col items-center justify-center
          bg-white ${paddingClass} rounded-xl shadow-2xl border-4
          ${borderColor} ${rotateClass}
          ${animClass}
        `}
      >
        <h1 className={`${textSizeClass} font-black italic tracking-tighter ${textColor} stroke-white`}>
          {text}
        </h1>
      </div>
    </div>
  );
};