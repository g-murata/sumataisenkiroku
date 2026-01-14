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

  // ---------------------------------------------------------
  // 1. 新規登録 (Create)
  // ---------------------------------------------------------
  const handleAddResult = async (newMatch: MatchResult) => {
    // ▼ まずは画面（ローカルState）を即更新
    const newMatches = [newMatch, ...history.matches];
    // 勝敗カウントの更新
    const newWin = newMatch.shouhai === "勝ち" ? history.winCount + 1 : history.winCount;
    const newLose = newMatch.shouhai === "負け" ? history.loseCount + 1 : history.loseCount;

    const newState = { matches: newMatches, winCount: newWin, loseCount: newLose };
    setHistory(newState);

    // ▼ データの保存先を分岐
    if (user) {
      // ★ ログイン中: SupabaseへINSERT
      const { error } = await supabase
        .from('matches')
        .insert([
          {
            user_id: user.id, // 誰のデータか
            my_char: newMatch.player?.characterName,
            opponent_char: newMatch.opponentPlayer?.characterName,
            result: newMatch.shouhai,
            date: newMatch.nichiji,
            memo: newMatch.memo
          }
        ]);
      if (error) console.error('Supabase保存エラー:', error);

    } else {
      // ★ ゲスト: LocalStorageへ保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  // ---------------------------------------------------------
  // 2. 編集・更新 (Update) - モーダルから呼ばれる
  // ---------------------------------------------------------
  const handleUpdateMatch = async (updatedMatch: MatchResult) => {
    if (selectedMatchIndex === null) return;

    // ▼ 画面更新用ロジック（日付順ソート＆カウント再計算）
    const newMatches = [...history.matches];
    newMatches[selectedMatchIndex] = updatedMatch;
    newMatches.sort((a, b) => new Date(b.nichiji).getTime() - new Date(a.nichiji).getTime());

    const newWinCount = newMatches.filter(m => m.shouhai === "勝ち").length;
    const newLoseCount = newMatches.filter(m => m.shouhai === "負け").length;

    const newState = { matches: newMatches, winCount: newWinCount, loseCount: newLoseCount };
    
    setHistory(newState);
    setIsModalOpen(false); // モーダルを閉じる

    // ▼ データの保存先を分岐
    if (user && updatedMatch.id) {
      // ★ ログイン中: IDを指定してUPDATE
      const { error } = await supabase
        .from('matches')
        .update({
          my_char: updatedMatch.player?.characterName,
          opponent_char: updatedMatch.opponentPlayer?.characterName,
          result: updatedMatch.shouhai,
          date: updatedMatch.nichiji,
          memo: updatedMatch.memo
        })
        .eq('id', updatedMatch.id); // 必須: 更新対象のID

      if (error) {
        console.error('更新エラー:', error);
        alert('クラウドの保存に失敗しました');
      }
    } else {
      // ★ ゲスト: LocalStorageを上書き
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  // ---------------------------------------------------------
  // 3. 削除 (Delete) - モーダルから呼ばれる
  // ---------------------------------------------------------
  const handleDeleteMatch = async () => {
    if (selectedMatchIndex === null) return;
    const targetMatch = history.matches[selectedMatchIndex];

    // ▼ 画面更新用ロジック
    const newMatches = history.matches.filter((_, i) => i !== selectedMatchIndex);
    // カウントを減らす
    const newWin = targetMatch.shouhai === "勝ち" ? history.winCount - 1 : history.winCount;
    const newLose = targetMatch.shouhai === "負け" ? history.loseCount - 1 : history.loseCount;

    const newState = { matches: newMatches, winCount: newWin, loseCount: newLose };

    setHistory(newState);
    setIsModalOpen(false);

    // ▼ データの削除先を分岐
    if (user && targetMatch.id) {
      // ★ ログイン中: IDを指定してDELETE
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', targetMatch.id);

      if (error) console.error('削除エラー:', error);
    } else {
      // ★ ゲスト: LocalStorageを上書き
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  // ---------------------------------------------------------
  // 4. 全消去 (Reset)
  // ---------------------------------------------------------
  const handleClearResults = async () => {
    const isConfirmed = window.confirm('【重要】\n全ての対戦履歴を削除してリセットしますか？\nこの操作は取り消せません。');
    if (!isConfirmed) return;

    setHistory({ matches: [], winCount: 0, loseCount: 0 });

    if (user) {
      // ★ ログイン中: 自分のデータを全削除
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('user_id', user.id); // 自分のIDに紐づくものを全て

      if (error) console.error('全削除エラー:', error);
    } else {
      // ★ ゲスト: LocalStorageを削除
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  
  return (
    <div>
       <h1>スマ対戦記録</h1>
    </div>
  );
}
