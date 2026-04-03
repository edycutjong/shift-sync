import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from './scroll-area';

// Mock base-ui to just render normally to avoid layout engine dependencies in jsdom
jest.mock('@base-ui/react/scroll-area', () => ({
  ScrollArea: {
    Root: (props: any) => <div data-testid="mock-root" {...props} />,
    Viewport: (props: any) => <div data-testid="mock-viewport" {...props} />,
    Scrollbar: (props: any) => <div data-testid="mock-scrollbar" {...props} />,
    Thumb: (props: any) => <div data-testid="mock-thumb" {...props} />,
    Corner: (props: any) => <div data-testid="mock-corner" {...props} />,
  }
}));

describe('ScrollArea', () => {
  it('renders standard ScrollArea structure', () => {
    render(
      <ScrollArea data-testid="scroll" className="h-40 w-40">
        <div data-testid="scroll-content">Internal Content</div>
      </ScrollArea>
    );
    expect(screen.getByTestId('scroll')).toBeInTheDocument();
  });

  it('renders explicit ScrollBar with orientation', () => {
    // Explicitly rendering ScrollBar independently.
    // Our custom ScrollBar wraps ScrollAreaPrimitive.Scrollbar.
    render(<ScrollBar data-testid="custom-sb" orientation="horizontal" />);
    const bar = screen.getByTestId('custom-sb');
    expect(bar).toHaveAttribute('data-orientation', 'horizontal');
  });
});
