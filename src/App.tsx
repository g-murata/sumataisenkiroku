import { useState, useEffect } from 'react';
import './App.css';

import { supabase } from './supabaseClient';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { MatchHistory, MatchResult } from './types';
import { MatchDetailModal } from './components/MatchDetailModal';
// ▼ 1. キャラクターリストをインポート（IDから画像を復元するために必要）
import { characterList } from './components/Character';

const STORAGE_KEY = "gameResults";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 初期値はローカルストレージから（一瞬表示される用）
  const [history, setHistory] = useState<MatchHistory>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { matches: [], winCount: 0, loseCount: 0 };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(null);

  // ---------------------------------------------------------
  // ▼ 2. Supabaseからデータを読み込む関数 (Read)
  // ---------------------------------------------------------
  const fetchMatches = async (userId: string) => {
    // DBから自分のデータを取得 (作成日時の新しい順)
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('データ取得エラー:', error);
      return;
    }

    if (data) {
      // DBのデータ(スネークケース等)をアプリの型(MatchResult)に変換
      const formattedMatches: MatchResult[] = data.map((d: any) => ({
        id: d.id,
        user_id: d.user_id,
        nichiji: d.date, // ※DBのカラム名に合わせてください
        shouhai: d.result,
        memo: d.memo,
        // ID(数字)からキャラ情報(オブジェクト)を復元
        player: characterList.find(c => c.characterNo === d.my_char_id) || null,
        opponentPlayer: characterList.find(c => c.characterNo === d.opp_char_id) || null,
      }));

      formattedMatches.sort((a, b) => new Date(b.nichiji).getTime() - new Date(a.nichiji).getTime());

      // 勝敗数を再計算
      const win = formattedMatches.filter(m => m.shouhai === "勝ち").length;
      const lose = formattedMatches.filter(m => m.shouhai === "負け").length;

      // 画面更新
      setHistory({
        matches: formattedMatches,
        winCount: win,
        loseCount: lose
      });
    }
  };

  // ---------------------------------------------------------
  // ▼ 3. ログイン監視とデータロードの切り替え
  // ---------------------------------------------------------
  useEffect(() => {
      const init = async () => {
        // セッションチェック
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // ログインしてるなら、データを取り終わるまで待つ (await)
          await fetchMatches(currentUser.id);
        }
        
        // 全部の準備ができたら、ロード終了！(フェードイン開始)
        setIsLoading(false);
      };

      init();

      // ログイン状態の監視 (ここは既存のままでOKですが、isLoading操作は不要)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        // ログアウトしたりアカウント切り替えた時の処理
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchMatches(currentUser.id);
        } else {
          const stored = localStorage.getItem(STORAGE_KEY);
          setHistory(stored ? JSON.parse(stored) : { matches: [], winCount: 0, loseCount: 0 });
        }
      });

      return () => subscription.unsubscribe();
    }, []);


  // ---------------------------------------------------------
  // 4. 新規登録 (Create)
  // ---------------------------------------------------------
  const handleAddResult = async (newMatch: MatchResult) => {
    // まず画面を更新（サクサク動くように）
    const newMatches = [newMatch, ...history.matches];
    const newWin = newMatch.shouhai === "勝ち" ? history.winCount + 1 : history.winCount;
    const newLose = newMatch.shouhai === "負け" ? history.loseCount + 1 : history.loseCount;
    const newState = { matches: newMatches, winCount: newWin, loseCount: newLose };
    
    // 一旦ローカルステート更新（失敗したら戻すなどの処理は省略）
    setHistory(newState);

    if (user) {
      // ★ ログイン中: SupabaseへINSERT
      // handleAddResult 内の supabase.insert 部分

      const { error } = await supabase
        .from('matches')
        .insert([
          {
            user_id: user.id,
            // ▼ ここ修正: IDを保存するように追加！
            my_char_id: newMatch.player?.characterNo,
            opp_char_id: newMatch.opponentPlayer?.characterNo,
            
            // テキストも念のため保存しておく（見やすさのため）
            my_char: newMatch.player?.characterName,
            opponent_char: newMatch.opponentPlayer?.characterName,
            
            result: newMatch.shouhai,
            date: new Date(newMatch.nichiji).toISOString(),
            memo: newMatch.memo
          }
        ]);
      
      if (error) {
        console.error('Supabase保存エラー:', error);
      } else {
        // 保存成功したら、DBから最新データを再取得して整合性を保つ
        fetchMatches(user.id);
      }

    } else {
      // ★ ゲスト: LocalStorageへ保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  // ---------------------------------------------------------
  // 5. 編集・更新 (Update)
  // ---------------------------------------------------------
  const handleUpdateMatch = async (updatedMatch: MatchResult) => {
    if (selectedMatchIndex === null) return;

    // 画面更新ロジック...
    const newMatches = [...history.matches];
    newMatches[selectedMatchIndex] = updatedMatch;
    newMatches.sort((a, b) => new Date(b.nichiji).getTime() - new Date(a.nichiji).getTime());
    const newWinCount = newMatches.filter(m => m.shouhai === "勝ち").length;
    const newLoseCount = newMatches.filter(m => m.shouhai === "負け").length;
    const newState = { matches: newMatches, winCount: newWinCount, loseCount: newLoseCount };

    setHistory(newState);
    setIsModalOpen(false);

    if (user && updatedMatch.id) {
      // ★ ログイン中: UPDATE
      // handleUpdateMatch 内の supabase.update 部分
      const { error } = await supabase
        .from('matches')
        .update({
          // ▼ ここ修正: IDを保存するように追加！
          my_char_id: updatedMatch.player?.characterNo,
          opp_char_id: updatedMatch.opponentPlayer?.characterNo,

          // テキストも更新
          my_char: updatedMatch.player?.characterName,
          opponent_char: updatedMatch.opponentPlayer?.characterName,

          result: updatedMatch.shouhai,
          date: new Date(updatedMatch.nichiji).toISOString(),
          memo: updatedMatch.memo
        })
        .eq('id', updatedMatch.id);

      if (error) console.error('更新エラー:', error);
      else fetchMatches(user.id); // 再取得

    } else {
      // ★ ゲスト: LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  // ---------------------------------------------------------
  // 6. 削除 (Delete)
  // ---------------------------------------------------------
  const handleDeleteMatch = async () => {
    if (selectedMatchIndex === null) return;
    const targetMatch = history.matches[selectedMatchIndex];

    const newMatches = history.matches.filter((_, i) => i !== selectedMatchIndex);
    const newWin = targetMatch.shouhai === "勝ち" ? history.winCount - 1 : history.winCount;
    const newLose = targetMatch.shouhai === "負け" ? history.loseCount - 1 : history.loseCount;
    const newState = { matches: newMatches, winCount: newWin, loseCount: newLose };

    setHistory(newState);
    setIsModalOpen(false);

    if (user && targetMatch.id) {
      // ★ ログイン中: DELETE
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', targetMatch.id);

      if (error) console.error('削除エラー:', error);
      else fetchMatches(user.id); // 再取得

    } else {
      // ★ ゲスト: LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  // ---------------------------------------------------------
  // 7. 全消去 (Reset)
  // ---------------------------------------------------------
  const handleClearResults = async () => {
    if (!window.confirm('本当に全ての履歴を削除しますか？')) return;

    if (user) {
      // ★ ログイン中
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('user_id', user.id);

      if (error) console.error('全削除エラー:', error);
      else fetchMatches(user.id);

    } else {
      // ★ ゲスト
      localStorage.removeItem(STORAGE_KEY);
      setHistory({ matches: [], winCount: 0, loseCount: 0 });
    }
  };

  if (isLoading) {
    return <div className="h-screen w-screen bg-white" />;
  }

  return (    
    <div>
      <Header user={user} />

      <Home 
        history={history}
        onAddResult={handleAddResult}
        onRowClick={(index) => {
          setSelectedMatchIndex(index);
          setIsModalOpen(true);
        }}
        onClearResults={handleClearResults}
        user={user} // ★これを追加！
      />

      <MatchDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatchIndex !== null ? history.matches[selectedMatchIndex] : null}
        onSave={handleUpdateMatch}
        onDelete={handleDeleteMatch}
      />
    </div>
  );
}