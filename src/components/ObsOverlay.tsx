import React, { useMemo } from 'react';
import { MatchHistory, MatchResult } from '../types';
import { characterList } from './Character';
import { ResultAnimation } from './ResultAnimation';

interface ObsOverlayProps {
  history: MatchHistory;
  animationResult?: "勝ち" | "負け" | null;
  onAnimationComplete?: () => void;
}

export const ObsOverlay: React.FC<ObsOverlayProps> = ({ 
  history,
  animationResult,
  onAnimationComplete
}) => {
  // URLパラメータから各種表示オプションを取得
  const searchParams = new URLSearchParams(window.location.search);
  const layout = searchParams.get('layout') || 'vertical';
  
  const limitParam = searchParams.get('limit');
  const limit = limitParam !== null ? parseInt(limitParam, 10) : 3;

  const widthParam = searchParams.get('w') || searchParams.get('width') || '340';
  const zoomParam = searchParams.get('zoom') || searchParams.get('scale') || '1';
  const isTransparent = searchParams.get('trans') === 'true' || searchParams.get('transparent') === 'true';
  const align = searchParams.get('align') || 'left';

  // 履歴データから算出する戦績データ
  const stats = useMemo(() => {
    const matches = history.matches || [];
    const win = history.winCount ?? 0;
    const lose = history.loseCount ?? 0;
    const total = win + lose;
    const rate = total > 0 ? ((win / total) * 100).toFixed(1) : "0.0";
    const winRateNum = total > 0 ? (win / total) * 100 : 50;

    // 現在の連勝記録を計算（直近の試合から遡る）
    let streak = 0;
    for (const m of matches) {
      if (m.shouhai === "勝ち") {
        streak++;
      } else {
        break; // 負けが出た時点でストップ
      }
    }

    return {
      win,
      lose,
      total,
      rate,
      winRateNum,
      streak,
      recentMatches: matches.slice(0, layout === 'horizontal' ? 3 : limit),
    };
  }, [history, layout, limit]);

  // 日付のシンプルフォーマット (時:分 のみ)
  const formatTimeOnly = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
  };

  // align パラメータによる左右配置クラスの設定
  let justifyClass = "justify-start";
  if (align === 'right') justifyClass = "justify-end";
  if (align === 'center') justifyClass = "justify-center";

  // =========================================================
  // 1. ミニマルレイアウト
  // =========================================================
  if (layout === 'minimal') {
    return (
      <div className="p-2 w-max animate-fadeIn">
        <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center gap-3 bg-slate-950/75 border border-white/10 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-black text-sm tracking-wide">
            <span className="text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]">{stats.win}</span>
            <span className="text-slate-500 text-xs font-bold">勝</span>
            <span className="text-slate-600 text-xs">-</span>
            <span className="text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]">{stats.lose}</span>
            <span className="text-slate-500 text-xs font-bold">敗</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 border-l border-white/10 pl-3">
            {stats.rate}%
          </div>
          {stats.streak >= 2 && (
            <div className="flex items-center gap-0.5 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]">
              🔥 {stats.streak}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. 横長レイアウト
  // =========================================================
  if (layout === 'horizontal') {
    return (
      <div className="p-3 w-max max-w-full overflow-hidden animate-fadeIn">
        <div className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-6 bg-slate-950/75 border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black tracking-widest text-slate-500 block">トータル戦績</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight leading-none">
                <span className="text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">{stats.win}</span>
                <span className="text-slate-500 text-xs font-bold mx-1">勝</span>
                <span className="text-slate-600 text-sm">-</span>
                <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] ml-1">{stats.lose}</span>
                <span className="text-slate-500 text-xs font-bold mx-1">敗</span>
              </span>
              <span className="text-xs font-bold text-slate-400">({stats.rate}%)</span>
            </div>
          </div>
          {stats.streak >= 2 && (
            <div className="flex flex-col justify-center items-center px-4 border-l border-white/10 h-8 gap-0.5">
              <span className="text-[8px] font-black tracking-widest text-slate-500">連勝記録</span>
              <div className="flex items-center gap-1 text-xs font-extrabold text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse">
                🔥 {stats.streak} 連勝中!
              </div>
            </div>
          )}
          {stats.recentMatches.length > 0 && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-6 h-8">
              <span className="text-[9px] font-black tracking-widest text-slate-500 mr-2">最近の対戦</span>
              <div className="flex gap-2">
                {stats.recentMatches.map((m, idx) => {
                  const isWin = m.shouhai === "勝ち";
                  const borderClass = isWin ? "border-red-500/30 bg-red-950/20 shadow-[0_0_6px_rgba(239,68,68,0.2)]" : "border-blue-500/30 bg-blue-950/20 shadow-[0_0_6px_rgba(59,130,246,0.2)]";
                  return (
                    <div key={`recent-h-${idx}`} className={`px-2 py-1 rounded-xl border flex items-center gap-1.5 transition-all text-xxs font-bold ${borderClass}`}>
                      <div className="w-5 h-5 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center p-0.5">
                        <img src={m.player?.imageUrl} alt="My Fighter" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[8px] text-slate-500">vs</span>
                      <div className="w-5 h-5 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center p-0.5">
                        <img src={m.opponentPlayer?.imageUrl} alt="Opp Fighter" className="w-full h-full object-contain" />
                      </div>
                      <span className={`text-[8px] font-black px-1 rounded-md ${isWin ? "text-red-400" : "text-blue-400"}`}>{isWin ? "勝" : "敗"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // 3. コンパクト・アイコンモード
  // =========================================================
  if (layout === 'compact') {
    // コンパクトモード用のスケーリングスタイル
    const compactStyle: React.CSSProperties = {
      transform: zoomParam !== '1' ? `scale(${zoomParam})` : undefined,
      transformOrigin: 'top center',
    };

    return (
      <div className="w-full h-full overflow-hidden flex flex-col items-center p-4 box-border animate-fadeIn">
        <div style={compactStyle} className="flex flex-col items-center gap-5">
          {/* トータルスコア (極限までコンパクト) */}
          <div className="flex items-center gap-4 font-black drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">{stats.win}</span>
              <span className="text-[10px] text-red-400/80 font-bold">勝</span>
            </div>
            <span className="text-2xl text-slate-600/50 italic">/</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">{stats.lose}</span>
              <span className="text-[10px] text-blue-400/80 font-bold">敗</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 items-center">
            {stats.recentMatches.map((m, idx) => {
              const isWin = m.shouhai === "勝ち";
              const glowColor = isWin ? "rgba(239,68,68,0.4)" : "rgba(59,130,246,0.4)";
              
              return (
                <div key={`compact-v-${idx}`} className="relative flex items-center justify-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-950/20 border border-white/5 group">
                  <div className="absolute inset-0 rounded-2xl blur-xl opacity-20" style={{ backgroundColor: glowColor }}></div>
                  
                  {/* 自分 (左) */}
                  <div className={`rounded-full flex items-center justify-center transition-all duration-300 z-20 relative ${
                    isWin 
                      ? "w-14 h-14 border-2 border-red-500 p-1 shadow-[0_0_20px_rgba(239,68,68,0.6)] bg-slate-950" 
                      : "w-9 h-9 border border-white/10 opacity-50 bg-slate-900"
                  }`}>
                    <img src={m.player?.imageUrl} alt="Me" className="w-full h-full object-contain" />
                    {isWin ? (
                      <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full border border-slate-900 flex items-center justify-center text-[10px] font-black z-30 bg-red-600 text-white shadow-lg">勝</div>
                    ) : (
                      <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[7px] font-black z-30 bg-white/10 text-white/40">敗</div>
                    )}
                  </div>

                  {/* 中央: VS + 時間 */}
                  <div className="flex flex-col items-center gap-0 min-w-[32px]">
                    <span className="text-[10px] font-black text-white/20 leading-none italic">VS</span>
                    <span className="text-[9px] font-black text-white/40 tracking-tighter mt-1">
                      {formatTimeOnly(m.nichiji)}
                    </span>
                  </div>

                  {/* 相手 (右) */}
                  <div className={`rounded-full bg-slate-900 border flex items-center justify-center transition-all duration-300 z-10 relative ${
                    !isWin 
                      ? "w-14 h-14 border-2 border-blue-500 p-1 shadow-[0_0_20px_rgba(59,130,246,0.6)] bg-slate-950" 
                      : "w-9 h-9 border border-white/10 opacity-50 bg-slate-900"
                  }`}>
                    <img src={m.opponentPlayer?.imageUrl} alt="Opponent" className="w-full h-full object-contain" />
                    {!isWin ? (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full border border-slate-900 flex items-center justify-center text-[10px] font-black z-30 bg-blue-600 text-white shadow-lg">勝</div>
                    ) : (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[7px] font-black z-30 bg-white/10 text-white/40">敗</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 4. 縦型レイアウト (標準)
  // =========================================================
  const cardStyle: React.CSSProperties = {
    width: widthParam === 'full' ? '100%' : `${widthParam}px`,
    height: widthParam === 'full' ? '100%' : 'auto',
    transform: zoomParam !== '1' ? `scale(${zoomParam})` : undefined,
    transformOrigin: align === 'right' ? 'top right' : (align === 'center' ? 'top center' : 'top left'),
  };

  const cardBaseClass = isTransparent
    ? "bg-transparent border-transparent shadow-none"
    : "glass-panel bg-slate-950/75 border border-white/10 shadow-2xl backdrop-blur-md rounded-[2rem]";

  return (
    <div className={`w-[800px] h-[600px] bg-transparent overflow-hidden relative flex items-start ${justifyClass} p-6 box-border font-sans select-none animate-fadeIn`}>
      <div className={`${cardBaseClass} p-6 flex flex-col gap-4.5 box-border relative overflow-hidden`} style={cardStyle}>
        {animationResult && (
          <div className="absolute inset-0 bg-[#07070d]/85 backdrop-blur-xs flex items-center justify-center animate-fadeIn z-50 rounded-[2rem]">
            <ResultAnimation result={animationResult} mode="absolute" onComplete={onAnimationComplete} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-indigo-400/70">対戦成績</span>
            <div className="flex items-baseline gap-1 font-black">
              <span className="text-base text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]">{stats.win}</span>
              <span className="text-[9px] text-slate-500">勝</span>
              <span className="text-slate-600 text-xs mx-0.5">-</span>
              <span className="text-base text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]">{stats.lose}</span>
              <span className="text-[9px] text-slate-500">敗</span>
              <span className="text-[9px] text-slate-500 ml-1">({stats.rate}%)</span>
            </div>
          </div>
          {stats.streak >= 2 && (
            <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-full animate-bounce">
              <span className="text-[11px] text-amber-400 font-extrabold drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">🔥 {stats.streak}連勝中!</span>
            </div>
          )}
        </div>
        <div className="w-full h-3 bg-slate-950/60 rounded-full border border-white/5 overflow-hidden flex relative">
          {stats.total > 0 ? (
            <>
              <div className="h-full winrate-gradient-win transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" style={{ width: `${stats.winRateNum}%` }}></div>
              <div className="h-full winrate-gradient-lose transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${100 - stats.winRateNum}%` }}></div>
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] z-10 transition-all duration-500" style={{ left: `${stats.winRateNum}%` }}></div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-800"></div>
          )}
        </div>
        {limit > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[10px] font-black tracking-widest text-slate-500 border-b border-white/5 pb-1">最近の対戦結果</span>
            <div className="flex flex-col gap-1.5">
              {stats.recentMatches.map((m, idx) => {
                const isWin = m.shouhai === "勝ち";
                const borderGlow = isWin ? "border-red-500/10 bg-red-950/5 shadow-[0_0_6px_rgba(239,68,68,0.05)]" : "border-blue-500/10 bg-blue-950/5 shadow-[0_0_6px_rgba(59,130,246,0.05)]";
                return (
                  <div key={`recent-v-${idx}`} className={`px-4 rounded-2xl flex items-center justify-between border ${borderGlow} transition-all`} style={{ height: '64px' }}>
                    <div className="flex items-center -space-x-3">
                      <div className={`w-12 h-12 rounded-full bg-slate-900 border-2 flex items-center justify-center p-0.5 z-10 ${isWin ? "border-red-500/70 shadow-[0_0_16px_rgba(239,68,68,0.6)]" : "border-slate-700"}`}>
                        <img src={m.player?.imageUrl} alt="My Fighter" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[8px] text-slate-500 font-extrabold bg-slate-950 border border-white/10 px-1 py-0.5 rounded z-20">VS</span>
                      <div className={`w-12 h-12 rounded-full bg-slate-900 border-2 flex items-center justify-center p-0.5 ${isWin ? "border-slate-700" : "border-blue-500/70 shadow-[0_0_16px_rgba(59,130,246,0.6)]"}`}>
                        <img src={m.opponentPlayer?.imageUrl} alt="Opp Fighter" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center ml-2">
                       <span className="text-[12px] font-black text-slate-400">{formatTimeOnly(m.nichiji)}</span>
                    </div>
                    <span className={`text-[13px] font-black tracking-widest px-4 py-2 rounded-xl border ${isWin ? "bg-red-500/15 text-red-400 border-red-500/40" : "bg-blue-500/15 text-blue-400 border-blue-500/40"}`}>{isWin ? "勝ち" : "負け"}</span>
                  </div>
                );
              })}
              {Array.from({ length: Math.max(0, limit - stats.recentMatches.length) }).map((_, idx) => (
                <div key={`empty-v-${idx}`} className="px-4 rounded-2xl flex items-center justify-between border border-dashed border-white/5 bg-white/[0.01] opacity-20 select-none transition-all" style={{ height: '64px' }}>
                  <div className="flex items-center -space-x-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-slate-600">?</div>
                    <span className="text-[8px] text-slate-700 font-extrabold bg-slate-950 border border-white/10 px-1 py-0.5 rounded z-20">VS</span>
                    <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-slate-600">?</div>
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/5 text-slate-600">----</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
