import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toNumber(value: unknown): number {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

export function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

export function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '-';
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function fmtP(n: number | null | undefined): string {
  if (n == null || isNaN(n) || !isFinite(n)) return '-';
  return Number(n).toFixed(2) + '%';
}

export function fmtR(n: number | null | undefined): string {
  if (n == null || isNaN(n) || !isFinite(n)) return '-';
  return Number(n).toFixed(2) + 'x';
}

export function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
