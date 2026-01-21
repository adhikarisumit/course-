import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a user role has admin access (admin or super)
 */
export function isAdminRole(role: string | undefined | null): boolean {
  return role === 'admin' || role === 'super'
}

