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
  // layout: 'vertical' | 'horizontal' | 'minimal' (既定値は 'vertical')
  // limit: 履歴の最大表示数 (既定値は 3)
  // w / width: カードの横幅 (既定値は 340)
  // zoom / scale: 全体のスケール倍率 (既定値は 1)
  // trans / transparent: 背景・境界線の完全透過フラグ (既定値は false)
  // align: カードの水平配置位置 'left' | 'right' | 'center' (既定値は 'left')
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
      recentMatches: matches.slice(0, layout === 'horizontal' ? 3 : limit), // レイアウトやパラメータに応じて制限
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

  // =========================================================
  // 1. ミニマルレイアウト (極小のスコア表示・名札横など)
  // =========================================================
  if (layout === 'minimal') {
    return (
      <div className="p-2 w-max animate-fadeIn">
        <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center gap-3 bg-slate-950/75 border border-white/10 shadow-lg backdrop-blur-md">
          {/* 戦績カウンター */}
          <div className="flex items-center gap-1.5 font-black text-sm tracking-wide">
            <span className="text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]">{stats.win}</span>
            <span className="text-slate-500 text-xs font-bold font-sans">W</span>
            <span className="text-slate-600 text-xs">-</span>
            <span className="text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]">{stats.lose}</span>
            <span className="text-slate-500 text-xs font-bold font-sans">L</span>
          </div>

          {/* 勝率 */}
          <div className="text-[10px] font-bold text-slate-400 border-l border-white/10 pl-3">
            {stats.rate}%
          </div>

          {/* 連勝インジケータ */}
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
  // 2. 横長レイアウト (画面上部や下部バナー、配信カメラ枠下など)
  // =========================================================
  if (layout === 'horizontal') {
    return (
      <div className="p-3 w-max max-w-full overflow-hidden animate-fadeIn">
        <div className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-6 bg-slate-950/75 border border-white/10 shadow-2xl backdrop-blur-md">
          
          {/* 左ブロック: トータルスコア */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">MATCH RECORD</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight leading-none">
                <span className="text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">{stats.win}</span>
                <span className="text-slate-500 text-xs font-bold mx-1">W</span>
                <span className="text-slate-600 text-sm">-</span>
                <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] ml-1">{stats.lose}</span>
                <span className="text-slate-500 text-xs font-bold mx-1">L</span>
              </span>
              <span className="text-xs font-bold text-slate-400">({stats.rate}%)</span>
            </div>
          </div>

          {/* 連勝バッジ */}
          {stats.streak >= 2 && (
            <div className="flex flex-col justify-center items-center px-4 border-l border-white/10 h-8 gap-0.5">
              <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase">STREAK</span>
              <div className="flex items-center gap-1 text-xs font-extrabold text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse">
                🔥 {stats.streak} 連勝中!
              </div>
            </div>
          )}

          {/* 右ブロック: 直近3試合のタイムライン */}
          {stats.recentMatches.length > 0 && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-6 h-8">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mr-2">RECENT</span>
              <div className="flex gap-2">
                {stats.recentMatches.map((m, idx) => {
                  const isWin = m.shouhai === "勝ち";
                  const borderClass = isWin
                    ? "border-red-500/30 bg-red-950/20 shadow-[0_0_6px_rgba(239,68,68,0.2)]"
                    : "border-blue-500/30 bg-blue-950/20 shadow-[0_0_6px_rgba(59,130,246,0.2)]";

                  return (
                    <div 
                      key={`recent-h-${idx}`}
                      className={`px-2 py-1 rounded-xl border flex items-center gap-1.5 transition-all text-xxs font-bold ${borderClass}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center p-0.5">
                        <img src={m.player?.imageUrl} alt="My Fighter" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[8px] text-slate-500">vs</span>
                      <div className="w-5 h-5 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center p-0.5">
                        <img src={m.opponentPlayer?.imageUrl} alt="Opp Fighter" className="w-full h-full object-contain" />
                      </div>
                      <span className={`text-[8px] font-black uppercase px-1 rounded-md ${
                        isWin ? "text-red-400 drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" : "text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]"
                      }`}>
                        {isWin ? "W" : "L"}
                      </span>
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
  // 3. 縦型レイアウト (標準: 800x600のOBSキャンバスに完全フィットするプロ仕様カード)
  // =========================================================
  
  // align パラメータによる左右配置クラスの設定
  let justifyClass = "justify-start";
  if (align === 'right') justifyClass = "justify-end";
  if (align === 'center') justifyClass = "justify-center";

  // 配信枠ジャストフィット用のインラインスタイルの設定
  const cardStyle: React.CSSProperties = {
    width: widthParam === 'full' ? '100%' : `${widthParam}px`,
    height: widthParam === 'full' ? '100%' : 'auto',
    transform: zoomParam !== '1' ? `scale(${zoomParam})` : undefined,
    // ズーム時に配置が右端や中央からズレないよう、Originを配置位置に追従させる
    transformOrigin: align === 'right' ? 'top right' : (align === 'center' ? 'top center' : 'top left'),
  };

  // 背景透過・枠線除去フラグに応じたCSSクラスの出し分け
  const cardBaseClass = isTransparent
    ? "bg-transparent border-transparent shadow-none"
    : "glass-panel bg-slate-950/75 border border-white/10 shadow-2xl backdrop-blur-md rounded-[2rem]";

  return (
    <div className={`w-[800px] h-[600px] bg-transparent overflow-hidden relative flex items-start ${justifyClass} p-6 box-border font-sans select-none animate-fadeIn`}>
      {/* 800x600内のメインフロートカード */}
      <div 
        className={`${cardBaseClass} p-6 flex flex-col gap-4.5 box-border relative overflow-hidden`}
        style={cardStyle}
      >
        
        {/* Win / Lose Stamp Overlay (カードの範囲内に出力) */}
        {animationResult && (
          <div className="absolute inset-0 bg-[#07070d]/85 backdrop-blur-xs flex items-center justify-center animate-fadeIn z-50 rounded-[2rem]">
            <ResultAnimation 
              result={animationResult} 
              mode="absolute"
              onComplete={onAnimationComplete}
            />
          </div>
        )}

        {/* ヘッダー: 戦績統計 */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">STREAM BATTLE RECORD</span>
            
            {/* 連勝インジケータ */}
            {stats.streak >= 2 && (
              <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full animate-bounce">
                <span className="text-[9px] text-amber-400 font-extrabold drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]">
                  🔥 {stats.streak}連勝中!
                </span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black tracking-tight leading-none">
              <span className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">{stats.win}</span>
              <span className="text-slate-500 text-sm font-bold mx-1">W</span>
              <span className="text-slate-600 text-lg">-</span>
              <span className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] ml-1">{stats.lose}</span>
              <span className="text-slate-500 text-sm font-bold mx-1">L</span>
            </span>
            <span className="text-xs font-bold text-slate-400">({stats.rate}%)</span>
          </div>
        </div>

        {/* 光るネオンスプリットプログレスバー */}
        <div className="w-full h-2 bg-slate-950/60 rounded-full border border-white/5 overflow-hidden flex relative">
          {stats.total > 0 ? (
            <>
              <div 
                className="h-full winrate-gradient-win transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                style={{ width: `${stats.winRateNum}%` }}
              ></div>
              <div 
                className="h-full winrate-gradient-lose transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                style={{ width: `${100 - stats.winRateNum}%` }}
              ></div>
              {/* スプリット中点光るインジケータ */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] z-10 transition-all duration-500"
                style={{ left: `${stats.winRateNum}%` }}
              ></div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-800"></div>
          )}
        </div>

        {/* 直近の対戦履歴タイムライン (limit > 0 のときのみ表示) */}
        {limit > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5 pb-1">RECENT MATCHES</span>
            <div className="flex flex-col gap-1.5">
              
              {/* 1. 実際の対戦履歴リスト */}
              {stats.recentMatches.map((m, idx) => {
                const isWin = m.shouhai === "勝ち";
                const borderGlow = isWin
                  ? "border-red-500/10 bg-red-950/5 shadow-[0_0_6px_rgba(239,68,68,0.05)]"
                  : "border-blue-500/10 bg-blue-950/5 shadow-[0_0_6px_rgba(59,130,246,0.05)]";

                return (
                  <div 
                    key={`recent-v-${idx}`}
                    className={`p-2 rounded-xl flex items-center justify-between border ${borderGlow} transition-all`}
                    style={{ height: '50px' }}
                  >
                    {/* 左側: ファイターアバター対面 */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1.5">
                        {/* 自分アバター (w-8 h-8 にリサイズ) */}
                        <div className={`w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center p-0.5 z-10 ${
                          isWin ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "border-slate-800"
                        }`}>
                          <img src={m.player?.imageUrl} alt="My Fighter" className="w-full h-full object-contain" />
                        </div>
                        
                        <span className="text-[7px] text-slate-500 font-extrabold bg-slate-950 border border-white/5 px-0.5 rounded scale-75 z-20">VS</span>

                        {/* 相手アバター (w-8 h-8 にリサイズ) */}
                        <div className={`w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center p-0.5 ${
                          isWin ? "border-slate-800" : "border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                        }`}>
                          <img src={m.opponentPlayer?.imageUrl} alt="Opp Fighter" className="w-full h-full object-contain" />
                        </div>
                      </div>

                      {/* シンプル表示: 対戦キャラ名 */}
                      <span className="text-[9px] font-bold text-slate-300">
                        {m.player?.characterName} vs {m.opponentPlayer?.characterName}
                      </span>
                    </div>

                    {/* 右側: 結果バッジと時間 */}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-slate-500 font-medium">
                        {formatTimeOnly(m.nichiji)}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${
                        isWin 
                          ? "bg-red-500/10 text-red-400 border-red-500/30 drop-shadow-[0_0_4px_rgba(255,51,102,0.4)]" 
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30 drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]"
                      }`}>
                        {isWin ? "WIN" : "LOSE"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* 2. 空スロットの補填（ダミー枠による縦サイズ完全固定） */}
              {Array.from({ length: Math.max(0, limit - stats.recentMatches.length) }).map((_, idx) => (
                <div 
                  key={`empty-v-${idx}`}
                  className="p-2 rounded-xl flex items-center justify-between border border-dashed border-white/5 bg-white/[0.01] opacity-25 select-none transition-all"
                  style={{ height: '50px' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1.5 opacity-20">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-[10px] text-slate-600">-</div>
                      <span className="text-[7px] text-slate-700 font-extrabold bg-slate-950 border border-white/5 px-0.5 rounded scale-75 z-20">VS</span>
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-[10px] text-slate-600">-</div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider">NO MATCH RECORDED</span>
                  </div>
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border border-white/5 text-slate-600">
                    READY
                  </span>
                </div>
              ))}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
