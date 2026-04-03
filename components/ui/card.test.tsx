 
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card';

describe('Card components', () => {
  it('renders Card and handles size correctly', () => {
    // Default size
    const { unmount: unmount1 } = render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveAttribute('data-size', 'default');
    unmount1();

    // Small size
    render(<Card data-testid="card-sm" size="sm">Content</Card>);
    expect(screen.getByTestId('card-sm')).toHaveAttribute('data-size', 'sm');
  });

  it('renders CardHeader correctly', () => {
    render(<CardHeader data-testid="card-header" className="test-header">Header</CardHeader>);
    const el = screen.getByTestId('card-header');
    expect(el).toHaveClass('test-header');
    expect(el).toHaveTextContent('Header');
  });

  it('renders CardTitle correctly', () => {
    render(<CardTitle data-testid="card-title">Title</CardTitle>);
    expect(screen.getByTestId('card-title')).toHaveTextContent('Title');
  });

  it('renders CardDescription correctly', () => {
    render(<CardDescription data-testid="card-desc">Description</CardDescription>);
    expect(screen.getByTestId('card-desc')).toHaveTextContent('Description');
  });

  it('renders CardAction correctly', () => {
    render(<CardAction data-testid="card-act">Action</CardAction>);
    expect(screen.getByTestId('card-act')).toHaveTextContent('Action');
  });

  it('renders CardContent correctly', () => {
    render(<CardContent data-testid="card-content">Content Block</CardContent>);
    expect(screen.getByTestId('card-content')).toHaveTextContent('Content Block');
  });

  it('renders CardFooter correctly', () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    expect(screen.getByTestId('card-footer')).toHaveTextContent('Footer');
  });

  it('assembles a full card without crashing', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
          <CardDescription>My Description</CardDescription>
          <CardAction>Click me</CardAction>
        </CardHeader>
        <CardContent>Main content here</CardContent>
        <CardFooter>Footer text</CardFooter>
      </Card>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Description')).toBeInTheDocument();
    expect(screen.getByText('Main content here')).toBeInTheDocument();
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });
});
