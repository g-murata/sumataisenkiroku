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
    expect(screen.getByText(/1勝1敗/)).toBeInTheDocument();
    expect(screen.getByText(/(50.0%)/)).toBeInTheDocument();
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
    expect(screen.getByText(/2連勝!/)).toBeInTheDocument();
  });

  test('配信モードの時はフィルターUIが表示されないこと', () => {
    const { rerender } = render(<Result {...defaultProps} haishin={false} />);
    expect(screen.getByRole('combobox', { name: '日付範囲' })).toBeInTheDocument();

    rerender(<Result {...defaultProps} haishin={true} />);
    expect(screen.queryByRole('combobox', { name: '日付範囲' })).not.toBeInTheDocument();
  });

  test('行をクリックした時にonRowClickが呼ばれること', () => {
    render(<Result {...defaultProps} />);
    const rows = screen.getAllByRole('row');
    // rows[0] は thead 内の tr
    // rows[1] は最初のデータ行 (originalIndex: 0)
    fireEvent.click(rows[1]);
    expect(defaultProps.onRowClick).toHaveBeenCalledWith(0);
  });

  test('データがない場合に適切なメッセージが表示されること', () => {
    render(<Result {...defaultProps} filteredMatches={[]} />);
    expect(screen.getByText(/条件に一致する記録がありません/)).toBeInTheDocument();
  });
});
