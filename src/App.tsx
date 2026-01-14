// 使用していない変数があってもエラーにならないよう。
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import './App.css';

import { supabase } from './supabaseClient';
import { Home } from './components/Home';
import { MatchHistory, MatchResult } from './types';

const STORAGE_KEY = "gameResults";

export default function App() {
  const [user, setUser] = useState<any>(null);

  const [history, setHistory] = useState<MatchHistory>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { matches: [], winCount: 0, loseCount: 0 };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);


  return (
    <div>
       <h1>スマ対戦記録</h1>
    </div>
  );
}
