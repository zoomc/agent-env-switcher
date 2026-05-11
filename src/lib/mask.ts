export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 5) {
    return "••••••";
  }
  const prefix = apiKey.slice(0, 3);
  const suffix = apiKey.slice(-2);
  const middleLength = Math.min(apiKey.length - 5, 8);
  const middle = "•".repeat(middleLength);
  return `${prefix}${middle}${suffix}`;
}
