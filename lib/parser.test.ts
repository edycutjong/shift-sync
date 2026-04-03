 
import { parseCSV, parseFile, extractSampleData } from './parser';
import Papa from 'papaparse';

// Mock Papa so it triggers callbacks synchronously without depending on actual File reading in jsdom
jest.mock('papaparse', () => ({
  parse: jest.fn(),
}));

describe('parser', () => {
  const createFile = (size: number, name = 'test.csv', type = 'text/csv'): File => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  describe('parseFile', () => {
    it('rejects files over 10MB', async () => {
      const file = createFile(11 * 1024 * 1024);
      await expect(parseFile(file)).rejects.toThrow(/File too large/);
    });

    it('rejects unsupported file extensions', async () => {
      const file = createFile(100, 'test.txt', 'text/plain');
      await expect(parseFile(file)).rejects.toThrow(/Unsupported file type/);
    });

    it('accepts valid csv files and calls parseCSV', async () => {
      (Papa.parse as jest.Mock).mockImplementationOnce((f, config) => {
        config.complete({ data: [['a'], ['b']] });
      });

      const file = createFile(100, 'test.csv', 'text/csv');
      const result = await parseFile(file);
      expect(result.headers).toEqual(['a']);
      expect(result.rows).toEqual([['b']]);
    });
  });

  describe('parseCSV', () => {
    it('rejects if no data rows exist', async () => {
      (Papa.parse as jest.Mock).mockImplementationOnce((f, config) => {
        config.complete({ data: [['a']] }); // only header
      });

      const file = createFile(100);
      await expect(parseCSV(file)).rejects.toThrow(/File must contain a header row/);
    });

    it('rejects if papa parse throws an error', async () => {
      (Papa.parse as jest.Mock).mockImplementationOnce((f, config) => {
        config.error(new Error('Papa error'));
      });

      const file = createFile(100);
      await expect(parseCSV(file)).rejects.toThrow('Papa error');
    });

    it('handles padding and truncating rows properly, skipping completely empty ones', async () => {
      (Papa.parse as jest.Mock).mockImplementationOnce((f, config) => {
        config.complete({
          data: [
            ['h1', 'h2 '],
            [' r1', 'r2'],
            ['short'], // short row (should pad)
            ['r1', 'r2', 'r3'], // long row (should slice)
            ['   ', ''], // empty row (should filter out)
          ]
        });
      });

      const file = createFile(100, 'pad.csv');
      const result = await parseCSV(file);
      expect(result.headers).toEqual(['h1', 'h2']);
      expect(result.rows).toEqual([
        [' r1', 'r2'],
        ['short', ''],
        ['r1', 'r2']
      ]);
      expect(result.totalRows).toBe(3);
    });
  });

  describe('extractSampleData', () => {
    it('extracts sample data correctly', () => {
      const parsed = {
        headers: ['a'],
        rows: [['1'], ['2'], ['3'], ['4'], ['5'], ['6']],
        totalRows: 6,
        fileName: 'a.csv'
      };
      
      const res = extractSampleData(parsed, 2);
      expect(res.headers).toEqual(['a']);
      expect(res.sampleRows.length).toBe(2);
      expect(res.sampleRows).toEqual([['1'], ['2']]);
    });

    it('extracts sample data correctly with default size', () => {
      const parsed = {
        headers: ['a'],
        rows: [['1'], ['2'], ['3'], ['4'], ['5'], ['6']],
        totalRows: 6,
        fileName: 'a.csv'
      };
      
      const res = extractSampleData(parsed);
      expect(res.headers).toEqual(['a']);
      expect(res.sampleRows.length).toBe(5);
    });
  });
});
