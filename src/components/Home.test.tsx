import React, { useState } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Home } from './Home';
import { MatchHistory, MatchResult } from '../types';

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
    from: () => ({ 
      insert: () => Promise.resolve({ error: null }),
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) })
    }),
  },
}));

const STORAGE_KEY = 'gameResults';

const initialHistory: MatchHistory = { matches: [], winCount: 0, loseCount: 0 };

function HomeWrapper() {
  const [history, setHistory] = useState<MatchHistory>(initialHistory);
  const onAddResult = (newMatch: MatchResult) => {
    setHistory((prev) => ({
      matches: [newMatch, ...prev.matches],
      winCount: newMatch.shouhai === '勝ち' ? prev.winCount + 1 : prev.winCount,
      loseCount: newMatch.shouhai === '負け' ? prev.loseCount + 1 : prev.loseCount,
    }));
  };
  const onClearResults = () => {
    if (!window.confirm('本当に全ての履歴を削除しますか？')) return;
    setHistory({ matches: [], winCount: 0, loseCount: 0 });
  };
  return (
    <Home
      history={history}
      onAddResult={onAddResult}
      onRowClick={() => {}}
      onClearResults={onClearResults}
      user={null}
    />
  );
}

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === STORAGE_KEY) return null;
      return null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('勝ち・負けボタンが表示される（結果送信ボタンは非表示）', () => {
    render(<HomeWrapper />);
    expect(screen.getByRole('button', { name: '勝ち' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '負け' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '対戦結果を送信' })).not.toBeInTheDocument();
  });

  it('キャラ未選択時は勝ち・負けボタンが disabled', () => {
    render(<HomeWrapper />);
    expect(screen.getByRole('button', { name: '勝ち' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '負け' })).toBeDisabled();
  });

  it('あなた・相手の両方でキャラを選ぶと勝ち・負けボタンが有効になる', () => {
    render(<HomeWrapper />);
    const mySection = screen.getByText(/あなた/).closest('.glass-panel')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getAllByText(/相手/)[0].closest('.glass-panel')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="ドンキー"]') ?? [];

    act(() => {
      if (myImgs.length > 0) fireEvent.click(myImgs[0] as HTMLElement);
    });
    act(() => {
      if (oppImgs.length > 0) fireEvent.click(oppImgs[0] as HTMLElement);
    });

    expect(screen.getByRole('button', { name: '勝ち' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: '負け' })).not.toBeDisabled();
  });

  it('勝ちボタンをクリックすると即座に戦績が 1 W - 0 L になる', () => {
    render(<HomeWrapper />);
    const mySection = screen.getByText(/あなた/).closest('.glass-panel')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getAllByText(/相手/)[0].closest('.glass-panel')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="リンク"]') ?? [];

    act(() => {
      if (myImgs.length > 0) fireEvent.click(myImgs[0] as HTMLElement);
    });
    act(() => {
      if (oppImgs.length > 0) fireEvent.click(oppImgs[0] as HTMLElement);
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '勝ち' }));
    });

    // 1 W - 0 L (Result.tsx の表示仕様に準じる)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('負けボタンをクリックすると即座に戦績が 0 W - 1 L になる', () => {
    render(<HomeWrapper />);
    const mySection = screen.getByText(/あなた/).closest('.glass-panel')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getAllByText(/相手/)[0].closest('.glass-panel')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="リンク"]') ?? [];

    act(() => {
      if (myImgs.length > 0) fireEvent.click(myImgs[0] as HTMLElement);
    });
    act(() => {
      if (oppImgs.length > 0) fireEvent.click(oppImgs[0] as HTMLElement);
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '負け' }));
    });

    // 0 W - 1 L (Result.tsx の表示仕様に準じる)
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('「全対戦記録の一括削除」で confirm が呼ばれ、OK で戦績がリセットされる', () => {
    window.confirm = vi.fn().mockReturnValue(true);
    render(<HomeWrapper />);

    const mySection = screen.getByText(/あなた/).closest('.glass-panel')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getAllByText(/相手/)[0].closest('.glass-panel')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="リンク"]') ?? [];

    act(() => {
      if (myImgs.length > 0) fireEvent.click(myImgs[0] as HTMLElement);
    });
    act(() => {
      if (oppImgs.length > 0) fireEvent.click(oppImgs[0] as HTMLElement);
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '勝ち' }));
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '全対戦記録の一括削除' }));
    });

    expect(window.confirm).toHaveBeenCalledWith('本当に全ての履歴を削除しますか？');
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });

  it('「全対戦記録の一括削除」で confirm をキャンセルするとリセットされない', () => {
    window.confirm = vi.fn().mockReturnValue(false);
    render(<HomeWrapper />);

    const mySection = screen.getByText(/あなた/).closest('.glass-panel')?.parentElement;
    const myImgs = mySection?.querySelectorAll('img[alt="マリオ"]') ?? [];
    const oppSection = screen.getAllByText(/相手/)[0].closest('.glass-panel')?.parentElement;
    const oppImgs = oppSection?.querySelectorAll('img[alt="リンク"]') ?? [];

    act(() => {
      if (myImgs.length > 0) fireEvent.click(myImgs[0] as HTMLElement);
      if (oppImgs.length > 0) fireEvent.click(oppImgs[0] as HTMLElement);
      fireEvent.click(screen.getByRole('button', { name: '勝ち' }));
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '全対戦記録の一括削除' }));
    });

    expect(window.confirm).toHaveBeenCalledWith('本当に全ての履歴を削除しますか？');
    expect(window.confirm).toHaveReturnedWith(false);
  });
});
