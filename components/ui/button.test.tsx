/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders variants correctly', () => {
    const variants: ('default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link')[] = [
      'default', 'outline', 'secondary', 'ghost', 'destructive', 'link'
    ];
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant}btn</Button>);
      expect(screen.getByText(`${variant}btn`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders sizes correctly', () => {
    const sizes: ('default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg')[] = [
      'default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'
    ];
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>{size}btn</Button>);
      expect(screen.getByText(`${size}btn`)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies custom className', () => {
    render(<Button className="test-btn">Test</Button>);
    expect(screen.getByText('Test')).toHaveClass('test-btn');
  });

  it('can be clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Clickable</Button>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
