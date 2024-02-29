import { useState } from 'react';

export const Charactar = () => {
  return (
    <>
      <div className="flex gap-4 justify-end">
        <div>
          <img src={`${process.env.PUBLIC_URL}/fighter/mario.png`} className="h-1/3 w-1/3" alt="mario" />
          <img src={`${process.env.PUBLIC_URL}/fighter/donkey.png`} className="h-1/3 w-1/3" alt="donkey" />
          <img src={`${process.env.PUBLIC_URL}/fighter/samus.png`} className="h-1/3 w-1/3" alt="samus" />
          <img src={`${process.env.PUBLIC_URL}/fighter/samusd.png`} className="h-1/3 w-1/3" alt="samusd" />
        </div>
      </div>
    </>
  )
}