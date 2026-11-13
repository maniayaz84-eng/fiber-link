import type { Language } from "@/types/database";
import { getDictionary } from "@/lib/i18n";

type EmailKind = "proof_received" | "payment_approved" | "payment_rejected" | "request_created";

export function buildEmail(kind: EmailKind, lang: Language, extra?: { reason?: string; reference?: string }) {
  const t = getDictionary(lang);
  const other = getDictionary(lang === "en" ? "roman_ur" : "en");

  const map = {
    proof_received: { subject: t.emails.proofSubject, body: t.emails.proofBody },
    payment_approved: { subject: t.emails.approvedSubject, body: t.emails.approvedBody },
    payment_rejected: { subject: t.emails.rejectedSubject, body: t.emails.rejectedBody },
    request_created: { subject: t.emails.createdSubject, body: t.emails.createdBody },
  } as const;

  const copy = map[kind];
  const reason = extra?.reason ? `<p>${escapeHtml(extra.reason)}</p>` : "";
  const reference = extra?.reference ? `<p><strong>${escapeHtml(extra.reference)}</strong></p>` : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <h1 style="color:#1d4ed8">Fiber Link</h1>
      <p>${escapeHtml(copy.body)}</p>
      ${reference}
      ${reason}
      <hr />
      <p style="color:#475569;font-size:13px">${escapeHtml(other === t ? "" : (kind === "proof_received" ? other.emails.proofBody : kind === "payment_approved" ? other.emails.approvedBody : kind === "payment_rejected" ? other.emails.rejectedBody : other.emails.createdBody))}</p>
      <p style="font-size:12px;color:#64748b">Active in Fiber Link means the request was approved in this app, not that the ISP line was provisioned.</p>
    </div>
  `;

  return { subject: copy.subject, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
