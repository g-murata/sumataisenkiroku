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

  it('「解除」ボタンをクリックすると onSelectCharacter(null) が呼ばれる', () => {
    const onSelect = jest.fn();
    render(
      <Character
        player="あなた"
        onSelectCharacter={onSelect}
        selectedCharacter={mockCharacter}
      />
    );
    const cancelButton = screen.getByRole('button', { name: /解除/ });
    act(() => {
      fireEvent.click(cancelButton);
    });
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
