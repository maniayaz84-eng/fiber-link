import { z } from "zod";
import { isValidPakistaniPhone, normalizePakistaniPhone } from "./phone";

export const emailSchema = z.string().trim().email();

export const phoneSchema = z
  .string()
  .trim()
  .min(10)
  .transform(normalizePakistaniPhone)
  .refine(isValidPakistaniPhone, "invalid_phone");

export const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8).max(72),
  language: z.enum(["en", "roman_ur"]).default("en"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  language: z.enum(["en", "roman_ur"]),
});

export const subscriptionRequestSchema = z.object({
  packageId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: phoneSchema,
  installationAddress: z.string().trim().min(8).max(300),
  city: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const paymentProofMetaSchema = z.object({
  subscriptionId: z.string().uuid(),
  amountPkr: z.coerce.number().int().nonnegative(),
  paymentMethod: z.string().trim().min(2).max(80),
  transactionReference: z.string().trim().max(80).optional().or(z.literal("")),
});

export const packageSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(500),
  download_speed_mbps: z.coerce.number().int().nonnegative(),
  upload_speed_mbps: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  monthly_price_pkr: z.coerce.number().int().nonnegative(),
  installation_fee_pkr: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  data_limit_label: z.string().trim().min(1).max(40),
  features: z.string().trim(),
  is_popular: z.coerce.boolean().optional(),
  is_active: z.coerce.boolean().optional(),
  display_order: z.coerce.number().int(),
});

export const adminDecisionSchema = z.object({
  submissionId: z.string().uuid(),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

export const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

export function isAllowedProofFile(type: string, size: number) {
  return (ALLOWED_PROOF_TYPES as readonly string[]).includes(type) && size > 0 && size <= MAX_PROOF_BYTES;
}
