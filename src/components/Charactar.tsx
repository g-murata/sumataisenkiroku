// import { useState } from 'react';

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
  // { id: 13, name: 'ドンキー', imageUrl: `${process.env.PUBLIC_URL}/fighter/donkey.png` },
  // { id: 14, name: 'ドンキー', imageUrl: `${process.env.PUBLIC_URL}/fighter/donkey.png` },
  // { id: 15, name: 'ドンキー', imageUrl: `${process.env.PUBLIC_URL}/fighter/donkey.png` },
]

export const Charactar = () => {
  return (
    <>
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="flex">
        {charactarList.map(character => (
          <img src={character.imageUrl} alt={character.name} />
        ))}          
        </div>
      </div>
    </>
  )
}