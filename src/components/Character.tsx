// import { useState } from 'react';

import { CharacterType } from "./Home";

const characterList: CharacterType[] = [
  { characterNo: 1, characterName: 'マリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/mario.png` },
  { characterNo: 2, characterName: 'ドンキー', imageUrl: `${process.env.PUBLIC_URL}/fighter/donkey.png` },
  { characterNo: 3, characterName: 'リンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/link.png` },
  { characterNo: 4, characterName: 'サムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/samus.png` },
  { characterNo: 5, characterName: 'ダークサムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/samusd.png` },
  { characterNo: 6, characterName: 'ヨッシー', imageUrl: `${process.env.PUBLIC_URL}/fighter/yoshi.png` },
  { characterNo: 7, characterName: 'カービィ', imageUrl: `${process.env.PUBLIC_URL}/fighter/kirby.png` },
  { characterNo: 8, characterName: 'フォックス', imageUrl: `${process.env.PUBLIC_URL}/fighter/fox.png` },
  { characterNo: 9, characterName: 'ピカチュウ', imageUrl: `${process.env.PUBLIC_URL}/fighter/pikachu.png` },
  { characterNo: 10, characterName: 'ルイージ', imageUrl: `${process.env.PUBLIC_URL}/fighter/luigi.png` },
  { characterNo: 11, characterName: 'ネス', imageUrl: `${process.env.PUBLIC_URL}/fighter/ness.png` },
  { characterNo: 12, characterName: 'キャプテンファルコン', imageUrl: `${process.env.PUBLIC_URL}/fighter/captain.png` },
  { characterNo: 13, characterName: 'プリン', imageUrl: `${process.env.PUBLIC_URL}/fighter/purin.png` },
  { characterNo: 14, characterName: 'ピーチ', imageUrl: `${process.env.PUBLIC_URL}/fighter/peach.png` },
  { characterNo: 15, characterName: 'デイジー', imageUrl: `${process.env.PUBLIC_URL}/fighter/daisy.png` },
  { characterNo: 16, characterName: 'クッパ', imageUrl: `${process.env.PUBLIC_URL}/fighter/koopa.png` },
  { characterNo: 17, characterName: 'アイスクライマー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ice_climber.png` },
  { characterNo: 18, characterName: 'シーク', imageUrl: `${process.env.PUBLIC_URL}/fighter/sheik.png` },
  { characterNo: 19, characterName: 'ゼルダ', imageUrl: `${process.env.PUBLIC_URL}/fighter/zelda.png` },
  { characterNo: 20, characterName: 'ドクターマリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/mariod.png` },
  { characterNo: 21, characterName: 'ピチュー', imageUrl: `${process.env.PUBLIC_URL}/fighter/pichu.png` },
  { characterNo: 22, characterName: 'ファルコ', imageUrl: `${process.env.PUBLIC_URL}/fighter/falco.png` },
  { characterNo: 23, characterName: 'マルス', imageUrl: `${process.env.PUBLIC_URL}/fighter/marth.png` },
  { characterNo: 24, characterName: 'ルキナ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucina.png` },
  { characterNo: 25, characterName: 'こどもリンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/younglink.png` },
  { characterNo: 26, characterName: 'ガノン', imageUrl: `${process.env.PUBLIC_URL}/fighter/ganon.png` },
  { characterNo: 27, characterName: 'ミュウツー', imageUrl: `${process.env.PUBLIC_URL}/fighter/mewtwo.png` },
  { characterNo: 28, characterName: 'ロイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/roy.png` },
  { characterNo: 29, characterName: 'クロム', imageUrl: `${process.env.PUBLIC_URL}/fighter/chrom.png` },
  { characterNo: 30, characterName: 'ゲッチ', imageUrl: `${process.env.PUBLIC_URL}/fighter/gamewatch.png` },
  { characterNo: 31, characterName: 'メタナイト', imageUrl: `${process.env.PUBLIC_URL}/fighter/metaknight.png` },
  { characterNo: 32, characterName: 'ピット', imageUrl: `${process.env.PUBLIC_URL}/fighter/pit.png` },
  { characterNo: 33, characterName: 'ブラックピット', imageUrl: `${process.env.PUBLIC_URL}/fighter/pitb.png` },
  { characterNo: 34, characterName: 'ゼロスーツサムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/szerosuit.png` },
  { characterNo: 35, characterName: 'ワリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/wario.png` },
  { characterNo: 36, characterName: 'スネーク', imageUrl: `${process.env.PUBLIC_URL}/fighter/snake.png` },
  { characterNo: 37, characterName: 'アイク', imageUrl: `${process.env.PUBLIC_URL}/fighter/ike.png` },
  { characterNo: 38, characterName: 'ポケモントレーナー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ptrainer.png` },
  { characterNo: 39, characterName: 'ディディー', imageUrl: `${process.env.PUBLIC_URL}/fighter/diddy.png` },
  { characterNo: 40, characterName: 'リュカ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucas.png` },
  { characterNo: 41, characterName: 'ソニック', imageUrl: `${process.env.PUBLIC_URL}/fighter/sonic.png` },
  { characterNo: 42, characterName: 'デデデ', imageUrl: `${process.env.PUBLIC_URL}/fighter/dedede.png` },
  { characterNo: 43, characterName: 'ピクミン＆オリマー', imageUrl: `${process.env.PUBLIC_URL}/fighter/pikmin.png` },
  { characterNo: 44, characterName: 'ルカリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucario.png` },
  { characterNo: 45, characterName: 'ロボット', imageUrl: `${process.env.PUBLIC_URL}/fighter/robot.png` },
  { characterNo: 46, characterName: 'トゥーンリンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/toonlink.png` },
  { characterNo: 47, characterName: 'ウルフ', imageUrl: `${process.env.PUBLIC_URL}/fighter/wolf.png` },
  { characterNo: 48, characterName: 'むらびと', imageUrl: `${process.env.PUBLIC_URL}/fighter/murabito.png` },
  { characterNo: 49, characterName: 'ロックマン', imageUrl: `${process.env.PUBLIC_URL}/fighter/rockman.png` },
  { characterNo: 50, characterName: 'WiiFitトレーナー', imageUrl: `${process.env.PUBLIC_URL}/fighter/wiifit.png` },
  { characterNo: 51, characterName: 'ロゼッタ＆チコ', imageUrl: `${process.env.PUBLIC_URL}/fighter/rosetta.png` },
  { characterNo: 52, characterName: 'リトルマック', imageUrl: `${process.env.PUBLIC_URL}/fighter/littlemac.png` },
  { characterNo: 53, characterName: 'ゲッコウガ', imageUrl: `${process.env.PUBLIC_URL}/fighter/gekkouga.png` },
  { characterNo: 54, characterName: 'パルテナ', imageUrl: `${process.env.PUBLIC_URL}/fighter/palutena.png` },
  { characterNo: 55, characterName: 'パックマン', imageUrl: `${process.env.PUBLIC_URL}/fighter/pacman.png` },
  { characterNo: 56, characterName: 'シュルク', imageUrl: `${process.env.PUBLIC_URL}/fighter/shulk.png` },
  { characterNo: 57, characterName: 'ルフレ', imageUrl: `${process.env.PUBLIC_URL}/fighter/reflet.png` },
  { characterNo: 58, characterName: 'クッパJr', imageUrl: `${process.env.PUBLIC_URL}/fighter/koopajr.png` },
  { characterNo: 59, characterName: 'ダックハント', imageUrl: `${process.env.PUBLIC_URL}/fighter/duckhunt.png` },
  { characterNo: 60, characterName: 'リュウ', imageUrl: `${process.env.PUBLIC_URL}/fighter/ryu.png` },
  { characterNo: 61, characterName: 'ケン', imageUrl: `${process.env.PUBLIC_URL}/fighter/ken.png` },
  { characterNo: 62, characterName: 'クラウド', imageUrl: `${process.env.PUBLIC_URL}/fighter/cloud.png` },
  { characterNo: 63, characterName: 'カムイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/kamui.png` },
  { characterNo: 64, characterName: 'ベヨネッタ', imageUrl: `${process.env.PUBLIC_URL}/fighter/bayonetta.png` },
  { characterNo: 65, characterName: 'インクリング', imageUrl: `${process.env.PUBLIC_URL}/fighter/inkling.png` },
  { characterNo: 66, characterName: 'リドリー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ridley.png` },
  { characterNo: 67, characterName: 'シモン', imageUrl: `${process.env.PUBLIC_URL}/fighter/simon.png` },
  { characterNo: 68, characterName: 'リヒター', imageUrl: `${process.env.PUBLIC_URL}/fighter/richter.png` },
  { characterNo: 69, characterName: 'キングクルール', imageUrl: `${process.env.PUBLIC_URL}/fighter/krool.png` },
  { characterNo: 70, characterName: 'しずえ', imageUrl: `${process.env.PUBLIC_URL}/fighter/shizue.png` },
  { characterNo: 71, characterName: 'ガオガエン', imageUrl: `${process.env.PUBLIC_URL}/fighter/gaogaen.png` },
  { characterNo: 72, characterName: 'パックンフラワー', imageUrl: `${process.env.PUBLIC_URL}/fighter/packun.png` },
  { characterNo: 73, characterName: 'ジョーカー', imageUrl: `${process.env.PUBLIC_URL}/fighter/jack.png` },
  { characterNo: 74, characterName: '勇者', imageUrl: `${process.env.PUBLIC_URL}/fighter/brave_01.png` },
  { characterNo: 75, characterName: 'バンジョー＆カズーイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/buddy.png` },
  { characterNo: 76, characterName: 'テリー', imageUrl: `${process.env.PUBLIC_URL}/fighter/dolly.png` },
  { characterNo: 77, characterName: 'ベレト', imageUrl: `${process.env.PUBLIC_URL}/fighter/master.png` },
  { characterNo: 78, characterName: 'ミェンミェン', imageUrl: `${process.env.PUBLIC_URL}/fighter/tantan.png` },
  { characterNo: 79, characterName: 'スティーブ', imageUrl: `${process.env.PUBLIC_URL}/fighter/pickel.png` },
  { characterNo: 80, characterName: 'セフィロス', imageUrl: `${process.env.PUBLIC_URL}/fighter/edge.png` },
  { characterNo: 81, characterName: 'ホムラ/ヒカリ', imageUrl: `${process.env.PUBLIC_URL}/fighter/eflame.png` },
  { characterNo: 82, characterName: 'カズヤ', imageUrl: `${process.env.PUBLIC_URL}/fighter/demon.png` },
  { characterNo: 83, characterName: 'ソラ', imageUrl: `${process.env.PUBLIC_URL}/fighter/trail.png` },
  { characterNo: 84, characterName: '格闘mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miifighter.png` },
  { characterNo: 85, characterName: '剣術mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miiswordsman.png` },
  { characterNo: 86, characterName: '射撃mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miigunner.png` },
]

interface CharacterProps {
  player: string;
  onSelectCharacter: (character: CharacterType | null) => void;
  selectedCharacter: CharacterType | null;
}

export const Character: React.FC<CharacterProps> = ({ player, onSelectCharacter, selectedCharacter }) => {
  return (
    <>
      <div className="w-80 md:w-full">
        <div className="h-20">
          <h1>{player}の使用ファイター：</h1>
          {selectedCharacter ?
            <>
              <div className="flex">
                <img
                  className="cursor-pointer"
                  src={selectedCharacter.imageUrl}
                  alt={selectedCharacter.characterName}
                />
                <h1>{`${selectedCharacter.characterName}`}</h1>
              </div>
            </>
            :
            <span>キャラクターを選んでね。</span>
          }
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow overflow-y-auto hide-scrollbar h-20vh md:h-25vh">
          <div className="flex flex-wrap">
            {characterList.map(character => (
              <img
                className={`${selectedCharacter?.characterNo === character?.characterNo ? "bg-red-500" : ""} cursor-pointer`}
                onClick={() => selectedCharacter?.characterNo === character?.characterNo ? onSelectCharacter(null) : onSelectCharacter(character)}
                src={character.imageUrl}
                alt={character.characterName}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
