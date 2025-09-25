import { cn } from '../utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('handles conditional classes', () => {
    const result = cn(
      'base-class',
      true && 'true-class',
      false && 'false-class',
      'another-class'
    )
    expect(result).toBe('base-class true-class another-class')
  })

  it('handles array of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('handles object notation', () => {
    const result = cn({
      'active-class': true,
      'inactive-class': false,
      'hover-class': true,
    })
    expect(result).toBe('active-class hover-class')
  })

  it('removes duplicate classes', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('merges Tailwind modifiers correctly', () => {
    const result = cn('hover:bg-red-500', 'hover:bg-blue-500')
    expect(result).toBe('hover:bg-blue-500')
  })
})