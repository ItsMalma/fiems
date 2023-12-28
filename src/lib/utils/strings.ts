export function lowerToTitleCase(str: string): string {
  return str
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function camelToTitleCase(str: string): string {
  return lowerToTitleCase(str.replace(/([A-Z])/g, " $1"));
}
