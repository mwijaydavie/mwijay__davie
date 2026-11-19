function shillings(x) {
  if (!Number.isSafeInteger(x) || x < 0) throw new RangeError('Use nonnegative whole shillings');
  return x;
}

// Example pricing rule: the threshold applies to the merchandise subtotal, not delivery.
export function checkout({basket, deliveryFee, freeAt}, addOn = 0) {
  const subtotal = shillings(shillings(basket) + shillings(addOn));
  const threshold = shillings(freeAt);
  const fee = shillings(deliveryFee);
  const qualifies = subtotal >= threshold;
  const delivery = qualifies ? 0 : fee;
  return {subtotal, delivery, total: shillings(subtotal + delivery), qualifies, remaining: Math.max(0, threshold - subtotal)};
}

export function compareCart(example) {
  const before = checkout(example);
  const after = checkout(example, example.addOn);
  return {before, after, delta: after.total - before.total, deliverySaved: before.delivery - after.delivery};
}

export const amount = n => n.toLocaleString('en-GB');
