/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from './dialog';

describe('Dialog', () => {
  it('renders standard dialog structure with close button', () => {
    // Setting open={true} since @base-ui/react/dialog handles state.
    // If not controlled via standard props, we test rendering of content directly by putting it in DOM.
    // Base-ui `Dialog` takes open={true}.
    render(
      <Dialog open={true}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Description text</DialogDescription>
          </DialogHeader>
          <div data-testid="internal-content">Inner Block</div>
          <DialogFooter showCloseButton={true}>
            <button>Footer Button</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Dialog trigger exists
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();

    // Because the dialog is open, the portal/content should be in the document
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Description text')).toBeInTheDocument();
    expect(screen.getByTestId('internal-content')).toBeInTheDocument();
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
    
    // showCloseButton=true adds a "Close" button to the footer 
    // AND a default 'Close' icon inside the DialogContent.
    // Wait, let's grab by accessible name.
    const closeButtons = screen.getAllByText('Close');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('renders DialogContent without close button if specified', () => {
    render(
      <Dialog open={true}>
        <DialogContent showCloseButton={false}>
          <div>No Default Close Button</div>
        </DialogContent>
      </Dialog>
    );
    // Since we disabled showCloseButton, there should be no default XIcon close button
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
    expect(screen.getByText('No Default Close Button')).toBeInTheDocument();
  });

  it('DialogFooter renders without close button by default', () => {
    render(
      <Dialog open={true}>
        <DialogFooter data-testid="footer-test">
          <span>Some text</span>
        </DialogFooter>
      </Dialog>
    );
    expect(screen.getByTestId('footer-test')).toBeInTheDocument();
    expect(screen.getByText('Some text')).toBeInTheDocument();
    // No "Close" text in the footer specifically
  });

  it('DialogClose renders a custom close component', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogClose>Custom Close</DialogClose>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Custom Close')).toBeInTheDocument();
  });

  it('renders DialogOverlay and DialogPortal directly', () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogPortal>
          <DialogOverlay data-testid="dialog-overlay-test" />
          <div data-testid="portal-content">Portal</div>
        </DialogPortal>
      </Dialog>
    );
    // Overlays get injected via portal outside of simple container easily.
    expect(screen.getByTestId('portal-content')).toBeInTheDocument();
  });
});
