import * as React from "react";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";
import { registrationSchema, quoteRequestSchema, resolveServices } from "@/lib/lead-intake";

const SITE_NAME = "Desk Industries";
const SENDER_DOMAIN = "notify.deskindustries.com";
const FROM_DOMAIN = "deskindustries.com";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  business: z.string().trim().max(120).optional().or(z.literal("")),
  sector: z.string().min(1).max(60),
  selectedServices: z.array(z.string().max(160)).min(1).max(30),
  serviceCodes: z.array(z.string().max(60)).max(30).optional(),
  expectedGoals: z.array(z.string()).max(10),
  lookingFor: z.string().trim().min(5).max(500),
  hasWebsite: z.string().max(40).optional(),
  websiteUrl: z.string().trim().max(255).optional().or(z.literal("")),
  hasSocial: z.string().max(40).optional(),
  socialLinks: z.string().trim().max(500).optional().or(z.literal("")),
  webNeeds: z.array(z.string()).max(20).optional(),
  socialNeeds: z.array(z.string()).max(20).optional(),
  coachingFocus: z.string().trim().max(500).optional().or(z.literal("")),
  companyResources: z.string().trim().max(500).optional().or(z.literal("")),
  contactPreference: z.enum(["email", "phone", "whatsapp"]).optional(),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  createAccount: z.boolean().optional(),
  password: z.string().min(8).max(72).optional(),
  fullName: z.string().trim().max(120).optional(),
});

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function enqueueTemplate(
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
  const effectiveRecipient = template.to || recipientEmail;
  if (!effectiveRecipient) return { ok: false as const, error: "No recipient" };

  const normalized = effectiveRecipient.toLowerCase();
  const messageId = crypto.randomUUID();

  // suppression check
  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();
  if (suppressed) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "suppressed",
    });
    return { ok: true as const, suppressed: true };
  }

  // unsubscribe token (one per email)
  const { data: existingToken } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalized)
    .maybeSingle();
  let unsubscribeToken: string;
  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    unsubscribeToken = generateToken();
    await supabase
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: unsubscribeToken, email: normalized },
        { onConflict: "email", ignoreDuplicates: true },
      );
    const { data: stored } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalized)
      .maybeSingle();
    unsubscribeToken = stored?.token ?? unsubscribeToken;
  } else {
    return { ok: true as const, suppressed: true };
  }

  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const plainText = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: "pending",
  });

  const { error: enqueueError } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text: plainText,
      purpose: "transactional",
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (enqueueError) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return { ok: false as const, error: enqueueError.message };
  }
  return { ok: true as const };
}

