// Utility function to format numbers with abbreviations (1k, 1M, etc.)

export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  if (num < 1000000) {
    // Thousands (k)
    const k = num / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }

  if (num < 1000000000) {
    // Millions (M)
    const m = num / 1000000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }

  if (num < 1000000000000) {
    // Billions (B)
    const b = num / 1000000000;
    return b % 1 === 0 ? `${b}B` : `${b.toFixed(1)}B`;
  }

  if (num < 1000000000000000) {
    // Trillions (T)
    const t = num / 1000000000000;
    return t % 1 === 0 ? `${t}T` : `${t.toFixed(1)}T`;
  }

  // For extremely large numbers, use scientific notation
  return num.toExponential(2);
}

