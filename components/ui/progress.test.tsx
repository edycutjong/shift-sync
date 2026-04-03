 
import { render, screen } from '@testing-library/react';
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from './progress';

describe('Progress components', () => {
  it('renders correctly with default structure', () => {
    // The standard Progress wraps Track and Indicator internally
    render(
      <Progress data-testid="progress" value={42}>
        <ProgressLabel>Loading...</ProgressLabel>
        <ProgressValue />
      </Progress>
    );

    expect(screen.getByTestId('progress')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Track and Indicator via children', () => {
    render(
      <Progress data-testid="prog" value={42}>
        <ProgressTrack data-testid="t1" />
        <ProgressIndicator data-testid="i1" />
        <ProgressLabel>Custom Label 2</ProgressLabel>
        <ProgressValue data-testid="val" />
      </Progress>
    );
    expect(screen.getByTestId('prog')).toBeInTheDocument();
  });
});
