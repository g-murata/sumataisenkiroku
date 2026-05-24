import { useState, useMemo } from 'react';

import { CharacterType, MatchResult } from '../types';

export const characterList: CharacterType[] = [
  { characterNo: 1, characterName: 'マリオ', imageUrl: `${import.meta.env.BASE_URL}fighter/mario.png` },
  { characterNo: 2, characterName: 'ドンキー', imageUrl: `${import.meta.env.BASE_URL}fighter/donkey.png` },
  { characterNo: 3, characterName: 'リンク', imageUrl: `${import.meta.env.BASE_URL}fighter/link.png` },
  { characterNo: 4, characterName: 'サムス', imageUrl: `${import.meta.env.BASE_URL}fighter/samus.png` },
  { characterNo: 5, characterName: 'ダークサムス', imageUrl: `${import.meta.env.BASE_URL}fighter/samusd.png` },
  { characterNo: 6, characterName: 'ヨッシー', imageUrl: `${import.meta.env.BASE_URL}fighter/yoshi.png` },
  { characterNo: 7, characterName: 'カービィ', imageUrl: `${import.meta.env.BASE_URL}fighter/kirby.png` },
  { characterNo: 8, characterName: 'フォックス', imageUrl: `${import.meta.env.BASE_URL}fighter/fox.png` },
  { characterNo: 9, characterName: 'ピカチュウ', imageUrl: `${import.meta.env.BASE_URL}fighter/pikachu.png` },
  { characterNo: 10, characterName: 'ルイージ', imageUrl: `${import.meta.env.BASE_URL}fighter/luigi.png` },
  { characterNo: 11, characterName: 'ネス', imageUrl: `${import.meta.env.BASE_URL}fighter/ness.png` },
  { characterNo: 12, characterName: 'キャプテンファルコン', imageUrl: `${import.meta.env.BASE_URL}fighter/captain.png` },
  { characterNo: 13, characterName: 'プリン', imageUrl: `${import.meta.env.BASE_URL}fighter/purin.png` },
  { characterNo: 14, characterName: 'ピーチ', imageUrl: `${import.meta.env.BASE_URL}fighter/peach.png` },
  { characterNo: 15, characterName: 'デイジー', imageUrl: `${import.meta.env.BASE_URL}fighter/daisy.png` },
  { characterNo: 16, characterName: 'クッパ', imageUrl: `${import.meta.env.BASE_URL}fighter/koopa.png` },
  { characterNo: 17, characterName: 'アイスクライマー', imageUrl: `${import.meta.env.BASE_URL}fighter/ice_climber.png` },
  { characterNo: 18, characterName: 'シーク', imageUrl: `${import.meta.env.BASE_URL}fighter/sheik.png` },
  { characterNo: 19, characterName: 'ゼルダ', imageUrl: `${import.meta.env.BASE_URL}fighter/zelda.png` },
  { characterNo: 20, characterName: 'ドクターマリオ', imageUrl: `${import.meta.env.BASE_URL}fighter/mariod.png` },
  { characterNo: 21, characterName: 'ピチュー', imageUrl: `${import.meta.env.BASE_URL}fighter/pichu.png` },
  { characterNo: 22, characterName: 'ファルコ', imageUrl: `${import.meta.env.BASE_URL}fighter/falco.png` },
  { characterNo: 23, characterName: 'マルス', imageUrl: `${import.meta.env.BASE_URL}fighter/marth.png` },
  { characterNo: 24, characterName: 'ルキナ', imageUrl: `${import.meta.env.BASE_URL}fighter/lucina.png` },
  { characterNo: 25, characterName: 'こどもリンク', imageUrl: `${import.meta.env.BASE_URL}fighter/younglink.png` },
  { characterNo: 26, characterName: 'ガノン', imageUrl: `${import.meta.env.BASE_URL}fighter/ganon.png` },
  { characterNo: 27, characterName: 'ミュウツー', imageUrl: `${import.meta.env.BASE_URL}fighter/mewtwo.png` },
  { characterNo: 28, characterName: 'ロイ', imageUrl: `${import.meta.env.BASE_URL}fighter/roy.png` },
  { characterNo: 29, characterName: 'クロム', imageUrl: `${import.meta.env.BASE_URL}fighter/chrom.png` },
  { characterNo: 30, characterName: 'ゲッチ', imageUrl: `${import.meta.env.BASE_URL}fighter/gamewatch.png` },
  { characterNo: 31, characterName: 'メタナイト', imageUrl: `${import.meta.env.BASE_URL}fighter/metaknight.png` },
  { characterNo: 32, characterName: 'ピット', imageUrl: `${import.meta.env.BASE_URL}fighter/pit.png` },
  { characterNo: 33, characterName: 'ブラックピット', imageUrl: `${import.meta.env.BASE_URL}fighter/pitb.png` },
  { characterNo: 34, characterName: 'ゼロスーツサムス', imageUrl: `${import.meta.env.BASE_URL}fighter/szerosuit.png` },
  { characterNo: 35, characterName: 'ワリオ', imageUrl: `${import.meta.env.BASE_URL}fighter/wario.png` },
  { characterNo: 36, characterName: 'スネーク', imageUrl: `${import.meta.env.BASE_URL}fighter/snake.png` },
  { characterNo: 37, characterName: 'アイク', imageUrl: `${import.meta.env.BASE_URL}fighter/ike.png` },
  { characterNo: 38, characterName: 'ポケモントレーナー', imageUrl: `${import.meta.env.BASE_URL}fighter/ptrainer.png` },
  { characterNo: 39, characterName: 'ディディー', imageUrl: `${import.meta.env.BASE_URL}fighter/diddy.png` },
  { characterNo: 40, characterName: 'リュカ', imageUrl: `${import.meta.env.BASE_URL}fighter/lucas.png` },
  { characterNo: 41, characterName: 'ソニック', imageUrl: `${import.meta.env.BASE_URL}fighter/sonic.png` },
  { characterNo: 42, characterName: 'デデデ', imageUrl: `${import.meta.env.BASE_URL}fighter/dedede.png` },
  { characterNo: 43, characterName: 'ピクミン＆オリマー', imageUrl: `${import.meta.env.BASE_URL}fighter/pikmin.png` },
  { characterNo: 44, characterName: 'ルカリオ', imageUrl: `${import.meta.env.BASE_URL}fighter/lucario.png` },
  { characterNo: 45, characterName: 'ロボット', imageUrl: `${import.meta.env.BASE_URL}fighter/robot.png` },
  { characterNo: 46, characterName: 'トゥーンリンク', imageUrl: `${import.meta.env.BASE_URL}fighter/toonlink.png` },
  { characterNo: 47, characterName: 'ウルフ', imageUrl: `${import.meta.env.BASE_URL}fighter/wolf.png` },
  { characterNo: 48, characterName: 'むらびと', imageUrl: `${import.meta.env.BASE_URL}fighter/murabito.png` },
  { characterNo: 49, characterName: 'ロックマン', imageUrl: `${import.meta.env.BASE_URL}fighter/rockman.png` },
  { characterNo: 50, characterName: 'WiiFitトレーナー', imageUrl: `${import.meta.env.BASE_URL}fighter/wiifit.png` },
  { characterNo: 51, characterName: 'ロゼッタ＆チコ', imageUrl: `${import.meta.env.BASE_URL}fighter/rosetta.png` },
  { characterNo: 52, characterName: 'リトルマック', imageUrl: `${import.meta.env.BASE_URL}fighter/littlemac.png` },
  { characterNo: 53, characterName: 'ゲッコウガ', imageUrl: `${import.meta.env.BASE_URL}fighter/gekkouga.png` },
  { characterNo: 54, characterName: 'パルテナ', imageUrl: `${import.meta.env.BASE_URL}fighter/palutena.png` },
  { characterNo: 55, characterName: 'パックマン', imageUrl: `${import.meta.env.BASE_URL}fighter/pacman.png` },
  { characterNo: 56, characterName: 'シュルク', imageUrl: `${import.meta.env.BASE_URL}fighter/shulk.png` },
  { characterNo: 57, characterName: 'ルフレ', imageUrl: `${import.meta.env.BASE_URL}fighter/reflet.png` },
  { characterNo: 58, characterName: 'クッパJr', imageUrl: `${import.meta.env.BASE_URL}fighter/koopajr.png` },
  { characterNo: 59, characterName: 'ダックハント', imageUrl: `${import.meta.env.BASE_URL}fighter/duckhunt.png` },
  { characterNo: 60, characterName: 'リュウ', imageUrl: `${import.meta.env.BASE_URL}fighter/ryu.png` },
  { characterNo: 61, characterName: 'ケン', imageUrl: `${import.meta.env.BASE_URL}fighter/ken.png` },
  { characterNo: 62, characterName: 'クラウド', imageUrl: `${import.meta.env.BASE_URL}fighter/cloud.png` },
  { characterNo: 63, characterName: 'カムイ', imageUrl: `${import.meta.env.BASE_URL}fighter/kamui.png` },
  { characterNo: 64, characterName: 'ベヨネッタ', imageUrl: `${import.meta.env.BASE_URL}fighter/bayonetta.png` },
  { characterNo: 65, characterName: 'インクリング', imageUrl: `${import.meta.env.BASE_URL}fighter/inkling.png` },
  { characterNo: 66, characterName: 'リドリー', imageUrl: `${import.meta.env.BASE_URL}fighter/ridley.png` },
  { characterNo: 67, characterName: 'シモン', imageUrl: `${import.meta.env.BASE_URL}fighter/simon.png` },
  { characterNo: 68, characterName: 'リヒター', imageUrl: `${import.meta.env.BASE_URL}fighter/richter.png` },
  { characterNo: 69, characterName: 'キングクルール', imageUrl: `${import.meta.env.BASE_URL}fighter/krool.png` },
  { characterNo: 70, characterName: 'しずえ', imageUrl: `${import.meta.env.BASE_URL}fighter/shizue.png` },
  { characterNo: 71, characterName: 'ガオガエン', imageUrl: `${import.meta.env.BASE_URL}fighter/gaogaen.png` },
  { characterNo: 72, characterName: 'パックンフラワー', imageUrl: `${import.meta.env.BASE_URL}fighter/packun.png` },
  { characterNo: 73, characterName: 'ジョーカー', imageUrl: `${import.meta.env.BASE_URL}fighter/jack.png` },
  { characterNo: 74, characterName: '勇者', imageUrl: `${import.meta.env.BASE_URL}fighter/brave_01.png` },
  { characterNo: 75, characterName: 'バンジョー＆カズーイ', imageUrl: `${import.meta.env.BASE_URL}fighter/buddy.png` },
  { characterNo: 76, characterName: 'テリー', imageUrl: `${import.meta.env.BASE_URL}fighter/dolly.png` },
  { characterNo: 77, characterName: 'ベレト', imageUrl: `${import.meta.env.BASE_URL}fighter/master.png` },
  { characterNo: 78, characterName: 'ミェンミェン', imageUrl: `${import.meta.env.BASE_URL}fighter/tantan.png` },
  { characterNo: 79, characterName: 'スティーブ', imageUrl: `${import.meta.env.BASE_URL}fighter/pickel.png` },
  { characterNo: 80, characterName: 'セフィロス', imageUrl: `${import.meta.env.BASE_URL}fighter/edge.png` },
  { characterNo: 81, characterName: 'ホムラ/ヒカリ', imageUrl: `${import.meta.env.BASE_URL}fighter/eflame.png` },
  { characterNo: 82, characterName: 'カズヤ', imageUrl: `${import.meta.env.BASE_URL}fighter/demon.png` },
  { characterNo: 83, characterName: 'ソラ', imageUrl: `${import.meta.env.BASE_URL}fighter/trail.png` },
  { characterNo: 84, characterName: '格闘mii', imageUrl: `${import.meta.env.BASE_URL}fighter/miifighter.png` },
  { characterNo: 85, characterName: '剣術mii', imageUrl: `${import.meta.env.BASE_URL}fighter/miiswordsman.png` },
  { characterNo: 86, characterName: '射撃mii', imageUrl: `${import.meta.env.BASE_URL}fighter/miigunner.png` },
]

