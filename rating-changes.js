const clamp = value => Math.max(0, Math.min(10, value));

// Distance is measured in the direction of travel. Midscale changes retain
// their full amount; movement toward a nearby edge slows, while recovery away
// from it is modestly quicker. A nonzero floor keeps the endpoints reachable.
export function ratingChange(current, amount) {
  if (!amount) return 0;
  const distance = amount > 0 ? 10 - clamp(current) : clamp(current);
  return amount * (.35 + .65 * Math.log1p(distance) / Math.log(6));
}

export function changedRating(current, amount) {
  return Math.round(clamp(current + ratingChange(current, amount)) * 100) / 100;
}
