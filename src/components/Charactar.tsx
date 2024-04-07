// import { useState } from 'react';

interface CharacterProps {
  player: string;
  onSelectChara: any;
  selectedChara: any;
}

const charactarList = [
  { id: 1, name: 'マリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/mario.png` },
  { id: 2, name: 'ドンキー', imageUrl: `${process.env.PUBLIC_URL}/fighter/donkey.png` },
  { id: 3, name: 'リンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/link.png` },
  { id: 4, name: 'サムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/samus.png` },
  { id: 5, name: 'ダークサムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/samusd.png` },
  { id: 6, name: 'ヨッシー', imageUrl: `${process.env.PUBLIC_URL}/fighter/yoshi.png` },
  { id: 7, name: 'カービィ', imageUrl: `${process.env.PUBLIC_URL}/fighter/kirby.png` },
  { id: 8, name: 'フォックス', imageUrl: `${process.env.PUBLIC_URL}/fighter/fox.png` },
  { id: 9, name: 'ピカチュウ', imageUrl: `${process.env.PUBLIC_URL}/fighter/pikachu.png` },
  { id: 10, name: 'ルイージ', imageUrl: `${process.env.PUBLIC_URL}/fighter/luigi.png` },
  { id: 11, name: 'ネス', imageUrl: `${process.env.PUBLIC_URL}/fighter/ness.png` },
  { id: 12, name: 'キャプテンファルコン', imageUrl: `${process.env.PUBLIC_URL}/fighter/captain.png` },
  { id: 13, name: 'プリン', imageUrl: `${process.env.PUBLIC_URL}/fighter/purin.png` },
  { id: 14, name: 'ピーチ', imageUrl: `${process.env.PUBLIC_URL}/fighter/peach.png` },
  { id: 15, name: 'デイジー', imageUrl: `${process.env.PUBLIC_URL}/fighter/daisy.png` },
  { id: 16, name: 'クッパ', imageUrl: `${process.env.PUBLIC_URL}/fighter/koopa.png` },
  { id: 17, name: 'アイスクライマー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ice_climber.png` },
  { id: 18, name: 'シーク', imageUrl: `${process.env.PUBLIC_URL}/fighter/sheik.png` },
  { id: 19, name: 'ゼルダ', imageUrl: `${process.env.PUBLIC_URL}/fighter/zelda.png` },
  { id: 20, name: 'ドクターマリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/mariod.png` },
  { id: 21, name: 'ピチュー', imageUrl: `${process.env.PUBLIC_URL}/fighter/pichu.png` },
  { id: 22, name: 'ファルコ', imageUrl: `${process.env.PUBLIC_URL}/fighter/falco.png` },
  { id: 23, name: 'マルス', imageUrl: `${process.env.PUBLIC_URL}/fighter/marth.png` },
  { id: 24, name: 'ルキナ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucina.png` },
  { id: 25, name: 'こどもリンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/younglink.png` },
  { id: 26, name: 'ガノン', imageUrl: `${process.env.PUBLIC_URL}/fighter/ganon.png` },
  { id: 27, name: 'ミュウツー', imageUrl: `${process.env.PUBLIC_URL}/fighter/mewtwo.png` },
  { id: 28, name: 'ロイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/roy.png` },
  { id: 29, name: 'クロム', imageUrl: `${process.env.PUBLIC_URL}/fighter/chrom.png` },
  { id: 30, name: 'ゲッチ', imageUrl: `${process.env.PUBLIC_URL}/fighter/gamewatch.png` },
  { id: 31, name: 'メタナイト', imageUrl: `${process.env.PUBLIC_URL}/fighter/metaknight.png` },
  { id: 32, name: 'ピット', imageUrl: `${process.env.PUBLIC_URL}/fighter/pit.png` },
  { id: 33, name: 'ブラックピット', imageUrl: `${process.env.PUBLIC_URL}/fighter/pitb.png` },
  { id: 34, name: 'ゼロスーツサムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/szerosuit.png` },
  { id: 35, name: 'ワリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/wario.png` },
  { id: 36, name: 'スネーク', imageUrl: `${process.env.PUBLIC_URL}/fighter/snake.png` },
  { id: 37, name: 'アイク', imageUrl: `${process.env.PUBLIC_URL}/fighter/ike.png` },
  { id: 38, name: 'ポケモントレーナー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ptrainer.png` },
  { id: 39, name: 'ディディー', imageUrl: `${process.env.PUBLIC_URL}/fighter/diddy.png` },
  { id: 40, name: 'リュカ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucas.png` },
  { id: 41, name: 'ソニック', imageUrl: `${process.env.PUBLIC_URL}/fighter/sonic.png` },
  { id: 42, name: 'デデデ', imageUrl: `${process.env.PUBLIC_URL}/fighter/dedede.png` },
  { id: 43, name: 'ピクミン＆オリマー', imageUrl: `${process.env.PUBLIC_URL}/fighter/pikmin.png` },
  { id: 44, name: 'ルカリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucario.png` },
  { id: 45, name: 'ロボット', imageUrl: `${process.env.PUBLIC_URL}/fighter/robot.png` },
  { id: 46, name: 'トゥーンリンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/toonlink.png` },
  { id: 47, name: 'ウルフ', imageUrl: `${process.env.PUBLIC_URL}/fighter/wolf.png` },
  { id: 48, name: 'むらびと', imageUrl: `${process.env.PUBLIC_URL}/fighter/murabito.png` },
  { id: 49, name: 'ロックマン', imageUrl: `${process.env.PUBLIC_URL}/fighter/rockman.png` },
  { id: 50, name: 'WiiFitトレーナー', imageUrl: `${process.env.PUBLIC_URL}/fighter/wiifit.png` },
  { id: 51, name: 'ロゼッタ＆チコ', imageUrl: `${process.env.PUBLIC_URL}/fighter/rosetta.png` },
  { id: 52, name: 'リトルマック', imageUrl: `${process.env.PUBLIC_URL}/fighter/littlemac.png` },
  { id: 53, name: 'ゲッコウガ', imageUrl: `${process.env.PUBLIC_URL}/fighter/gekkouga.png` },
  { id: 54, name: 'パルテナ', imageUrl: `${process.env.PUBLIC_URL}/fighter/palutena.png` },
  { id: 55, name: 'パックマン', imageUrl: `${process.env.PUBLIC_URL}/fighter/pacman.png` },
  { id: 56, name: 'シュルク', imageUrl: `${process.env.PUBLIC_URL}/fighter/shulk.png` },
  { id: 57, name: 'ルフレ', imageUrl: `${process.env.PUBLIC_URL}/fighter/reflet.png` },
  { id: 58, name: 'クッパJr', imageUrl: `${process.env.PUBLIC_URL}/fighter/koopajr.png` },
  { id: 59, name: 'ダックハント', imageUrl: `${process.env.PUBLIC_URL}/fighter/duckhunt.png` },
  { id: 60, name: 'リュウ', imageUrl: `${process.env.PUBLIC_URL}/fighter/ryu.png` },
  { id: 61, name: 'ケン', imageUrl: `${process.env.PUBLIC_URL}/fighter/ken.png` },
  { id: 62, name: 'クラウド', imageUrl: `${process.env.PUBLIC_URL}/fighter/cloud.png` },
  { id: 63, name: 'カムイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/kamui.png` },
  { id: 64, name: 'ベヨネッタ', imageUrl: `${process.env.PUBLIC_URL}/fighter/bayonetta.png` },
  { id: 65, name: 'インクリング', imageUrl: `${process.env.PUBLIC_URL}/fighter/inkling.png` },
  { id: 66, name: 'リドリー', imageUrl: `${process.env.PUBLIC_URL}/fighter/ridley.png` },
  { id: 67, name: 'シモン', imageUrl: `${process.env.PUBLIC_URL}/fighter/simon.png` },
  { id: 68, name: 'リヒター', imageUrl: `${process.env.PUBLIC_URL}/fighter/richter.png` },
  { id: 69, name: 'キングクルール', imageUrl: `${process.env.PUBLIC_URL}/fighter/krool.png` },
  { id: 70, name: 'しずえ', imageUrl: `${process.env.PUBLIC_URL}/fighter/shizue.png` },
  { id: 71, name: 'ガオガエン', imageUrl: `${process.env.PUBLIC_URL}/fighter/gaogaen.png` },
  { id: 72, name: 'パックンフラワー', imageUrl: `${process.env.PUBLIC_URL}/fighter/packun.png` },
  { id: 73, name: 'ジョーカー', imageUrl: `${process.env.PUBLIC_URL}/fighter/jack.png` },
  { id: 74, name: '勇者', imageUrl: `${process.env.PUBLIC_URL}/fighter/brave_01.png` },
  { id: 75, name: 'バンジョー＆カズーイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/buddy.png` },
  { id: 76, name: 'テリー', imageUrl: `${process.env.PUBLIC_URL}/fighter/dolly.png` },
  { id: 77, name: 'ベレト', imageUrl: `${process.env.PUBLIC_URL}/fighter/master.png` },
  { id: 78, name: 'ミェンミェン', imageUrl: `${process.env.PUBLIC_URL}/fighter/tantan.png` },
  { id: 79, name: 'スティーブ', imageUrl: `${process.env.PUBLIC_URL}/fighter/pickel.png` },
  { id: 80, name: 'セフィロス', imageUrl: `${process.env.PUBLIC_URL}/fighter/edge.png` },
  { id: 81, name: 'ホムラ/ヒカリ', imageUrl: `${process.env.PUBLIC_URL}/fighter/eflame.png` },
  { id: 82, name: 'カズヤ', imageUrl: `${process.env.PUBLIC_URL}/fighter/demon.png` },
  { id: 83, name: 'ソラ', imageUrl: `${process.env.PUBLIC_URL}/fighter/trail.png` },
  { id: 84, name: '格闘mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miifighter.png` },
  { id: 85, name: '剣術mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miiswordsman.png` },
  { id: 86, name: '射撃mii', imageUrl: `${process.env.PUBLIC_URL}/fighter/miigunner.png` },
]

export const Charactar: React.FC<CharacterProps> = ({player, onSelectChara, selectedChara}) => {

  return (
    <>
      <div className="h-20">
        <h1>{player}の使用ファイター：</h1>
        {selectedChara ?
          <>
            <div className="flex">
              <img 
                className= "cursor-pointer"
                src={selectedChara.imageUrl} 
                alt={selectedChara.name} 
              />
              <h1>{`${selectedChara.name}`}</h1>
            </div>                      
          </>
          :
          <span>キャラクターを選んでね。</span>
        }    
      </div>    
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 overflow-y-auto hide-scrollbar h-20vh md:h-35vh">
        <div className="flex flex-wrap">
        {charactarList.map(character => (
          <img 
            className= {`${selectedChara?.id === character?.id ? "bg-red-500" : ""} cursor-pointer`}
            onClick={() => selectedChara?.id === character?.id ? onSelectChara(null) : onSelectChara(character)} 
            src={character.imageUrl} 
            alt={character.name} 
          />
        ))}          
        </div>
      </div>
    </>
  )
}