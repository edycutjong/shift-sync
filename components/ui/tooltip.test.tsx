import { render, screen } from '@testing-library/react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip';

describe('Tooltip', () => {
  it('renders standard tooltip structure', () => {
    // When open={true}, the content is rendered in a portal.
    render(
      <TooltipProvider delay={0}>
        <Tooltip open={true}>
          <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
          <TooltipContent data-testid="content">
            Tooltip Text
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    
    // The content is rendered because open={true}
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Tooltip Text')).toBeInTheDocument();
  });

  it('renders TooltipProvider with default delay', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipContent data-testid="content-default">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByTestId('content-default')).toBeInTheDocument();
  });
});
