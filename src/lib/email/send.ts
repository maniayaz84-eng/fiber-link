import { Resend } from "resend";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Language } from "@/types/database";
import { buildEmail } from "./templates";

type EmailKind = "proof_received" | "payment_approved" | "payment_rejected" | "request_created";

export async function sendTransactionalEmail(options: {
  kind: EmailKind;
  entityId: string;
  to: string;
  lang: Language;
  reason?: string;
  reference?: string;
}) {
  const parsed = z.string().email().safeParse(options.to);
  if (!parsed.success) {
    return { sent: false, preview: false, error: "invalid_recipient" };
  }

  const supabase = await createClient();
  const { data: claimed } = await supabase.rpc("record_notification", {
    p_email_type: options.kind,
    p_entity_id: options.entityId,
    p_recipient_email: parsed.data,
    p_status: process.env.RESEND_API_KEY ? "sent" : "preview",
    p_error_message: null,
  });

  if (claimed === false) {
    return { sent: false, preview: false, duplicate: true };
  }

  const template = buildEmail(options.kind, options.lang, {
    reason: options.reason,
    reference: options.reference,
  });
  const from = process.env.EMAIL_FROM || "Fiber Link <noreply@localhost>";

  if (!process.env.RESEND_API_KEY) {
    console.info("[EMAIL PREVIEW — not sent]", {
      kind: options.kind,
      to: parsed.data,
      subject: template.subject,
    });
    return { sent: false, preview: true };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from,
      to: parsed.data,
      subject: template.subject,
      html: template.html,
    });
    if (result.error) {
      await supabase.from("notification_logs").update({ status: "failed", error_message: result.error.message }).eq("email_type", options.kind).eq("entity_id", options.entityId);
      console.error("Email delivery failed");
      return { sent: false, preview: false, error: "provider_error" };
    }
    return { sent: true, preview: false };
  } catch {
    await supabase.from("notification_logs").update({ status: "failed", error_message: "provider_unavailable" }).eq("email_type", options.kind).eq("entity_id", options.entityId);
    console.error("Email provider unavailable");
    return { sent: false, preview: false, error: "provider_unavailable" };
  }
}
