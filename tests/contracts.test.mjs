import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULT_RULES } from '../packages/domain/src/pricing.ts';

const root = new URL('../', import.meta.url);
const spec = JSON.parse(readFileSync(new URL('packages/contracts/openapi.json', root), 'utf8'));
const operations = Object.values(spec.paths).flatMap(path => Object.values(path));
function visit(value, fn) {
  if (!value || typeof value !== 'object') return;
  fn(value);
  for (const child of Object.values(value)) visit(child, fn);
}
test('all local contract references resolve; no hidden remote dependencies', () => {
  visit(spec, value => {
    if (value.$ref) {
      assert.ok(value.$ref.startsWith('#/'));
      const resolved = value.$ref.slice(2).split('/').reduce((at, key) => at?.[key], spec);
      assert.ok(resolved, value.$ref);
    }
  });
});
test('all 30 HTTP operations truthfully declare pending implementation', () => {
  assert.equal(operations.length, 30);
  assert.equal(new Set(operations.map(op => op.operationId)).size, 30);
  for (const op of operations) {
    assert.equal(op['x-implementation-status'], 'NOT_IMPLEMENTED');
    assert.ok(Array.isArray(op['x-allowed-roles']));
    assert.ok(Array.isArray(op.security));
  }
});
test('checkout contract accepts identity/quantity, never trusted client money', () => {
  const line = spec.components.schemas.LineInput;
  assert.equal(line.additionalProperties, false);
  assert.deepEqual(Object.keys(line.properties).sort(), ['quantity','variantId']);
  assert.equal(spec.components.schemas.QuoteRequest.additionalProperties, false);
  assert.deepEqual(Object.keys(spec.components.schemas.OrderCreate.properties).sort(), ['paymentMethod','quoteId']);
});
test('money-moving writes require idempotency and admin writes declare roles', () => {
  for (const [path, method] of [
    ['/orders','post'], ['/orders/{orderId}/payment-session','post'],
    ['/admin/inventory/adjustments','post'], ['/admin/refunds','post'],
  ]) {
    assert.ok(spec.paths[path][method].parameters.some(p => p.name === 'Idempotency-Key' && p.required));
    assert.notDeepEqual(spec.paths[path][method].security, []);
  }
  for (const [path, methods] of Object.entries(spec.paths)) if (path.startsWith('/admin/'))
    for (const op of Object.values(methods)) {
      assert.ok(op['x-allowed-roles'].includes('admin'));
      assert.ok(!op['x-allowed-roles'].includes('customer'));
    }
});
test('signed webhook and rider-location contracts require boundary information', () => {
  const webhook = spec.paths['/payments/webhooks/razorpay'].post;
  assert.ok(webhook.parameters.some(p => p.name === 'X-Razorpay-Signature' && p.required));
  const location = spec.components.schemas.LocationWrite;
  assert.equal(location.additionalProperties, false);
  for (const field of ['recordedAt','latitude','longitude','accuracyMeters']) assert.ok(location.required.includes(field));
  assert.deepEqual(spec.paths['/rider/assignments/{assignmentId}/locations'].post['x-allowed-roles'], ['rider']);
});
test('reference seed and domain defaults agree; integrations default to disabled', () => {
  const seed = readFileSync(new URL('database/seeds/0001_reference.sql', root), 'utf8');
  assert.ok(seed.includes(`VALUES(true,${DEFAULT_RULES.minimumOrderPaise},${DEFAULT_RULES.freeDeliveryThresholdPaise},${DEFAULT_RULES.deliveryChargePaise},${DEFAULT_RULES.maximumBasketPaise},NULL,false)`));
  const env = readFileSync(new URL('.env.example', root), 'utf8');
  for (const entry of ['MAPS_ENABLED=false','PAYMENTS_PROVIDER=disabled','OTP_PROVIDER=disabled','FCM_ENABLED=false','AI_PROVIDER=disabled']) assert.ok(env.includes(entry));
});
