export function parseNumericValue(value: string): number {
  return parseFloat(value.replace(/,/g, ""));
}
