/** Pure business rules. Production callers must supply authoritative DB records. */
export type BasketRules = {
  minimumOrderPaise: number;
  freeDeliveryThresholdPaise: number;
  deliveryChargePaise: number;
  maximumBasketPaise: number;
};
export type PriceLine = {
  variantId: string;
  quantity: number;
  mrpPaise: number;
  sellingPricePaise: number;
  /** Included in the selling price; 500 = 5%. */
  taxRateBps: number;
};
export type Coupon = { kind: 'fixed' | 'percentage'; value: number; maximumDiscountPaise?: number };
export const DEFAULT_RULES: Readonly<BasketRules> = Object.freeze({
  minimumOrderPaise: 19_900,
  freeDeliveryThresholdPaise: 39_900,
  deliveryChargePaise: 1_900,
  maximumBasketPaise: 500_000,
});
const LIMIT = 100_000_000;
export class CommerceError extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.name = 'CommerceError'; this.code = code; }
}
function integer(value: number, name: string, min = 0, max = LIMIT): number {
  if (!Number.isSafeInteger(value) || value < min || value > max)
    throw new CommerceError('INVALID_INPUT', `${name} must be an integer from ${min} to ${max}`);
  return value;
}
function roundedRatio(amount: number, numerator: number, denominator: number): number {
  return Number((BigInt(amount) * BigInt(numerator) + BigInt(denominator) / 2n) / BigInt(denominator));
}
export function validateRules(rules: BasketRules): void {
  integer(rules.minimumOrderPaise, 'minimum order', 1);
  integer(rules.freeDeliveryThresholdPaise, 'free delivery threshold', rules.minimumOrderPaise);
  integer(rules.deliveryChargePaise, 'delivery charge');
  integer(rules.maximumBasketPaise, 'maximum basket', rules.freeDeliveryThresholdPaise);
}
/**
 * Thresholds use the pre-coupon selling subtotal, excluding delivery.
 * All prices/fees include configured taxes. Coupon eligibility is checked by the
 * future DB service; this function only calculates an already-authorized discount.
 * It does not check inventory, serviceability, identity or persist orders.
 */
export function calculateBasket(
  lines: readonly PriceLine[],
  rules: BasketRules = DEFAULT_RULES,
  coupon?: Coupon,
  deliveryTaxRateBps = 0,
) {
  validateRules(rules);
  integer(deliveryTaxRateBps, 'delivery tax rate', 0, 10000);
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 100)
    throw new CommerceError('INVALID_BASKET', 'Basket must contain 1 to 100 distinct variants');
  const ids = new Set<string>();
  let mrpTotalPaise = 0;
  let subtotalPaise = 0;
  const amounts = lines.map(line => {
    if (typeof line.variantId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(line.variantId) || ids.has(line.variantId))
      throw new CommerceError('INVALID_BASKET', 'Variant IDs must be valid and distinct');
    ids.add(line.variantId);
    integer(line.quantity, 'quantity', 1, 99);
    integer(line.mrpPaise, 'MRP', 1);
    integer(line.sellingPricePaise, 'selling price', 1, line.mrpPaise);
    integer(line.taxRateBps, 'tax rate', 0, 10000);
    const amount = integer(line.sellingPricePaise * line.quantity, 'line total', 1);
    mrpTotalPaise = integer(mrpTotalPaise + line.mrpPaise * line.quantity, 'MRP total');
    subtotalPaise = integer(subtotalPaise + amount, 'subtotal');
    return amount;
  });
  if (subtotalPaise < rules.minimumOrderPaise)
    throw new CommerceError('MINIMUM_ORDER', 'Basket is below the minimum online order');
  if (subtotalPaise > rules.maximumBasketPaise)
    throw new CommerceError('MANUAL_ORDER_REQUIRED', 'Contact support for a manual or B2B order');
  let couponDiscountPaise = 0;
  if (coupon) {
    if (coupon.kind !== 'fixed' && coupon.kind !== 'percentage')
      throw new CommerceError('INVALID_INPUT', 'Unsupported coupon kind');
    integer(coupon.value, 'coupon value', 1, coupon.kind === 'percentage' ? 10000 : LIMIT);
    couponDiscountPaise = coupon.kind === 'fixed'
      ? coupon.value : roundedRatio(subtotalPaise, coupon.value, 10000);
    if (coupon.maximumDiscountPaise !== undefined)
      couponDiscountPaise = Math.min(couponDiscountPaise, integer(coupon.maximumDiscountPaise, 'coupon cap'));
    couponDiscountPaise = Math.min(subtotalPaise, couponDiscountPaise);
  }
  // Largest remainder allocation preserves the exact discount across mixed-tax lines.
  const weights = amounts.map(amount => BigInt(amount) * BigInt(couponDiscountPaise));
  const discounts = weights.map(weight => Number(weight / BigInt(subtotalPaise)));
  const remaining = couponDiscountPaise - discounts.reduce((a, b) => a + b, 0);
  const ranked = weights.map((weight, index) => ({ index, remainder: weight % BigInt(subtotalPaise) }))
    .sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
  for (let i = 0; i < remaining; i++) discounts[ranked[i].index]++;
  const resultLines = lines.map((line, i) => {
    const payablePaise = amounts[i] - discounts[i];
    const taxPaise = roundedRatio(payablePaise, line.taxRateBps, 10000 + line.taxRateBps);
    return { variantId: line.variantId, quantity: line.quantity, subtotalPaise: amounts[i],
      couponDiscountPaise: discounts[i], payablePaise,
      taxableValuePaise: payablePaise - taxPaise, taxPaise };
  });
  const deliveryChargePaise = subtotalPaise >= rules.freeDeliveryThresholdPaise ? 0 : rules.deliveryChargePaise;
  const deliveryTaxPaise = roundedRatio(deliveryChargePaise, deliveryTaxRateBps, 10000 + deliveryTaxRateBps);
  const taxIncludedPaise = resultLines.reduce((sum, line) => sum + line.taxPaise, deliveryTaxPaise);
  return {
    currency: 'INR' as const, mrpTotalPaise, subtotalPaise,
    productDiscountPaise: mrpTotalPaise - subtotalPaise,
    couponDiscountPaise, deliveryChargePaise, deliveryTaxPaise, taxIncludedPaise,
    totalPaise: integer(subtotalPaise - couponDiscountPaise + deliveryChargePaise, 'payable'),
    lines: resultLines,
  };
}
