import { CommerceError } from './pricing.ts';

export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type ActorRole = 'customer' | 'operator' | 'rider' | 'admin';
export type TransitionContext = {
  role: ActorRole;
  actorId: string;
  customerId: string;
  assignedRiderId?: string;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'verified' | 'failed' | 'collected';
};
const allowed: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'], confirmed: ['packed', 'cancelled'],
  packed: ['out_for_delivery', 'cancelled'], out_for_delivery: ['delivered'],
  delivered: [], cancelled: [],
};
/** Pure authorization rule, not authentication. Apply while holding a DB row lock. */
export function assertOrderTransition(from: OrderStatus, to: OrderStatus, context: TransitionContext): void {
  if (!Object.hasOwn(allowed, from) || !allowed[from].includes(to))
    throw new CommerceError('INVALID_TRANSITION', 'Order status transition is not allowed');
  if (!context.actorId || !context.customerId)
    throw new CommerceError('FORBIDDEN', 'Verified actor and customer identities are required');
  const staff = context.role === 'admin' || context.role === 'operator';
  const ownCancellation = context.role === 'customer' && context.actorId === context.customerId
    && from === 'placed' && to === 'cancelled';
  const assignedRider = context.role === 'rider' && context.actorId === context.assignedRiderId;
  const riderAction = assignedRider && ((from === 'packed' && to === 'out_for_delivery')
    || (from === 'out_for_delivery' && to === 'delivered'));
  if (!staff && !ownCancellation && !riderAction)
    throw new CommerceError('FORBIDDEN', 'Actor cannot change this order');
  if ((to === 'out_for_delivery' || to === 'delivered') && !context.assignedRiderId)
    throw new CommerceError('RIDER_REQUIRED', 'Assign a rider before dispatch');
  if (to !== 'cancelled' && context.paymentMethod !== 'online' && context.paymentMethod !== 'cod')
    throw new CommerceError('INVALID_INPUT', 'Unsupported payment method');
  if (to !== 'cancelled' && context.paymentMethod === 'online' && context.paymentStatus !== 'verified')
    throw new CommerceError('PAYMENT_REQUIRED', 'Online payment must be verified before fulfilment');
  if (to === 'delivered' && context.paymentMethod === 'cod' && context.paymentStatus !== 'collected')
    throw new CommerceError('PAYMENT_REQUIRED', 'Record COD collection before delivery completion');
}
