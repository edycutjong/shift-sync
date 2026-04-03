import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from './badge';

describe('Badge', () => {
  it('renders correctly with default variant', () => {
    render(<Badge>Test Badge</Badge>);
    const badge = screen.getByText('Test Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(badgeVariants({ variant: 'default' }).split(' ')[0]);
  });

  it('renders all variants correctly', () => {
    const variants: ('default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link')[] = [
      'default', 'secondary', 'destructive', 'outline', 'ghost', 'link'
    ];
    
    variants.forEach(variant => {
      const { unmount } = render(<Badge variant={variant.toLowerCase() as any}>{variant}Badge</Badge>);
      const badge = screen.getByText(`${variant}Badge`);
      expect(badge).toBeInTheDocument();
      unmount();
    });
  });

  it('applies custom className', () => {
    render(<Badge className="custom-test-class">CustomBadge</Badge>);
    expect(screen.getByText('CustomBadge')).toHaveClass('custom-test-class');
  });
  
  it('supports custom render prop / asChild pattern via useRender', () => {
    render(
      <Badge render={<a href="/test" data-testid="link-badge" />}>
        LinkBadge
      </Badge>
    );
    const badge = screen.getByTestId('link-badge');
    expect(badge.tagName).toBe('A');
    expect(badge).toHaveAttribute('href', '/test');
  });
});
