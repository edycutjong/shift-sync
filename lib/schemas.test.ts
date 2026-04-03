import { 
  targetSchema, 
  targetFieldKeys, 
  MappingItemSchema, 
  MappingResponseSchema,
  fallbackMapping 
} from './schemas';

describe('schemas', () => {
  it('targetSchema should have expected properties', () => {
    expect(targetSchema.first_name.required).toBe(true);
    expect(targetSchema.email.type).toBe('email');
    expect(targetFieldKeys).toContain('first_name');
    expect(targetFieldKeys).toContain('date_of_birth');
  });

  describe('MappingItemSchema', () => {
    it('validates correct mapping items', () => {
      const validItem = {
        source: 'fname',
        target: 'first_name',
        confidence: 0.9,
        transform: 'trim'
      };
      
      const result = MappingItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('rejects invalid confidence scores', () => {
      const invalidItem = {
        source: 'fname',
        target: 'first_name',
        confidence: 1.5, // over 1
        transform: 'trim'
      };
      
      const result = MappingItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });
  });

  describe('MappingResponseSchema', () => {
    it('validates a full correct response', () => {
      const result = MappingResponseSchema.safeParse(fallbackMapping);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid structure', () => {
      const result = MappingResponseSchema.safeParse({ mappings: [] });
      expect(result.success).toBe(false); // missing unmapped_source and missing_target
    });
  });
});