export const Route = createFileRoute("/api/public/lead-submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        if (body && typeof body === "object" && "action" in body) {
          const db = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
          const bridge = await import("@/lib/consus.server");
          if (body.action === "register") {
            const registration = registrationSchema.safeParse(body);
            if (!registration.success) return Response.json({ error: "Controlla i dati del contatto." }, { status: 400 });
            const { action: _action, continuation: previous, ...contact } = registration.data;
            let leadId: string;
            try {
              if (previous) {
                leadId = await bridge.verifyContinuation(previous);
                const { error } = await db.from("lead_requests").update(contact).eq("id", leadId);
                if (error) throw error;
              } else {
                const { data: row, error } = await db.from("lead_requests").insert({ ...contact, looking_for: "", selected_services: [], expected_goals: [] }).select("id").single();
                if (error || !row) throw new Error("Lead save failed");
                leadId = row.id;
              }
              const continuation = await bridge.issueContinuation(leadId);
              try {
                await bridge.registerConsusLead({ leadId, ...contact });
              } catch (error) {
                console.error("CONSUS register failed", error instanceof Error ? error.message : "unknown");
                return Response.json({ error: "Dati salvati, ma il collegamento con CONSUS non è ancora pronto. Riprova tra poco.", continuation }, { status: 503 });
              }
              return Response.json({ success: true, continuation });
            } catch {
              return Response.json({ error: "Impossibile salvare i dati. Riprova." }, { status: 400 });
            }
          }
          if (body.action === "quote") {
            const parsedQuote = quoteRequestSchema.safeParse(body);
            if (!parsedQuote.success) return Response.json({ error: "Seleziona almeno un servizio e descrivi il tuo obiettivo." }, { status: 400 });
            try {
              const leadId = await bridge.verifyContinuation(parsedQuote.data.continuation);
              const { data: contact, error } = await db.from("lead_requests").select("name,email,phone,business,sector").eq("id", leadId).single();
              if (error || !contact) return Response.json({ error: "Riparti dai dati di contatto." }, { status: 400 });
              const picked = resolveServices(parsedQuote.data.serviceCodes, await bridge.fetchConsusCatalog());
              const services = picked.map((item) => item.name);
              const lookingFor = parsedQuote.data.lookingFor;
              await bridge.createConsusQuote({ leadId, ...contact, phone: contact.phone ?? undefined, business: contact.business ?? undefined, serviceCodes: picked.map((item) => item.code), serviceNames: services, lookingFor });
              const { error: updateError } = await db.from("lead_requests").update({ selected_services: services, looking_for: lookingFor }).eq("id", leadId);
              if (updateError) throw updateError;
              const templateData = { ...contact, selectedServices: services, lookingFor, expectedGoals: [], accountCreated: false };
              const emailResults = await Promise.allSettled([
                enqueueTemplate(db, "lead-request-admin", "master@deskindustries.com", templateData, `lead-admin-${leadId}`),
                enqueueTemplate(db, "lead-request-confirmation", contact.email, templateData, `lead-confirm-${leadId}`),
              ]);
              if (emailResults.some((result) => result.status === "rejected" || !result.value.ok)) console.error("Two-step intake email enqueue failed");
              return Response.json({ success: true });
            } catch (error) {
              console.error("CONSUS quote failed", error instanceof Error ? error.message : "unknown");
              return Response.json({ error: "Il preventivo non è stato completato. Riprova senza reinserire i dati." }, { status: 503 });
            }
          }
          return Response.json({ error: "Richiesta non valida." }, { status: 400 });
        }

        const parsed = leadSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 },
          );
        }
        const data = parsed.data;

        const supabase: any = createClient(supabaseUrl, supabaseServiceKey);

        // Optional: create user account
        let userId: string | null = null;
        let accountCreated = false;
        if (data.createAccount && data.password) {
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: false,
            user_metadata: { full_name: data.fullName ?? data.name },
          });
          if (createErr) {
            // If user exists, that's OK — we still proceed with the lead
            const msg = createErr.message?.toLowerCase() ?? "";
            if (!msg.includes("already") && !msg.includes("exist") && !msg.includes("registered")) {
              console.error("Failed to create user", createErr);
              return Response.json(
                { error: "Impossibile creare l'account: " + createErr.message },
                { status: 400 },
              );
            }
          } else {
            userId = created?.user?.id ?? null;
            accountCreated = true;
          }
        }

        // Insert lead
        const { data: leadRow, error: leadErr } = await supabase
          .from("lead_requests")
          .insert({
            user_id: userId,
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            business: data.business || null,
            sector: data.sector,
            selected_services: data.selectedServices,
            expected_goals: data.expectedGoals,
            looking_for: data.lookingFor,
            has_website: data.hasWebsite || "not-specified",
            website_url: data.websiteUrl || null,
            has_social: data.hasSocial || "not-specified",
            social_links: data.socialLinks || null,
            web_needs: data.webNeeds ?? [],
            social_needs: data.socialNeeds ?? [],
            coaching_focus: data.coachingFocus || null,
            company_resources: data.companyResources || null,
            contact_preference: data.contactPreference ?? "email",
            message: data.message || null,
          })
          .select("id")
          .single();

        if (leadErr) {
          console.error("Failed to insert lead", leadErr);
          return Response.json({ error: "Errore nel salvataggio della richiesta" }, { status: 500 });
        }

        const leadId = leadRow.id;
        const templateData = {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          business: data.business || undefined,
          sector: data.sector,
          selectedServices: data.selectedServices,
          expectedGoals: data.expectedGoals,
          lookingFor: data.lookingFor,
          hasWebsite: data.hasWebsite,
          websiteUrl: data.websiteUrl || undefined,
          hasSocial: data.hasSocial,
          socialLinks: data.socialLinks || undefined,
          webNeeds: data.webNeeds ?? [],
          socialNeeds: data.socialNeeds ?? [],
          coachingFocus: data.coachingFocus || undefined,
          companyResources: data.companyResources || undefined,
          contactPreference: data.contactPreference ?? "email",
          message: data.message || undefined,
          accountCreated,
        };

        // Fire both emails (don't fail the request if email fails)
        const adminRes = await enqueueTemplate(
          supabase,
          "lead-request-admin",
          "master@deskindustries.com",
          templateData,
          `lead-admin-${leadId}`,
        );
        const confirmRes = await enqueueTemplate(
          supabase,
          "lead-request-confirmation",
          data.email,
          {
            name: data.name,
            selectedServices: data.selectedServices,
            accountCreated,
          },
          `lead-confirm-${leadId}`,
        );

        if (!adminRes.ok) console.error("Admin email enqueue failed", adminRes);
        if (!confirmRes.ok) console.error("Confirmation email enqueue failed", confirmRes);

        // Sync to CONSUS: client record + user + draft opportunity. Never blocks the lead.
        let consusSynced = false;
        try {
          const { pushLeadToConsus } = await import("@/lib/consus.server");
          await pushLeadToConsus({
            leadId,
            name: data.name,
            email: data.email,
            phone: data.phone || undefined,
            business: data.business || undefined,
            sector: data.sector,
            serviceCodes: data.serviceCodes ?? [],
            serviceNames: data.selectedServices,
            lookingFor: data.lookingFor,
          });
          consusSynced = true;
        } catch (e) {
          console.error("CONSUS sync failed", e instanceof Error ? e.message : e);
        }

        return Response.json({
          success: true,
          leadId,
          accountCreated,
          consusSynced,
          emailsQueued: { admin: adminRes.ok, confirmation: confirmRes.ok },
        });
      },
    },
  },
});
