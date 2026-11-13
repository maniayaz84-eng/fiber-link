import type { PaymentStatus, SubscriptionStatus } from "@/types/database";

export const SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["payment_submitted", "cancelled"],
  payment_submitted: ["under_review", "cancelled"],
  under_review: ["active", "rejected"],
  active: ["expired", "cancelled"],
  rejected: ["payment_submitted", "cancelled"],
  cancelled: [],
  expired: [],
};

export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  not_submitted: ["submitted"],
  submitted: ["under_review", "rejected"],
  under_review: ["approved", "rejected"],
  approved: [],
  rejected: ["submitted"],
};

export function canTransitionSubscription(from: SubscriptionStatus, to: SubscriptionStatus) {
  return SUBSCRIPTION_TRANSITIONS[from].includes(to);
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus) {
  return PAYMENT_TRANSITIONS[from].includes(to);
}

export function isInactiveSubscription(status: SubscriptionStatus) {
  return status !== "active";
}

export const CUSTOMER_WRITABLE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [];
