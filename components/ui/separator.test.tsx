 
import { render, screen } from '@testing-library/react';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders horizontal correctly', () => {
    // using base-ui gives it an implicit or explicit role usually 'separator'
    render(<Separator data-testid="sep" orientation="horizontal" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toBeInTheDocument();
    // Some internal base-ui logic sets data-orientation or aria-orientation
  });

  it('renders vertical correctly', () => {
    render(<Separator data-testid="sep-vert" orientation="vertical" />);
    const sep = screen.getByTestId('sep-vert');
    expect(sep).toBeInTheDocument();
  });

  it('renders correctly without explicit orientation (defaults to horizontal)', () => {
    render(<Separator data-testid="sep-default" className="test-class" />);
    const sep = screen.getByTestId('sep-default');
    expect(sep).toBeInTheDocument();
    expect(sep).toHaveClass('test-class');
  });
});
