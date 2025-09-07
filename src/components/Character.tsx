// import { useState } from 'react';

interface CharacterProps {
  player: string;
  onSelectCharacter: any;
  selectedCharacter: any;
}

const characterList = [
  { fighterNo: 1, fighterName: 'マリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/mario.png` },
  { fighterNo: 2, fighterName: 'ドンキー', imageUrl: `${process.env.PUBLIC_URL}/fighter/donkey.png` },
  { fighterNo: 3, fighterName: 'リンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/link.png` },
  { fighterNo: 4, fighterName: 'サムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/samus.png` },
  { fighterNo: 5, fighterName: 'ダークサムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/samusd.png` },
  { fighterNo: 6, fighterName: 'ヨッシー', imageUrl: `${process.env.PUBLIC_URL}/fighter/yoshi.png` },
  { fighterNo: 7, fighterName: 'カービィ', imageUrl: `${process.env.PUBLIC_URL}/fighter/kirby.png` },
  { fighterNo: 8, fighterName: 'フォックス', imageUrl: `${process.env.PUBLIC_URL}/fighter/fox.png` },
  { fighterNo: 9, fighterName: 'ピカチュウ', imageUrl: `${process.env.PUBLIC_URL}/fighter/pikachu.png` },
  { fighterNo: 10, fighterName: 'ルイージ', imageUrl: `${process.env.PUBLIC_URL}/fighter/luigi.png` },
  { fighterNo: 11, fighterName: 'ネス', imageUrl: `${process.env.PUBLIC_URL}/fighter/ness.png` },
  { fighterNo: 12, fighterName: 'キャプテンファルコン', imageUrl: `${process.env.PUBLIC_URL}/fighter/captain.png` },
  { fighterNo: 13, fighterName: 'プリン', imageUrl: `${process.env.PUBLIC_URL}/fighter/purin.png` },
  { fighterNo: 14, fighterName: 'ピーチ', imageUrl: `${process.env.PUBLIC_URL}/fighter/peach.png` },
  { fighterNo: 15, fighterName: 'デイジー', imageUrl: `${process.env.PUBLIC_URL}/fighter/daisy.png` },
  { fighterNo: 16, fighterName: 'クッパ', imageUrl: `${process.env.PUBLIC_URL}/fighter/koopa.png` },
  { fighterNo: 17, fighterName: 'アイスクライマー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ice_climber.png` },
  { fighterNo: 18, fighterName: 'シーク', imageUrl: `${process.env.PUBLIC_URL}/fighter/sheik.png` },
  { fighterNo: 19, fighterName: 'ゼルダ', imageUrl: `${process.env.PUBLIC_URL}/fighter/zelda.png` },
  { fighterNo: 20, fighterName: 'ドクターマリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/mariod.png` },
  { fighterNo: 21, fighterName: 'ピチュー', imageUrl: `${process.env.PUBLIC_URL}/fighter/pichu.png` },
  { fighterNo: 22, fighterName: 'ファルコ', imageUrl: `${process.env.PUBLIC_URL}/fighter/falco.png` },
  { fighterNo: 23, fighterName: 'マルス', imageUrl: `${process.env.PUBLIC_URL}/fighter/marth.png` },
  { fighterNo: 24, fighterName: 'ルキナ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucina.png` },
  { fighterNo: 25, fighterName: 'こどもリンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/younglink.png` },
  { fighterNo: 26, fighterName: 'ガノン', imageUrl: `${process.env.PUBLIC_URL}/fighter/ganon.png` },
  { fighterNo: 27, fighterName: 'ミュウツー', imageUrl: `${process.env.PUBLIC_URL}/fighter/mewtwo.png` },
  { fighterNo: 28, fighterName: 'ロイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/roy.png` },
  { fighterNo: 29, fighterName: 'クロム', imageUrl: `${process.env.PUBLIC_URL}/fighter/chrom.png` },
  { fighterNo: 30, fighterName: 'ゲッチ', imageUrl: `${process.env.PUBLIC_URL}/fighter/gamewatch.png` },
  { fighterNo: 31, fighterName: 'メタナイト', imageUrl: `${process.env.PUBLIC_URL}/fighter/metaknight.png` },
  { fighterNo: 32, fighterName: 'ピット', imageUrl: `${process.env.PUBLIC_URL}/fighter/pit.png` },
  { fighterNo: 33, fighterName: 'ブラックピット', imageUrl: `${process.env.PUBLIC_URL}/fighter/pitb.png` },
  { fighterNo: 34, fighterName: 'ゼロスーツサムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/szerosuit.png` },
  { fighterNo: 35, fighterName: 'ワリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/wario.png` },
  { fighterNo: 36, fighterName: 'スネーク', imageUrl: `${process.env.PUBLIC_URL}/fighter/snake.png` },
  { fighterNo: 37, fighterName: 'アイク', imageUrl: `${process.env.PUBLIC_URL}/fighter/ike.png` },
  { fighterNo: 38, fighterName: 'ポケモントレーナー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ptrainer.png` },
  { fighterNo: 39, fighterName: 'ディディー', imageUrl: `${process.env.PUBLIC_URL}/fighter/diddy.png` },
  { fighterNo: 40, fighterName: 'リュカ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucas.png` },
  { fighterNo: 41, fighterName: 'ソニック', imageUrl: `${process.env.PUBLIC_URL}/fighter/sonic.png` },
  { fighterNo: 42, fighterName: 'デデデ', imageUrl: `${process.env.PUBLIC_URL}/fighter/dedede.png` },
  { fighterNo: 43, fighterName: 'ピクミン＆オリマー', imageUrl: `${process.env.PUBLIC_URL}/fighter/pikmin.png` },
  { fighterNo: 44, fighterName: 'ルカリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucario.png` },
  { fighterNo: 45, fighterName: 'ロボット', imageUrl: `${process.env.PUBLIC_URL}/fighter/robot.png` },
  { fighterNo: 46, fighterName: 'トゥーンリンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/toonlink.png` },
  { fighterNo: 47, fighterName: 'ウルフ', imageUrl: `${process.env.PUBLIC_URL}/fighter/wolf.png` },
  { fighterNo: 48, fighterName: 'むらびと', imageUrl: `${process.env.PUBLIC_URL}/fighter/murabito.png` },
  { fighterNo: 49, fighterName: 'ロックマン', imageUrl: `${process.env.PUBLIC_URL}/fighter/rockman.png` },
  { fighterNo: 50, fighterName: 'WiiFitトレーナー', imageUrl: `${process.env.PUBLIC_URL}/fighter/wiifit.png` },
  { fighterNo: 51, fighterName: 'ロゼッタ＆チコ', imageUrl: `${process.env.PUBLIC_URL}/fighter/rosetta.png` },
  { fighterNo: 52, fighterName: 'リトルマック', imageUrl: `${process.env.PUBLIC_URL}/fighter/littlemac.png` },
  { fighterNo: 53, fighterName: 'ゲッコウガ', imageUrl: `${process.env.PUBLIC_URL}/fighter/gekkouga.png` },
  { fighterNo: 54, fighterName: 'パルテナ', imageUrl: `${process.env.PUBLIC_URL}/fighter/palutena.png` },
  { fighterNo: 55, fighterName: 'パックマン', imageUrl: `${process.env.PUBLIC_URL}/fighter/pacman.png` },
  { fighterNo: 56, fighterName: 'シュルク', imageUrl: `${process.env.PUBLIC_URL}/fighter/shulk.png` },
  { fighterNo: 57, fighterName: 'ルフレ', imageUrl: `${process.env.PUBLIC_URL}/fighter/reflet.png` },
  { fighterNo: 58, fighterName: 'クッパJr', imageUrl: `${process.env.PUBLIC_URL}/fighter/koopajr.png` },
  { fighterNo: 59, fighterName: 'ダックハント', imageUrl: `${process.env.PUBLIC_URL}/fighter/duckhunt.png` },
  { fighterNo: 60, fighterName: 'リュウ', imageUrl: `${process.env.PUBLIC_URL}/fighter/ryu.png` },
  { fighterNo: 61, fighterName: 'ケン', imageUrl: `${process.env.PUBLIC_URL}/fighter/ken.png` },
  { fighterNo: 62, fighterName: 'クラウド', imageUrl: `${process.env.PUBLIC_URL}/fighter/cloud.png` },
  { fighterNo: 63, fighterName: 'カムイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/kamui.png` },
  { fighterNo: 64, fighterName: 'ベヨネッタ', imageUrl: `${process.env.PUBLIC_URL}/fighter/bayonetta.png` },
  { fighterNo: 65, fighterName: 'インクリング', imageUrl: `${process.env.PUBLIC_URL}/fighter/inkling.png` },
  { fighterNo: 66, fighterName: 'リドリー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ridley.png` },
  { fighterNo: 67, fighterName: 'シモン', imageUrl: `${process.env.PUBLIC_URL}/fighter/simon.png` },
  { fighterNo: 68, fighterName: 'リヒター', imageUrl: `${process.env.PUBLIC_URL}/fighter/richter.png` },
  { fighterNo: 69, fighterName: 'キングクルール', imageUrl: `${process.env.PUBLIC_URL}/fighter/krool.png` },
  { fighterNo: 70, fighterName: 'しずえ', imageUrl: `${process.env.PUBLIC_URL}/fighter/shizue.png` },
  { fighterNo: 71, fighterName: 'ガオガエン', imageUrl: `${process.env.PUBLIC_URL}/fighter/gaogaen.png` },
  { fighterNo: 72, fighterName: 'パックンフラワー', imageUrl: `${process.env.PUBLIC_URL}/fighter/packun.png` },
  { fighterNo: 73, fighterName: 'ジョーカー', imageUrl: `${process.env.PUBLIC_URL}/fighter/jack.png` },
  { fighterNo: 74, fighterName: '勇者', imageUrl: `${process.env.PUBLIC_URL}/fighter/brave_01.png` },
  { fighterNo: 75, fighterName: 'バンジョー＆カズーイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/buddy.png` },
  { fighterNo: 76, fighterName: 'テリー', imageUrl: `${process.env.PUBLIC_URL}/fighter/dolly.png` },
  { fighterNo: 77, fighterName: 'ベレト', imageUrl: `${process.env.PUBLIC_URL}/fighter/master.png` },
  { fighterNo: 78, fighterName: 'ミェンミェン', imageUrl: `${process.env.PUBLIC_URL}/fighter/tantan.png` },
  { fighterNo: 79, fighterName: 'スティーブ', imageUrl: `${process.env.PUBLIC_URL}/fighter/pickel.png` },
  { fighterNo: 80, fighterName: 'セフィロス', imageUrl: `${process.env.PUBLIC_URL}/fighter/edge.png` },
  { fighterNo: 81, fighterName: 'ホムラ/ヒカリ', imageUrl: `${process.env.PUBLIC_URL}/fighter/eflame.png` },
  { fighterNo: 82, fighterName: 'カズヤ', imageUrl: `${process.env.PUBLIC_URL}/fighter/demon.png` },
  { fighterNo: 83, fighterName: 'ソラ', imageUrl: `${process.env.PUBLIC_URL}/fighter/trail.png` },
  { fighterNo: 84, fighterName: '格闘mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miifighter.png` },
  { fighterNo: 85, fighterName: '剣術mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miiswordsman.png` },
  { fighterNo: 86, fighterName: '射撃mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miigunner.png` },
]

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
                  alt={selectedCharacter.fighterName}
                />
                <h1>{`${selectedCharacter.fighterName}`}</h1>
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
                className={`${selectedCharacter?.fighterNo === character?.fighterNo ? "bg-red-500" : ""} cursor-pointer`}
                onClick={() => selectedCharacter?.fighterNo === character?.fighterNo ? onSelectCharacter(null) : onSelectCharacter(character)}
                src={character.imageUrl}
                alt={character.fighterName}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
