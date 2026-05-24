import { render, screen, fireEvent } from '@testing-library/react';
import { Result } from './Result';
import { MatchResult, MatchHistory } from '../types';

const mockCharacter = {
  characterNo: 1,
  characterName: 'マリオ',
  imageUrl: '/fighter/mario.png'
};

const mockMatches: { match: MatchResult; originalIndex: number }[] = [
  {
    match: {
      id: 1,
      nichiji: '2023-01-01T10:00:00Z',
      player: mockCharacter,
      opponentPlayer: mockCharacter,
      shouhai: '勝ち',
      memo: 'テストメモ1'
    },
    originalIndex: 0
  },
  {
    match: {
      id: 2,
      nichiji: '2023-01-01T10:10:00Z',
      player: mockCharacter,
      opponentPlayer: mockCharacter,
      shouhai: '負け',
      memo: 'テストメモ2'
    },
    originalIndex: 1
  }
];

const mockHistory: MatchHistory = {
  matches: mockMatches.map(m => m.match),
  winCount: 1,
  loseCount: 1
};

const defaultProps = {
  filteredMatches: mockMatches,
  history: mockHistory,
  setHistory: jest.fn(),
  haishin: false,
  filterMyCharId: null,
  setFilterMyCharId: jest.fn(),
  filterOppCharId: null,
  setFilterOppCharId: jest.fn(),
  filterDateRange: 'all' as const,
  setFilterDateRange: jest.fn(),
  customStartDate: '',
  setCustomStartDate: jest.fn(),
  customEndDate: '',
  setCustomEndDate: jest.fn(),
  onRowClick: jest.fn()
};

describe('Result Component', () => {
  test('勝敗数と勝率が正しく表示されること', () => {
    render(<Result {...defaultProps} />);
    // 新デザイン: "1 W - 1 L" と "(50.0%)" を個別に確認
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('(50.0%)')).toBeInTheDocument();
  });

  test('連勝時にメッセージが表示されること', () => {
    const streakMatches = [
      {
        match: { ...mockMatches[0].match, shouhai: '勝ち' as const },
        originalIndex: 0
      },
      {
        match: { ...mockMatches[0].match, shouhai: '勝ち' as const },
        originalIndex: 1
      }
    ];
    render(<Result {...defaultProps} filteredMatches={streakMatches} />);
    expect(screen.getByText(/2連勝中!/)).toBeInTheDocument();
  });

  test('配信モードの時はフィルターUIが表示されないこと', () => {
    const { rerender } = render(<Result {...defaultProps} haishin={false} />);
    // 通常モードではセレクトボックスが存在する
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);

    rerender(<Result {...defaultProps} haishin={true} />);
    // 配信モードではセレクトボックスが非表示
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('行をクリックした時にonRowClickが呼ばれること', () => {
    render(<Result {...defaultProps} />);
    // 新デザインはdivカード。最初の対戦カードをクリック
    const matchCards = screen.getAllByRole('img', { name: 'マリオ' });
    // 最初のカードの親要素 (p2.5 rounded-xl) をクリック
    fireEvent.click(matchCards[0].closest('[class*="glass-panel"]') as HTMLElement);
    expect(defaultProps.onRowClick).toHaveBeenCalledWith(0);
  });

  test('データがない場合に適切なメッセージが表示されること', () => {
    render(<Result {...defaultProps} filteredMatches={[]} />);
    expect(screen.getByText(/条件に一致する対戦記録がありません/)).toBeInTheDocument();
  });
});
