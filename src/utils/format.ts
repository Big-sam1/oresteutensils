export function currency(value: number): string {
  return `${Math.round(value).toLocaleString()} FRW`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}