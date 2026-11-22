import { sendTemplateEmail } from "@/lib/email-templates/send-email";
import { TEMPLATES } from "@/lib/email-templates/registry";

// Sends a registered template through Lovable's managed email delivery and
// records the outcome in email_send_log. Name kept for existing callers.
export async function enqueueTemplate(
  supabase: any,
  templateName: string,
  recipientEmail: string,
  templateData: Record<string, any>,
  idempotencyKey: string,
) {
  const template = TEMPLATES[templateName];
  if (!template) {
    console.error("Template not found", { templateName });
    return { ok: false as const, error: `Template ${templateName} not found` };
  }
  const recipient = template.to || recipientEmail;
  if (!recipient) return { ok: false as const, error: "No recipient" };

  const log = async (status: "sent" | "suppressed" | "failed", error_message?: string) => {
    const { error } = await supabase.from("email_send_log").insert({
      message_id: null,
      template_name: templateName,
      recipient_email: recipient,
      status,
      ...(error_message ? { error_message } : {}),
    });
    if (error) console.error("email_send_log insert failed", { code: error.code, message: error.message });
  };

  try {
    const res = await sendTemplateEmail(templateName, recipient, { templateData, idempotencyKey });
    if (res.sent) {
      await log("sent");
      return { ok: true as const };
    }
    await log("suppressed");
    return { ok: true as const, suppressed: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await log("failed", msg);
    return { ok: false as const, error: msg };
  }
}