interface CharacterProps {
  player: string;
  onSelectCharacter: (character: CharacterType | null) => void;
  selectedCharacter: CharacterType | null;
  matches: MatchResult[];
}

// ひらがなからカタカナへの変換ユーティリティ
const toKatakana = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
};

export const Character: React.FC<CharacterProps> = ({
  player,
  onSelectCharacter,
  selectedCharacter,
  matches
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isYou = player === "あなた";

  // クイック表示除外リストの状態管理
  const [excludedIds, setExcludedIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(isYou ? "excludedFighters_you" : "excludedFighters_opp");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 除外処理
  const handleExcludeCharacter = (id: number) => {
    const newExcluded = [...excludedIds, id];
    setExcludedIds(newExcluded);
    localStorage.setItem(isYou ? "excludedFighters_you" : "excludedFighters_opp", JSON.stringify(newExcluded));
  };

  // 除外リセット処理
  const handleResetExclusion = () => {
    setExcludedIds([]);
    localStorage.removeItem(isYou ? "excludedFighters_you" : "excludedFighters_opp");
  };

  // 対戦履歴から「よく使うキャラ」を動的に集計
  const frequentCharacters = useMemo(() => {
    const counts: Record<number, number> = {};
    
    // 「あなた」の場合は「最近よく使う」にするため、直近30試合に絞る
    // 「相手」の場合は全体の対戦履歴（制限なし）とする
    const targetMatches = isYou ? matches.slice(0, 30) : matches;

    targetMatches.forEach((m) => {
      const char = isYou ? m.player : m.opponentPlayer;
      if (char && char.characterNo) {
        // 除外リストに入っているIDは省く
        if (excludedIds.includes(char.characterNo)) return;
        counts[char.characterNo] = (counts[char.characterNo] || 0) + 1;
      }
    });

    const sortedIds = Object.keys(counts)
      .map(Number)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 4);

    return sortedIds
      .map(id => characterList.find(c => c.characterNo === id))
      .filter((c): c is CharacterType => !!c);
  }, [matches, isYou, excludedIds]);

  // 検索ワードでフィルタリング（ひらがなでもカタカナでも部分一致するように対応）
  const filteredList = characterList.filter(character => {
    if (!searchTerm) return true;
    const query = toKatakana(searchTerm.trim().toLowerCase());
    const name = toKatakana(character.characterName.toLowerCase());
    return name.includes(query);
  });

  const activeBorderClass = isYou
    ? "border-red-500 bg-red-950/40 shadow-[0_0_12px_rgba(239,68,68,0.6)] scale-105"
    : "border-blue-500 bg-blue-950/40 shadow-[0_0_12px_rgba(59,130,246,0.6)] scale-105";

  const hoverBorderColor = isYou ? "hover:border-red-400" : "hover:border-blue-400";
  const headingIcon = isYou ? "👤" : "⚔️";
  const accentText = isYou ? "text-red-400" : "text-blue-400";

  return (
    <div className="w-full flex flex-col gap-3">
      {/* --- 現在の選択キャラ表示パネル --- */}
      <div className={`p-3 rounded-xl border border-white/5 glass-panel flex items-center justify-between min-h-[5.5rem] transition-all duration-300`}>
        <div className="flex items-center gap-3">
          {selectedCharacter ? (
            <>
              <div className={`w-14 h-14 rounded-lg bg-slate-950/40 border-2 flex items-center justify-center p-1 ${isYou ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]'}`}>
                <img
                  className="w-full h-full object-contain"
                  src={selectedCharacter.imageUrl}
                  alt={selectedCharacter.characterName}
                />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-semibold">{headingIcon} {player}の使用ファイター</span>
                <span className={`text-lg font-bold block leading-tight ${accentText}`}>
                  {selectedCharacter.characterName}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xl font-bold">
                ?
              </div>
              <div>
                <span className="text-xs text-gray-500 block font-semibold">{headingIcon} {player}</span>
                <span className="text-sm text-slate-400 block">ファイターを選択してね</span>
              </div>
            </div>
          )}
        </div>
        {selectedCharacter && (
          <button 
            onClick={() => onSelectCharacter(null)}
            className="text-[10px] text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1 font-bold"
            title="ファイターを選び直す"
          >
            <i className="fas fa-sync-alt text-slate-400"></i> 選び直す
          </button>
        )}
      </div>

      {/* --- よく使うキャラ（お気に入り）クイックパネル --- */}
      {(frequentCharacters.length > 0 || excludedIds.length > 0) && (
        <div className={`flex flex-col gap-1 ${selectedCharacter ? 'hidden' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-xxs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
              ⭐ {isYou ? "最近よく使う" : "よく対戦する"}ファイター
            </span>
            {excludedIds.length > 0 && (
              <button
                onClick={handleResetExclusion}
                className="text-[9px] text-slate-500 hover:text-indigo-400 transition-colors font-semibold"
                title="除外したファイターを再表示します"
              >
                <i className="fas fa-undo mr-0.5"></i> 元に戻す
              </button>
            )}
          </div>
          {frequentCharacters.length > 0 ? (
            <div className="flex gap-2.5">
              {frequentCharacters.map(char => {
                const isSelected = selectedCharacter?.characterNo === char.characterNo;
                return (
                  <div key={`freq-container-${char.characterNo}`} className="relative group">
                    <button
                      onClick={() => isSelected ? onSelectCharacter(null) : onSelectCharacter(char)}
                      className={`w-11 h-11 p-1 rounded-full border-2 bg-slate-900/60 char-quick-badge flex items-center justify-center transition-all duration-200 ${
                        isSelected 
                          ? (isYou ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] scale-105" : "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-105") 
                          : "border-white/10 hover:border-slate-400"
                      }`}
                      title={char.characterName}
                    >
                      <img src={char.imageUrl} alt={char.characterName} className="w-full h-full object-contain pointer-events-none" />
                    </button>
                    
                    {/* リストから除外するボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExcludeCharacter(char.characterNo);
                      }}
                      className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-950/90 text-[7px] text-slate-400 hover:text-red-400 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer"
                      title="このリストから除外する"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 italic py-1 pl-1">
              すべてのファイターが除外されています
            </div>
          )}
        </div>
      )}

      {/* --- 検索＆選択グリッド --- */}
      <div className={`flex flex-col gap-2 ${selectedCharacter ? 'hidden' : ''}`}>
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs"></i>
          <input
            type="text"
            placeholder="ファイター名で検索..."
            className="w-full pl-8 pr-8 py-1.5 text-xs glass-input rounded-lg border border-white/10 bg-slate-950/40 text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-200 text-xs"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
        </div>

        <div className="p-2 bg-slate-950/40 border border-white/5 rounded-xl overflow-y-auto hide-scrollbar h-[16vh] md:h-[22vh]">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 lg:grid-cols-7 gap-1">
            {filteredList.map(character => {
              const isSelected = selectedCharacter?.characterNo === character.characterNo;
              return (
                <div
                  key={character.characterNo}
                  className={`w-10 h-10 p-1.5 rounded-lg border bg-slate-900/30 flex items-center justify-center transition-all duration-200 cursor-pointer object-contain ${
                    isSelected 
                      ? activeBorderClass 
                      : `border-transparent ${hoverBorderColor} hover:bg-slate-800/40 hover:scale-110`
                  }`}
                  onClick={() => isSelected ? onSelectCharacter(null) : onSelectCharacter(character)}
                  title={character.characterName}
                >
                  <img
                    className="w-full h-full object-contain pointer-events-none"
                    src={character.imageUrl}
                    alt={character.characterName}
                  />
                </div>
              );
            })}
            {filteredList.length === 0 && (
              <div className="col-span-full text-center py-6 text-xs text-slate-500">
                該当するファイターがいません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
