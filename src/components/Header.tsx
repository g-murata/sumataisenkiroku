import { User } from '@supabase/supabase-js'; // 必要なら型インポート
import { supabase } from '../supabaseClient';

interface HeaderProps {
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const bgColor = user ? "bg-red-400" : "bg-green-400";

  return (
    <div className={`${bgColor} text-white md:mb-3 transition-colors duration-300`}>        
      <div className="flex justify-between items-center p-2 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold flex-grow text-center">スマ対戦記録</h1>
        {user ? (
           <div className="absolute right-4 text-xs md:text-sm bg-black bg-opacity-20 px-2 py-1 rounded">
             {user.email}
             <button onClick={() => supabase.auth.signOut()} style={{ marginLeft: '10px', padding: '2px 8px', color: 'white' }}>ログアウト</button>
           </div>
        ) : (
          <div className="absolute right-4 text-xs md:text-sm bg-white bg-opacity-80 px-2 py-1 rounded">
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} style={{ marginLeft: '10px', padding: '2px 8px', color: 'black' }}>
              Googleでログイン
            </button>
          </div>          
        )}
      </div>
    </div>
  )
}