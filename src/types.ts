// キャラクター情報
export interface CharacterType {
  characterNo: number;
  characterName: string;
  imageUrl: string;
}

// 🏆 個々の試合の記録
export interface MatchResult {
  id?: number; // ★重要：SupabaseのID用に追加（?をつけて「無くてもOK」にする）
  nichiji: string;
  player: CharacterType | null;
  opponentPlayer: CharacterType | null;
  shouhai: "勝ち" | "負け";
  memo: string; // any ではなく string の方が安全です
}

// 📊 全体の試合履歴 & 勝敗数を管理するオブジェクト
export interface MatchHistory {
  matches: MatchResult[];
  winCount: number;
  loseCount: number;
}