// 使用していない変数があってもエラーにならないよう。
/* eslint-disable no-unused-vars */

import './App.css';

import { supabase } from './supabaseClient';
import { Home } from './components/Home';

const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) console.error('Login error:', error);
};


function App() {
  return (
    <>
      <button 
        onClick={handleLogin}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#4285F4', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer' 
        }}
      >
        Googleでログイン
      </button>    
      <Home />
    </>
   );
}

export default App;
