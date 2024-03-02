// import { useState } from 'react';

interface CharacterProps {
  player: string;
  onSelect: any;
  selectChara: any;
}

const charactarList = [
  { id: 1, name: 'マリオ', imageUrl: `${process.env.PUBLIC_URL}/fighter/mario.png` },
  { id: 2, name: 'ドンキー', imageUrl: `${process.env.PUBLIC_URL}/fighter/donkey.png` },
  { id: 3, name: 'サムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/samus.png` },
  { id: 4, name: 'ダムス', imageUrl: `${process.env.PUBLIC_URL}/fighter/samusd.png` },
  { id: 5, name: 'ヨッシー', imageUrl: `${process.env.PUBLIC_URL}/fighter/yoshi.png` },
  { id: 6, name: 'カービィ', imageUrl: `${process.env.PUBLIC_URL}/fighter/kirby.png` },
  { id: 7, name: 'フォックス', imageUrl: `${process.env.PUBLIC_URL}/fighter/fox.png` },
  { id: 8, name: 'ピカチュウ', imageUrl: `${process.env.PUBLIC_URL}/fighter/pikachu.png` },
  { id: 9, name: 'ルイージ', imageUrl: `${process.env.PUBLIC_URL}/fighter/luigi.png` },
  { id: 10, name: 'ネス', imageUrl: `${process.env.PUBLIC_URL}/fighter/ness.png` },
  { id: 11, name: 'キャプテンファルコン', imageUrl: `${process.env.PUBLIC_URL}/fighter/captain.png` },
  { id: 12, name: 'プリン', imageUrl: `${process.env.PUBLIC_URL}/fighter/purin.png` },
  { id: 13, name: 'ピーチ', imageUrl: `${process.env.PUBLIC_URL}/fighter/peach.png` },
  { id: 14, name: 'デイジー', imageUrl: `${process.env.PUBLIC_URL}/fighter/daisy.png` },
  { id: 15, name: 'クッパ', imageUrl: `${process.env.PUBLIC_URL}/fighter/koopa.png` },
  { id: 16, name: 'アイクラ', imageUrl: `${process.env.PUBLIC_URL}/fighter/ice_climber.png` },
  { id: 17, name: 'シーク', imageUrl: `${process.env.PUBLIC_URL}/fighter/sheik.png` },
  { id: 18, name: 'ゼルダ', imageUrl: `${process.env.PUBLIC_URL}/fighter/zelda.png` },
  { id: 19, name: 'ドクマリ', imageUrl: `${process.env.PUBLIC_URL}/fighter/mariod.png` },
  { id: 20, name: 'ファルコ', imageUrl: `${process.env.PUBLIC_URL}/fighter/falco.png` },
  { id: 21, name: 'マルス', imageUrl: `${process.env.PUBLIC_URL}/fighter/marth.png` },
  { id: 22, name: 'ルキナ', imageUrl: `${process.env.PUBLIC_URL}/fighter/lucina.png` },
  { id: 23, name: 'こどもリンク', imageUrl: `${process.env.PUBLIC_URL}/fighter/younglink.png` },
  { id: 24, name: 'ガノン', imageUrl: `${process.env.PUBLIC_URL}/fighter/ganon.png` },
  { id: 25, name: 'ミュウツー', imageUrl: `${process.env.PUBLIC_URL}/fighter/mewtwo.png` },
  { id: 26, name: 'ロイ', imageUrl: `${process.env.PUBLIC_URL}/fighter/roy.png` },
  { id: 27, name: 'クロム', imageUrl: `${process.env.PUBLIC_URL}/fighter/chrom.png` },
  { id: 28, name: 'ゲッチ', imageUrl: `${process.env.PUBLIC_URL}/fighter/gamewatch.png` },
]

export const Charactar: React.FC<CharacterProps> = ({player, onSelect, selectChara}) => {
  
  return (
    <>
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      {selectChara ?
        <span>{`${player}が使用したキャラは${selectChara}です`}</span>
        :
        <span>キャラクターを選んでね</span>
      }        
        <div className="flex flex-wrap">
        {charactarList.map(character => (
          <img 
            onClick={() => onSelect(character.name)} 
            src={character.imageUrl} 
            alt={character.name} 
          />
        ))}          
        </div>
      </div>
    </>
  )
}