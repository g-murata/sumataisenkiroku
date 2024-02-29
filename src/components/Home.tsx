// import { useState } from 'react';
// import { Header } from '../components/Header';
import { Charactar } from './Charactar';
import {Result} from './Result'
import { Footer } from '../components/Footer';


export const Home = () => {
  return (
    <>
      {/* <Header /> */}
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="py-5"> 
          <div className="flex">
            <div>  
              <label>使用キャラ</label>
              <Charactar />
            </div>

            <div>
              <label>相手キャラ</label>
              <Charactar />
            </div>
          </div>
        </div>

        <div className="py-5"> 
          <div className="flex">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold mx-5 py-4 px-8 rounded"
              onClick={() => alert("勝ちィ！")}
            >
              勝ち
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold mx-5 py-4 px-8 rounded"
              onClick={() => alert("負けぇ～")}
            >
              負け
            </button>
          </div>
        </div>

        <div className="py-5"> 
          <Result />
        </div>

        <div className="py-5"> 
          <Footer />
        </div>
      </div>
    </>
  )
}