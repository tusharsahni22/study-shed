import { remainingDays, subscriptionStatus } from './subscription.js';

/**
 * Attach computed subscription fields to a plain student object.
 * Works on lean() results or `.toObject()` output.
 */
export function decorateStudent(obj, leadDays = 7) {
  if (!obj) return obj;
  return {
    ...obj,
    remainingDays: remainingDays(obj.subscriptionEnd),
    subscriptionStatus: subscriptionStatus(obj.subscriptionEnd, leadDays),
  };
}
