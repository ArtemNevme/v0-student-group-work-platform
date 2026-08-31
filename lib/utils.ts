import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Normalize display text that may contain broken replacement characters from old data. */
export function cleanDisplayName(name: string | null | undefined): string {
  if (!name) return ""
  return name.replace(/\uFFFD/g, "-").replace(/\s+/g, " ").trim()
}
