// Normal fit to simulated game outcomes, never a real-world trait ranking.
export function normalPercentile(value, mean, sd) {
  if (![value, mean, sd].every(Number.isFinite) || sd <= 0) return null;
  const z = (value - mean) / sd;
  if (z === 0) return 50;
  const t = 1 / (1 + .2316419 * Math.abs(z));
  const tail = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) * t * (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return Math.round(Math.max(.01, Math.min(99.99, (z >= 0 ? 1 - tail : tail) * 100)) * 100) / 100;
}
