import * as React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Attachment {
  name: string;
  url: string;
  size?: number;
}

interface Props {
  ticketId: string;
  category: string;
  categoryLabel: string;
  subject: string;
  siteName: string;
  siteSubdomain: string;
  customerEmail: string;
  customerName?: string;
  body: string;
  attachments?: Attachment[];
  paidBadge?: "paid" | "included";
  adminUrl?: string;
}

function FolliaTicketStaff({
  ticketId,
  categoryLabel,
  subject,
  siteName,
  siteSubdomain,
  customerEmail,
  customerName,
  body,
  attachments = [],
  paidBadge = "included",
  adminUrl,
}: Props) {
  const badgeColor = paidBadge === "paid" ? "#0d7a5f" : "#6d28d9";
  const badgeText = paidBadge === "paid" ? "Pagato €50 + IVA" : "Incluso nel piano";
  return (
    <Html>
      <Head />
      <Preview>[{categoryLabel}] {siteName} — nuovo ticket di assistenza</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Inter, system-ui, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
          <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8b8898", margin: 0 }}>
            Foll.IA · Nuovo ticket
          </Text>
          <Heading style={{ fontSize: 22, color: "#1f1d2b", margin: "8px 0 16px" }}>
            [{categoryLabel}] {siteName}
          </Heading>

          <Section style={{ backgroundColor: "#f7f5ef", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <Text style={{ margin: 0, fontSize: 13, color: "#4b4858" }}>
              <strong>Oggetto:</strong> {subject}
            </Text>
            <Text style={{ margin: "6px 0 0", fontSize: 13, color: "#4b4858" }}>
              <strong>Categoria:</strong> {categoryLabel}
            </Text>
            <Text style={{ margin: "6px 0 0", fontSize: 13, color: "#4b4858" }}>
              <strong>Sito:</strong> {siteName} ({siteSubdomain}.deskinc.app)
            </Text>
            <Text style={{ margin: "6px 0 0", fontSize: 13, color: "#4b4858" }}>
              <strong>Cliente:</strong> {customerName ? `${customerName} — ` : ""}
              <Link href={`mailto:${customerEmail}`} style={{ color: "#6d28d9" }}>{customerEmail}</Link>
            </Text>
            <Text style={{ margin: "6px 0 0", fontSize: 13, color: "#4b4858" }}>
              <strong>Ticket ID:</strong> {ticketId}
            </Text>
            <Text style={{ margin: "10px 0 0" }}>
              <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, backgroundColor: badgeColor, color: "#fff", fontSize: 11, fontWeight: 600 }}>
                {badgeText}
              </span>
            </Text>
          </Section>

          <Heading as="h2" style={{ fontSize: 14, color: "#1f1d2b", margin: "0 0 8px" }}>Descrizione</Heading>
          <Text style={{ color: "#1f1d2b", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
            {body}
          </Text>

          {attachments.length > 0 && (
            <>
              <Heading as="h2" style={{ fontSize: 14, color: "#1f1d2b", margin: "24px 0 8px" }}>
                Allegati ({attachments.length})
              </Heading>
              {attachments.map((a, idx) => (
                <Text key={idx} style={{ margin: "4px 0", fontSize: 13 }}>
                  <Link href={a.url} style={{ color: "#6d28d9" }}>
                    {a.name}{a.size ? ` (${Math.round(a.size / 1024)} KB)` : ""}
                  </Link>
                </Text>
              ))}
              <Text style={{ fontSize: 11, color: "#8b8898", margin: "6px 0 0" }}>
                I link agli allegati sono validi 7 giorni.
              </Text>
            </>
          )}

          <Hr style={{ borderColor: "#eceae3", margin: "28px 0" }} />

          <Section style={{ textAlign: "center" }}>
            <Button href={`mailto:${customerEmail}?subject=Re: [${categoryLabel}] ${siteName}`} style={{ backgroundColor: "#6d28d9", color: "#fff", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
              Rispondi al cliente
            </Button>
            {adminUrl && (
              <Text style={{ margin: "12px 0 0", fontSize: 12 }}>
                <Link href={adminUrl} style={{ color: "#6d28d9" }}>Apri il sito nel pannello admin →</Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const template: TemplateEntry = {
  component: FolliaTicketStaff,
  subject: (data) => `[${data.categoryLabel}] ${data.siteName} — Ticket assistenza`,
  displayName: "Foll.IA — Ticket staff",
  previewData: {
    ticketId: "abc-123",
    category: "domain",
    categoryLabel: "Dominio",
    subject: "Dominio — Bar da Mario",
    siteName: "Bar da Mario",
    siteSubdomain: "bardamario",
    customerEmail: "mario@example.com",
    customerName: "Mario Rossi",
    body: "Vorrei collegare il mio dominio personalizzato bardamario.it",
    attachments: [],
    paidBadge: "included",
    adminUrl: "https://deskindustries.com/account/sites/abc",
  },
};
