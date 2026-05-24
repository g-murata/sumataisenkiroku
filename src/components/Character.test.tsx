import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { CharacterType } from '../types';
import { Character } from './Character';

const mockCharacter: CharacterType = {
  characterNo: 1,
  characterName: 'マリオ',
  imageUrl: '/fighter/mario.png',
};

describe('Character', () => {
  it('プレイヤー名と「ファイターを選択してね」が表示される', () => {
    const onSelect = jest.fn();
    render(
      <Character
        player="あなた"
        onSelectCharacter={onSelect}
        selectedCharacter={null}
      />
    );
    expect(screen.getByText(/あなた/)).toBeInTheDocument();
    expect(screen.getByText('ファイターを選択してね')).toBeInTheDocument();
  });

  it('キャラクター選択時は名前と画像が表示される', () => {
    const onSelect = jest.fn();
    render(
      <Character
        player="相手"
        onSelectCharacter={onSelect}
        selectedCharacter={mockCharacter}
      />
    );
    expect(screen.getByText(/相手の使用ファイター/)).toBeInTheDocument();
    expect(screen.getByText('マリオ')).toBeInTheDocument();
    const marioImgs = screen.getAllByAltText('マリオ');
    expect(marioImgs[0]).toHaveAttribute('src', '/fighter/mario.png');
  });

  it('キャラクターをクリックすると onSelectCharacter が呼ばれる', () => {
    const onSelect = jest.fn();
    render(
      <Character
        player="あなた"
        onSelectCharacter={onSelect}
        selectedCharacter={null}
      />
    );
    const marioImgs = screen.getAllByAltText('マリオ');
    act(() => {
      fireEvent.click(marioImgs[0]);
    });
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ characterName: 'マリオ', characterNo: 1 })
    );
  });

  it('選択中の同じキャラをクリックすると null が渡される', () => {
    const onSelect = jest.fn();
    render(
      <Character
        player="あなた"
        onSelectCharacter={onSelect}
        selectedCharacter={mockCharacter}
      />
    );
    // 選択中の表示用画像と、リスト内の画像の2つがある
    const marioImgs = screen.getAllByAltText('マリオ');
    act(() => {
      fireEvent.click(marioImgs[1]);
    });
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
