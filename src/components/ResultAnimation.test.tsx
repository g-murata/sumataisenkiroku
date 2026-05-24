import { render, screen, act } from '@testing-library/react';
import { ResultAnimation } from './ResultAnimation';

describe('ResultAnimation Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('勝利時にWIN!が表示されること', () => {
    render(<ResultAnimation result="勝ち" />);
    expect(screen.getByText('WIN!')).toBeInTheDocument();
    expect(screen.getByText('WIN!')).toHaveClass('text-red-500');
  });

  test('敗北時にLOSE...が表示されること', () => {
    render(<ResultAnimation result="負け" />);
    expect(screen.getByText('LOSE...')).toBeInTheDocument();
    expect(screen.getByText('LOSE...')).toHaveClass('text-blue-500');
  });

  test('2秒後にonCompleteが呼ばれること', () => {
    const mockOnComplete = jest.fn();
    render(<ResultAnimation result="勝ち" onComplete={mockOnComplete} />);

    // 2秒経過させる
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  test('mode="absolute"の時に適切なクラスが適用されること', () => {
    const { container } = render(<ResultAnimation result="勝ち" mode="absolute" />);
    const parentDiv = container.firstChild;
    expect(parentDiv).toHaveClass('absolute');
    expect(parentDiv).not.toHaveClass('fixed');
  });
});
