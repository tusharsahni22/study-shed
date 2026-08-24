/** Number of months covered by each subscription plan. */
export const PLAN_MONTHS = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  annual: 12,
};

export const PLAN_LABELS = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half-yearly',
  annual: 'Annual',
};

export function planToMonths(plan) {
  return PLAN_MONTHS[plan] ?? 1;
}

/** Return a new Date `months` after `date` (does not mutate input). */
export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** End date for a subscription starting at `startDate` on the given `plan`. */
export function computeEndDate(startDate, plan) {
  return addMonths(startDate, planToMonths(plan));
}

/**
 * Whole days remaining until `endDate` (inclusive of the end day).
 * Negative when the subscription has already expired.
 */
export function remainingDays(endDate, from = new Date()) {
  if (!endDate) return null;
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

/** Bucket a subscription into active / expiring / expired. */
export function subscriptionStatus(endDate, leadDays = 7) {
  const days = remainingDays(endDate);
  if (days === null) return 'unknown';
  if (days < 0) return 'expired';
  if (days <= leadDays) return 'expiring';
  return 'active';
}
