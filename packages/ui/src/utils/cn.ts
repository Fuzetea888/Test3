import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and merges Tailwind CSS classes using tailwind-merge
 * This prevents duplicate Tailwind classes and ensures proper class precedence
 * 
 * @param inputs - Class names to combine
 * @returns Combined and merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default cn;