export function getValidNumber(value: any): number {
  if (isNaN(value) || value == null || value == undefined) return 0;
  else return value;
}
