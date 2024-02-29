// import { useState } from 'react';

export const Charactar = () => {
  return (
    <>
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="flex">
          <img src={`${process.env.PUBLIC_URL}/fighter/mario.png`} alt="mario" />
          <img src={`${process.env.PUBLIC_URL}/fighter/donkey.png`}  alt="donkey" />
          <img src={`${process.env.PUBLIC_URL}/fighter/samus.png`}  alt="samus" />
          <img src={`${process.env.PUBLIC_URL}/fighter/samusd.png`}  alt="samusd" />
          <img src={`${process.env.PUBLIC_URL}/fighter/yoshi.png`}  alt="yoshi" />
          <img src={`${process.env.PUBLIC_URL}/fighter/kirby.png`}  alt="kirby" />
          <img src={`${process.env.PUBLIC_URL}/fighter/fox.png`}  alt="fox" />
          <img src={`${process.env.PUBLIC_URL}/fighter/pikachu.png`}  alt="pikachu" />
          <img src={`${process.env.PUBLIC_URL}/fighter/luigi.png`}  alt="luigi" />
          <img src={`${process.env.PUBLIC_URL}/fighter/ness.png`}  alt="ness" />
          <img src={`${process.env.PUBLIC_URL}/fighter/captain.png`}  alt="captain" />
          <img src={`${process.env.PUBLIC_URL}/fighter/purin.png`}  alt="purin" />
        </div>
      </div>
    </>
  )
}