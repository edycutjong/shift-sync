 
import { applyTransforms } from './transformer';

describe('transformer: applyTransforms', () => {
  it('applies basic string transforms (trim, lowercase, uppercase)', () => {
    const headers = ['fname', 'lname'];
    const rows = [['  John  ', 'DOE']];
    const mappings = [
      { source: 'fname', target: 'first_name', confidence: 1, transform: 'trim,lowercase' },
      { source: 'lname', target: 'last_name', confidence: 1, transform: 'trim,uppercase' }
    ];

    const { transformedRows, errors } = applyTransforms(rows, headers, mappings);
    
    expect(errors).toHaveLength(0);
    expect(transformedRows[0]).toEqual({
      first_name: 'john',
      last_name: 'DOE'
    });
  });

  it('ignores mappings where the source column is not found', () => {
    const headers = ['fname'];
    const rows = [['John']];
    const mappings = [
      { source: 'missing_col', target: 'first_name', confidence: 1, transform: '' }
    ];

    const { transformedRows } = applyTransforms(rows, headers, mappings);
    expect(transformedRows[0]).toEqual({}); // no mapping applied
  });

  it('handles null/undefined values gracefully', () => {
    const headers = ['fname'];
    const rows = [[undefined as unknown as string]]; // Simulating missing pad
    const mappings = [
      { source: 'fname', target: 'first_name', confidence: 1, transform: 'trim' }
    ];

    const { transformedRows } = applyTransforms(rows, headers, mappings);
    expect(transformedRows[0].first_name).toBe('');
  });

  it('parses dates and catches invalid ones', () => {
    const headers = ['dob1', 'dob2', 'dob3', 'dob4', 'dob5', 'dob6'];
    const rows = [['1990-05-15', '15/05/1990', 'invalid_date', '  ', '14.02.2000', '99/99/2023']]; // ISO, DD/MM/YYYY, invalid, empty, DD.MM.YYYY, invalid-format
    const mappings = [
      { source: 'dob1', target: 'd1', confidence: 1, transform: 'parse_date' },
      { source: 'dob2', target: 'd2', confidence: 1, transform: 'parse_date' },
      { source: 'dob3', target: 'd3', confidence: 1, transform: 'parse_date' },
      { source: 'dob4', target: 'd4', confidence: 1, transform: 'parse_date' },
      { source: 'dob5', target: 'd5', confidence: 1, transform: 'parse_date' },
      { source: 'dob6', target: 'd6', confidence: 1, transform: 'parse_date' },
    ];

    const { transformedRows, errors } = applyTransforms(rows, headers, mappings);
    
    expect(transformedRows[0].d1).toMatch(/^1990-05-15/);
    expect(transformedRows[0].d2).toMatch(/^1990-05-15/);
    expect(transformedRows[0].d3).toBe('invalid_date');
    expect(transformedRows[0].d4).toBe('');
    expect(transformedRows[0].d5).toMatch(/^2000-02-14/);
    expect(transformedRows[0].d6).toBe('99/99/2023'); // Should fallback to exactly original invalid
    
    expect(errors).toHaveLength(2); // 'invalid_date' and '99/99/2023'
    expect(errors[0].field).toBe('d3');
    expect(errors[1].field).toBe('d6');
  });

  it('validates emails correctly', () => {
    const headers = ['e1', 'e2', 'e3'];
    const rows = [['test@example.com', 'invalid_email.com', '']];
    const mappings = [
      { source: 'e1', target: 'email1', confidence: 1, transform: 'validate_email' },
      { source: 'e2', target: 'email2', confidence: 1, transform: 'validate_email' },
      { source: 'e3', target: 'email3', confidence: 1, transform: 'validate_email' },
    ];

    const { transformedRows, errors } = applyTransforms(rows, headers, mappings);
    
    expect(transformedRows[0].email1).toBe('test@example.com');
    expect(transformedRows[0].email2).toBe('invalid_email.com');
    expect(transformedRows[0].email3).toBe('');
    
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('email2');
  });
});
