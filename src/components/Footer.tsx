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
        <p>© 2024 yarushikanai!! all rights untara kantara</p>
        <button className={`${deleteMode === true ? 'text-red-500' : 'text-gray-500'}`} onClick={() => setdeleteMode(!deleteMode)}>
          {deleteMode === true ? 'delete mode on': 'delete mode off'}
        </button>
      </div>
    </>
  )
}