import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

describe('Table components', () => {
  it('renders standard table structure', () => {
    // Need to test that it all works together without crashing, standard rendering
    render(
      <Table data-testid="table-comp">
        <TableCaption data-testid="caption">My Table Caption</TableCaption>
        <TableHeader data-testid="thead">
          <TableRow data-testid="tr-head">
            <TableHead data-testid="th">Col 1</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="tbody">
          <TableRow data-testid="tr-body">
            <TableCell data-testid="td">Cell 1</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter data-testid="tfoot">
          <TableRow>
            <TableCell>Footer Cell</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByTestId('caption')).toHaveTextContent('My Table Caption');
    expect(screen.getByTestId('thead')).toBeInTheDocument();
    expect(screen.getByTestId('th')).toHaveTextContent('Col 1');
    expect(screen.getByTestId('tbody')).toBeInTheDocument();
    expect(screen.getByTestId('td')).toHaveTextContent('Cell 1');
    expect(screen.getByTestId('tfoot')).toBeInTheDocument();
    
    // Testing the inner Table wrapper
    // The data-testid is attached to the <table> element
    expect(screen.getByTestId('table-comp').tagName).toBe('TABLE');
  });
});
