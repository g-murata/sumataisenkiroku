// import { useState } from 'react';

export const Result = () => {
  return (
    <>
      <div className="max-h-32 w-96	bg-white border border-neutral-400 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 
        overflow-y-auto flex flex-col justify-center items-center h-screen"
      >
        <div className="">
          <div className="flex px-20 py-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src={`${process.env.PUBLIC_URL}/fighter/mario.png`} alt="mario" />
            <label>VS</label>
            <img src={`${process.env.PUBLIC_URL}/fighter/donkey.png`}  alt="donkey" />
            <label >勝ち</label>
          </div>
          <div className="flex p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src={`${process.env.PUBLIC_URL}/fighter/mario.png`} alt="mario" />
            <label>VS</label>
            <img src={`${process.env.PUBLIC_URL}/fighter/captain.png`}  alt="captain" />
            <label>負け</label>
          </div>
          <div className="flex p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src={`${process.env.PUBLIC_URL}/fighter/kirby.png`}  alt="kirby" />
            <label>VS</label>
            <img src={`${process.env.PUBLIC_URL}/fighter/ness.png`}  alt="ness" />
            <label>勝ち</label>
          </div>
          <div className="flex p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img src={`${process.env.PUBLIC_URL}/fighter/kirby.png`}  alt="kirby" />
            <label>VS</label>
            <img src={`${process.env.PUBLIC_URL}/fighter/ness.png`}  alt="ness" />
            <label>勝ち</label>
          </div>
        </div>
      </div>
    </>
  )
}