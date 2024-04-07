// import { useState } from 'react';

interface MyComponentProps {
  deleteMode: boolean;
  setdeleteMode: any;
}

export const Footer: React.FC<MyComponentProps> = ({ deleteMode, setdeleteMode }) => {
  return (
    <>
      <div className="flex flex-col">
        <a href="https://www.youtube.com/@yarushikanai23" rel="noopener noreferrer" target="_blank" className="text-red-600 hover:text-red-800">
          <i className="fab fa-youtube"></i> やるしかない！！
        </a>
        <p className="text-gray-500">hon tool ha "maningen" ga sakusei shitayo.</p>
        <p className="text-gray-500">© 2024 yarushikanai!! all rights untara kantara</p>
        <button className={`${deleteMode === true ? 'text-red-500' : 'text-blue-500'}`} onClick={() => setdeleteMode(!deleteMode)}>          
          {deleteMode === true ? '対戦結果削除モード ON': '対戦結果削除モード OFF'}
        </button>
      </div>
    </>
  )
}