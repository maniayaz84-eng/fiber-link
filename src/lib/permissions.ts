import type { UserRole } from "@/types/database";

export function canAccessAdmin(role: UserRole | null | undefined) {
  return role === "admin";
}

export function canAccessCustomerDashboard(role: UserRole | null | undefined) {
  return role === "customer" || role === "admin";
}

export function canViewSubscription(role: UserRole, ownerId: string, viewerId: string) {
  if (role === "admin") return true;
  return ownerId === viewerId;
}

export function canViewPaymentProof(role: UserRole, ownerId: string, viewerId: string) {
  return canViewSubscription(role, ownerId, viewerId);
}

export function canApprovePayments(role: UserRole | null | undefined) {
  return role === "admin";
}

export function canSelfAssignAdmin() {
  return false;
}

export function isPrivilegedStatusField(field: string) {
  return [
    "status",
    "approved_at",
    "approved_by",
    "reviewed_by",
    "reviewed_at",
    "role",
  ].includes(field);
}
