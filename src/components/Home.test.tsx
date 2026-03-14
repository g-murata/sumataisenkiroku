import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from './Home';

const STORAGE_KEY = 'gameResults';

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === STORAGE_KEY) return null;
      return null;
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ヘッダーと勝ち・負け・結果送信ボタンが表示される', () => {
    render(<Home />);
    expect(screen.getByText('スマ対戦記録')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '勝ち' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '負け' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '結果送信' })).toBeInTheDocument();
  });

  it('キャラ未選択時は勝ち・負け・結果送信が disabled', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: '勝ち' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '負け' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '結果送信' })).toBeDisabled();
  });

  it('あなた・相手の両方でキャラを選ぶとボタンが有効になる', () => {
    render(<Home />);
    const mySection = screen.getByText('あなたの使用ファイター：').closest('div')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getByText('相手の使用ファイター：').closest('div')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="ドンキー"]') ?? [];

    act(() => {
      if (myImgs.length > 0) userEvent.click(myImgs[0] as HTMLElement);
    });
    act(() => {
      if (oppImgs.length > 0) userEvent.click(oppImgs[0] as HTMLElement);
    });

    expect(screen.getByRole('button', { name: '結果送信' })).not.toBeDisabled();
  });

  it('結果送信（勝ち）で戦績が 1勝0敗 になる', () => {
    render(<Home />);
    const mySection = screen.getByText('あなたの使用ファイター：').closest('div')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getByText('相手の使用ファイター：').closest('div')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="リンク"]') ?? [];

    act(() => {
      if (myImgs.length > 0) userEvent.click(myImgs[0] as HTMLElement);
    });
    act(() => {
      if (oppImgs.length > 0) userEvent.click(oppImgs[0] as HTMLElement);
    });
    act(() => {
      userEvent.click(screen.getByRole('button', { name: '勝ち' }));
      userEvent.click(screen.getByRole('button', { name: '結果送信' }));
    });

    expect(screen.getAllByTestId('win-lose-record')[0]).toHaveTextContent('戦績 1勝0敗');
  });

  it('結果送信（負け）で戦績が 0勝1敗 になる', () => {
    render(<Home />);
    const mySection = screen.getByText('あなたの使用ファイター：').closest('div')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getByText('相手の使用ファイター：').closest('div')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="リンク"]') ?? [];

    act(() => {
      if (myImgs.length > 0) userEvent.click(myImgs[0] as HTMLElement);
    });
    act(() => {
      if (oppImgs.length > 0) userEvent.click(oppImgs[0] as HTMLElement);
    });
    act(() => {
      userEvent.click(screen.getByRole('button', { name: '負け' }));
    });
    act(() => {
      userEvent.click(screen.getByRole('button', { name: '結果送信' }));
    });

    expect(screen.getAllByTestId('win-lose-record')[0]).toHaveTextContent('戦績 0勝1敗');
  });

  it('「勝敗記録一括削除」で confirm が呼ばれ、OK で戦績がリセットされる', () => {
    window.confirm = jest.fn().mockReturnValue(true);
    render(<Home />);

    const mySection = screen.getByText('あなたの使用ファイター：').closest('div')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getByText('相手の使用ファイター：').closest('div')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="リンク"]') ?? [];

    act(() => {
      if (myImgs.length > 0) userEvent.click(myImgs[0] as HTMLElement);
    });
    act(() => {
      if (oppImgs.length > 0) userEvent.click(oppImgs[0] as HTMLElement);
    });
    act(() => {
      userEvent.click(screen.getByRole('button', { name: '勝ち' }));
    });
    act(() => {
      userEvent.click(screen.getByRole('button', { name: '結果送信' }));
    });

    expect(screen.getAllByTestId('win-lose-record')[0]).toHaveTextContent('戦績 1勝0敗');

    act(() => {
      userEvent.click(screen.getByRole('button', { name: '勝敗記録一括削除' }));
    });

    expect(window.confirm).toHaveBeenCalledWith('本当にリセットしますか？');
    expect(screen.getAllByTestId('win-lose-record')[0]).toHaveTextContent('戦績 0勝0敗');
  });

  it('「勝敗記録一括削除」で confirm をキャンセルするとリセットされない', () => {
    window.confirm = jest.fn().mockReturnValue(false);
    render(<Home />);

    const mySection = screen.getByText('あなたの使用ファイター：').closest('div')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getByText('相手の使用ファイター：').closest('div')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="リンク"]') ?? [];

    act(() => {
      if (myImgs.length > 0) userEvent.click(myImgs[0] as HTMLElement);
      if (oppImgs.length > 0) userEvent.click(oppImgs[0] as HTMLElement);
      userEvent.click(screen.getByRole('button', { name: '勝ち' }));
      userEvent.click(screen.getByRole('button', { name: '結果送信' }));
    });

    const removeItemCallsBefore = (Storage.prototype.removeItem as jest.Mock).mock.calls.length;
    act(() => {
      userEvent.click(screen.getByRole('button', { name: '勝敗記録一括削除' }));
    });
    const removeItemCallsAfter = (Storage.prototype.removeItem as jest.Mock).mock.calls.length;

    expect(window.confirm).toHaveBeenCalledWith('本当にリセットしますか？');
    expect(removeItemCallsAfter).toBe(removeItemCallsBefore);
  });
});
