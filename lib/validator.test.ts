 
import { validateRows } from './validator';

describe('validator: validateRows', () => {
  it('validates a correct row successfully', () => {
    const rows = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        date_of_birth: '1990-01-01',
      }
    ];

    const result = validateRows(rows);
    expect(result.validRows).toHaveLength(1);
    expect(result.invalidRows).toHaveLength(0);
    expect(result.summary.valid).toBe(1);
    expect(result.summary.invalid).toBe(0);
    expect(result.summary.errorsByField).toEqual({});
  });

  it('flags missing required fields', () => {
    const rows = [
      {
        first_name: '', // missing
        last_name: 'Doe',
        email: 'john@example.com',
      }
    ];

    const result = validateRows(rows);
    expect(result.validRows).toHaveLength(0);
    expect(result.invalidRows).toHaveLength(1);
    expect(result.invalidRows[0].errors).toContain('First Name is required');
    expect(result.summary.errorsByField).toEqual({ first_name: 1 });
  });

  it('ignores empty optional fields safely', () => {
    const rows = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '', // empty optional
        date_of_birth: '  ', // whitespace string
      }
    ];

    const result = validateRows(rows);
    expect(result.validRows).toHaveLength(1);
  });

  it('catches invalid emails', () => {
    const rows = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'not-an-email', // invalid
      }
    ];

    const result = validateRows(rows);
    expect(result.invalidRows).toHaveLength(1);
    expect(result.invalidRows[0].errors).toContain('Invalid email: "not-an-email"');
    expect(result.summary.errorsByField).toEqual({ email: 1 });
  });

  it('catches invalid dates', () => {
    const rows = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_birth: 'not-a-date' // invalid
      }
    ];

    const result = validateRows(rows);
    expect(result.invalidRows).toHaveLength(1);
    expect(result.invalidRows[0].errors).toContain('Invalid date: "not-a-date"');
    expect(result.summary.errorsByField).toEqual({ date_of_birth: 1 });
  });
});
