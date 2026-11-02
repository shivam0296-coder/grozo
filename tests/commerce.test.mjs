import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBasket, DEFAULT_RULES, validateRules } from '../packages/domain/src/pricing.ts';
import { assertOrderTransition } from '../packages/domain/src/orders.ts';

const line = (price, changes = {}) => ({
  variantId: 'fixture-variant', quantity: 1, mrpPaise: price,
  sellingPricePaise: price, taxRateBps: 0, ...changes,
});
const error = code => err => err?.code === code;
const context = (changes = {}) => ({
  role: 'operator', actorId: 'fixture-staff', customerId: 'fixture-customer',
  paymentMethod: 'cod', paymentStatus: 'pending', ...changes,
});

test('199 minimum inclusive; one paise below rejected', () => {
  assert.equal(calculateBasket([line(19900)]).totalPaise, 21800);
  assert.throws(() => calculateBasket([line(19899)]), error('MINIMUM_ORDER'));
});
test('399 free-delivery boundary is exact', () => {
  assert.equal(calculateBasket([line(39899)]).deliveryChargePaise, 1900);
  assert.equal(calculateBasket([line(39900)]).deliveryChargePaise, 0);
});
test('5000 maximum inclusive; larger basket requires manual handling', () => {
  assert.equal(calculateBasket([line(500000)]).totalPaise, 500000);
  assert.throws(() => calculateBasket([line(500001)]), error('MANUAL_ORDER_REQUIRED'));
});
test('thresholds use selling subtotal before coupon', () => {
  const quote = calculateBasket([line(39900)], DEFAULT_RULES, { kind: 'fixed', value: 30000 });
  assert.equal(quote.totalPaise, 9900);
  assert.equal(quote.deliveryChargePaise, 0);
});
test('MRP markdown and coupon are separate discounts', () => {
  const quote = calculateBasket([line(25000, { mrpPaise: 30000 })], DEFAULT_RULES, { kind: 'fixed', value: 2000 });
  assert.equal(quote.productDiscountPaise, 5000);
  assert.equal(quote.couponDiscountPaise, 2000);
  assert.equal(quote.totalPaise, 24900);
});
test('percentage rounding and cap use exact integer paise', () => {
  assert.equal(calculateBasket([line(19905)], DEFAULT_RULES, { kind: 'percentage', value: 1000 }).couponDiscountPaise, 1991);
  assert.equal(calculateBasket([line(40000)], DEFAULT_RULES, { kind: 'percentage', value: 1000, maximumDiscountPaise: 1500 }).couponDiscountPaise, 1500);
});
test('coupon never produces negative merchandise amount', () => {
  const quote = calculateBasket([line(20000)], DEFAULT_RULES, { kind: 'fixed', value: 50000 });
  assert.equal(quote.totalPaise, 1900);
  assert.equal(quote.lines[0].payablePaise, 0);
});
test('tax included in price is extracted, not added twice', () => {
  const quote = calculateBasket([line(21000, { taxRateBps: 500 })], DEFAULT_RULES, undefined, 1800);
  assert.equal(quote.lines[0].taxPaise, 1000);
  assert.equal(quote.deliveryTaxPaise, 290);
  assert.equal(quote.totalPaise, 22900);
  assert.equal(quote.taxIncludedPaise, 1290);
});
test('discount is allocated exactly across mixed tax lines', () => {
  const quote = calculateBasket([
    line(10001, { variantId: 'a', taxRateBps: 500 }),
    line(10002, { variantId: 'b', taxRateBps: 1200 }),
    line(10003, { variantId: 'c', taxRateBps: 1800 }),
  ], DEFAULT_RULES, { kind: 'fixed', value: 100 });
  assert.equal(quote.lines.reduce((sum, item) => sum + item.couponDiscountPaise, 0), 100);
  assert.equal(quote.lines.reduce((sum, item) => sum + item.payablePaise, 0) + quote.deliveryChargePaise, quote.totalPaise);
});
test('reject empty, duplicate and oversized baskets', () => {
  assert.throws(() => calculateBasket([]), error('INVALID_BASKET'));
  assert.throws(() => calculateBasket([line(20000), line(20000)]), error('INVALID_BASKET'));
  assert.throws(() => calculateBasket(Array.from({ length: 101 }, (_, i) => line(20000, { variantId: String(i) }))), error('INVALID_BASKET'));
});
test('reject invalid IDs, quantities, prices, taxes and unsafe amounts', () => {
  for (const changes of [
    { variantId: '../bad' }, { quantity: 0 }, { quantity: 1.5 }, { quantity: 100 },
    { sellingPricePaise: -1 }, { sellingPricePaise: 30000 }, { mrpPaise: NaN },
    { taxRateBps: -1 }, { taxRateBps: 10001 }, { sellingPricePaise: Infinity },
    { mrpPaise: Number.MAX_SAFE_INTEGER + 1 },
  ]) assert.throws(() => calculateBasket([line(20000, changes)]));
});
test('reject invalid coupons', () => {
  for (const coupon of [
    { kind: 'unknown', value: 1 }, { kind: 'percentage', value: 10001 },
    { kind: 'fixed', value: -1 }, { kind: 'fixed', value: 1.5 },
    { kind: 'fixed', value: 1, maximumDiscountPaise: -1 },
  ]) assert.throws(() => calculateBasket([line(20000)], DEFAULT_RULES, coupon), error('INVALID_INPUT'));
});
test('business rules are validated and configurable', () => {
  assert.throws(() => validateRules({ ...DEFAULT_RULES, minimumOrderPaise: -1 }));
  assert.throws(() => validateRules({ ...DEFAULT_RULES, freeDeliveryThresholdPaise: 100 }));
  assert.throws(() => validateRules({ ...DEFAULT_RULES, maximumBasketPaise: 20000 }));
  assert.equal(calculateBasket([line(25000)], { ...DEFAULT_RULES, deliveryChargePaise: 500 }).totalPaise, 25500);
});
test('500 deterministic baskets preserve accounting invariants', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const lines = [line(10000 + seed, { variantId: 'a', taxRateBps: 500 }),
      line(10000 + seed * 2, { variantId: 'b', taxRateBps: 1800 })];
    const quote = calculateBasket(lines, DEFAULT_RULES, { kind: 'percentage', value: seed * 19 });
    assert.equal(quote.totalPaise, quote.subtotalPaise - quote.couponDiscountPaise + quote.deliveryChargePaise);
    assert.equal(quote.lines.reduce((s, item) => s + item.couponDiscountPaise, 0), quote.couponDiscountPaise);
    for (const item of quote.lines) {
      assert.ok(item.payablePaise >= 0);
      assert.equal(item.payablePaise, item.taxableValuePaise + item.taxPaise);
      for (const value of Object.values(item)) if (typeof value === 'number') assert.ok(Number.isSafeInteger(value));
    }
  }
});
test('staff confirms COD; unpaid online order cannot be fulfilled', () => {
  assert.doesNotThrow(() => assertOrderTransition('placed', 'confirmed', context()));
  assert.throws(() => assertOrderTransition('placed', 'confirmed', context({ paymentMethod: 'online' })), error('PAYMENT_REQUIRED'));
  assert.doesNotThrow(() => assertOrderTransition('placed', 'confirmed', context({ paymentMethod: 'online', paymentStatus: 'verified' })));
});
test('customer can cancel only own placed order', () => {
  const owner = context({ role: 'customer', actorId: 'fixture-customer' });
  assert.doesNotThrow(() => assertOrderTransition('placed', 'cancelled', owner));
  assert.throws(() => assertOrderTransition('confirmed', 'cancelled', owner), error('FORBIDDEN'));
  assert.throws(() => assertOrderTransition('placed', 'cancelled', { ...owner, actorId: 'another-customer' }), error('FORBIDDEN'));
});
test('dispatch requires assigned rider and only assigned rider acts', () => {
  assert.throws(() => assertOrderTransition('packed', 'out_for_delivery', context()), error('RIDER_REQUIRED'));
  const rider = context({ role: 'rider', actorId: 'rider-a', assignedRiderId: 'rider-a' });
  assert.doesNotThrow(() => assertOrderTransition('packed', 'out_for_delivery', rider));
  assert.throws(() => assertOrderTransition('packed', 'out_for_delivery', { ...rider, actorId: 'rider-b' }), error('FORBIDDEN'));
  assert.throws(() => assertOrderTransition('placed', 'confirmed', rider), error('FORBIDDEN'));
});
test('COD completion requires recorded collection', () => {
  const rider = context({ role: 'rider', actorId: 'rider-a', assignedRiderId: 'rider-a' });
  assert.throws(() => assertOrderTransition('out_for_delivery', 'delivered', rider), error('PAYMENT_REQUIRED'));
  assert.doesNotThrow(() => assertOrderTransition('out_for_delivery', 'delivered', { ...rider, paymentStatus: 'collected' }));
});
test('no skipped, reversed or terminal transitions, even for admin', () => {
  for (const [from, to] of [['placed', 'delivered'], ['packed', 'confirmed'],
    ['delivered', 'cancelled'], ['cancelled', 'confirmed'], ['out_for_delivery', 'cancelled']])
    assert.throws(() => assertOrderTransition(from, to, context({ role: 'admin' })), error('INVALID_TRANSITION'));
});
test('unknown role/status and missing identity fail closed', () => {
  assert.throws(() => assertOrderTransition('toString', 'confirmed', context()), error('INVALID_TRANSITION'));
  assert.throws(() => assertOrderTransition('placed', 'confirmed', context({ role: 'unknown' })), error('FORBIDDEN'));
  assert.throws(() => assertOrderTransition('placed', 'confirmed', context({ actorId: '' })), error('FORBIDDEN'));
});
