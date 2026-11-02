import { calculateBasket } from '../packages/domain/src/pricing.ts';

// FICTIONAL INPUTS: no actual catalogue, tax classification or live order.
const result = calculateBasket([
  { variantId: 'fixture-staple-1', quantity: 2, mrpPaise: 12000, sellingPricePaise: 10000, taxRateBps: 0 },
  { variantId: 'fixture-staple-2', quantity: 1, mrpPaise: 25000, sellingPricePaise: 22000, taxRateBps: 0 },
], undefined, { kind: 'percentage', value: 1000, maximumDiscountPaise: 5000 });
console.log('FICTIONAL BASKET CALCULATION — does not create an order');
console.log(JSON.stringify(result, null, 2));
