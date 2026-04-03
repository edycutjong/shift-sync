import { cn } from './utils';

describe('utils: cn', () => {
  it('merges class names properly using clsx and twMerge', () => {
    // Basic merging
    expect(cn('block', 'hidden')).toBe('hidden');
    expect(cn('p-4', 'p-8')).toBe('p-8');
    
    // clsx conditions
    expect(cn('flex', { 'flex-col': true, 'items-center': false })).toBe('flex flex-col');
    
    // Arrays and object mixes
    expect(cn(['w-full', 'h-full'], { 'bg-red-500': true })).toBe('w-full h-full bg-red-500');

    // Falsy values
    expect(cn(null, undefined, false, 0, 'opacity-50')).toBe('opacity-50');
  });
});
