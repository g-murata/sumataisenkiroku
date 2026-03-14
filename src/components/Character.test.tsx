import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterType } from '../types';
import { Character } from './Character';

const mockCharacter: CharacterType = {
  characterNo: 1,
  characterName: 'マリオ',
  imageUrl: '/fighter/mario.png',
};

describe('Character', () => {
  it('プレイヤー名と「キャラクターを選んでね」が表示される', () => {
    const onSelect = jest.fn();
    render(
      <Character
        player="あなた"
        onSelectCharacter={onSelect}
        selectedCharacter={null}
      />
    );
    expect(screen.getByText('あなたの使用ファイター：')).toBeInTheDocument();
    expect(screen.getByText('キャラクターを選んでね。')).toBeInTheDocument();
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
    expect(screen.getByText('相手の使用ファイター：')).toBeInTheDocument();
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
      userEvent.click(marioImgs[0]);
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
    const marioImgs = screen.getAllByAltText('マリオ');
    act(() => {
      userEvent.click(marioImgs[1]);
    });
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
