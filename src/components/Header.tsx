import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface HeaderProps {
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const titleText = user ? "スマ対戦記録" : "スマ対戦記録";
  
  return (
    <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
      <div className="flex justify-between items-center px-4 py-2.5 max-w-7xl mx-auto relative min-h-[3.5rem]">
        {/* アプリロゴ・タイトル */}
        <div className="flex items-center gap-2 flex-grow justify-center md:justify-start">
          <span className="text-lg">🏆</span>
          <h1 className="text-sm font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400">
            {titleText}
            {!user && (
              <span className="text-[9px] font-bold text-slate-500 ml-1.5 border border-slate-700/60 px-1 py-0.5 rounded uppercase bg-slate-900/40">
                おためし版
              </span>
            )}
          </h1>
        </div>

        {/* ログイン・ユーザー情報 */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
          {user ? (
            <div className="bg-slate-900/60 border border-white/10 px-2.5 py-1 rounded-xl text-xxs flex items-center gap-2 transition-all">
              <span className="text-slate-300 font-semibold max-w-[80px] md:max-w-[150px] truncate" title={user.email}>
                👤 {user.email}
              </span>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-slate-400 border border-white/5 px-2 py-0.5 rounded-lg transition-all font-bold"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} 
              className="bg-white hover:bg-slate-200 text-slate-950 font-black px-3 py-1 rounded-xl text-[10px] shadow-lg flex items-center gap-1.5 transition-all transform hover:scale-105"
            >
              <i className="fab fa-google"></i> Googleでログイン
            </button>
          )}
        </div>
      </div>

      {/* アカウント状態を示す薄いネオンインジケータバー */}
      {user ? (
        <div className="h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 shadow-[0_1px_8px_rgba(16,185,129,0.5)] w-full"></div>
      ) : (
        <div className="h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 shadow-[0_1px_8px_rgba(99,102,241,0.5)] w-full"></div>
      )}
    </div>
  );
};