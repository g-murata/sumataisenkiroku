// import { useState } from 'react';

export const Result = () => {
  return (
    <>
      <div className="">
        <h1>今日の戦績 3勝1敗</h1>
        <div className="bg-white border border-neutral-800 max-h-32 w-80 overflow-y-auto"
        >
          <div className="bg-white border border-neutral-400 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ">
            <div className="flex p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <img src={`${process.env.PUBLIC_URL}/fighter/mario.png`} alt="mario" />
              <label>VS</label>
              <img src={`${process.env.PUBLIC_URL}/fighter/donkey.png`}  alt="donkey" />
              <label >勝ち</label>
            </div>
            <div className="flex p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <img src={`${process.env.PUBLIC_URL}/fighter/mario.png`} alt="mario" />
              <label>VS</label>
              <img src={`${process.env.PUBLIC_URL}/fighter/captain.png`}  alt="captain" />
              <label>負け</label>
            </div>
            <div className="flex p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <img src={`${process.env.PUBLIC_URL}/fighter/kirby.png`}  alt="kirby" />
              <label>VS</label>
              <img src={`${process.env.PUBLIC_URL}/fighter/ness.png`}  alt="ness" />
              <label>勝ち</label>
            </div>
            <div className="flex p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <img src={`${process.env.PUBLIC_URL}/fighter/samusd.png`}  alt="samusd" />
              <label>VS</label>
              <img src={`${process.env.PUBLIC_URL}/fighter/purin.png`}  alt="purin" />
              <label>勝ち</label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}