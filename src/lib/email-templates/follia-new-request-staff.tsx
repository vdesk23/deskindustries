import * as React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  businessName: string;
  businessType: string;
  subdomain: string;
  email: string;
  city?: string;
  address?: string;
  phone?: string;
  description?: string;
  services?: string;
  openingHours?: string;
  primaryColor?: string;
  secondaryColor?: string;
  notes?: string;
  prompt: string;
  adminUrl: string;
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <Text style={{ margin: "0 0 6px", fontSize: 13, color: "#1f1d2b" }}>
      <strong style={{ color: "#6d28d9" }}>{label}:</strong> {value}
    </Text>
  );
}

function FolliaNewRequestStaff(props: Props) {
  const {
    businessName, businessType, subdomain, email, city, address, phone,
    description, services, openingHours, primaryColor, secondaryColor, notes,
    prompt, adminUrl,
  } = props;
  return (
    <Html>
      <Head />
      <Preview>Nuova richiesta Foll.IA: {businessName}</Preview>
      <Body style={{ backgroundColor: "#f5f3ee", fontFamily: "Inter, system-ui, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", maxWidth: 640, margin: "0 auto", borderRadius: 14, padding: 32 }}>
          <Heading style={{ fontSize: 22, color: "#1f1d2b", margin: "0 0 4px" }}>
            Nuova richiesta Foll.IA
          </Heading>
          <Text style={{ color: "#8b8898", fontSize: 13, margin: "0 0 20px" }}>
            {businessName} · {businessType}
          </Text>

          <Section style={{ backgroundColor: "#fafafa", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <Row label="Nome attività" value={businessName} />
            <Row label="Tipo" value={businessType} />
            <Row label="Sottodominio richiesto" value={`${subdomain}.deskinc.app`} />
            <Row label="Email cliente" value={email} />
            <Row label="Città" value={city} />
            <Row label="Indirizzo" value={address} />
            <Row label="Telefono" value={phone} />
            <Row label="Orari" value={openingHours} />
            <Row label="Colore primario" value={primaryColor} />
            <Row label="Colore secondario" value={secondaryColor} />
          </Section>

          {description && (
            <Section style={{ marginBottom: 16 }}>
              <Text style={{ margin: "0 0 4px", fontSize: 12, color: "#6d28d9", textTransform: "uppercase", letterSpacing: 1 }}>
                Descrizione
              </Text>
              <Text style={{ margin: 0, fontSize: 13, color: "#1f1d2b", lineHeight: 1.6 }}>{description}</Text>
            </Section>
          )}

          {services && (
            <Section style={{ marginBottom: 16 }}>
              <Text style={{ margin: "0 0 4px", fontSize: 12, color: "#6d28d9", textTransform: "uppercase", letterSpacing: 1 }}>
                Servizi / prodotti / piatti
              </Text>
              <Text style={{ margin: 0, fontSize: 13, color: "#1f1d2b", lineHeight: 1.6 }}>{services}</Text>
            </Section>
          )}

          {notes && (
            <Section style={{ marginBottom: 16 }}>
              <Text style={{ margin: "0 0 4px", fontSize: 12, color: "#6d28d9", textTransform: "uppercase", letterSpacing: 1 }}>
                Note del cliente
              </Text>
              <Text style={{ margin: 0, fontSize: 13, color: "#1f1d2b", lineHeight: 1.6 }}>{notes}</Text>
            </Section>
          )}

          <Hr style={{ borderColor: "#eceae3", margin: "24px 0" }} />

          <Text style={{ margin: "0 0 8px", fontSize: 12, color: "#6d28d9", textTransform: "uppercase", letterSpacing: 1 }}>
            Prompt pronto per Lovable
          </Text>
          <Section style={{ backgroundColor: "#1f1d2b", borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <Text style={{ margin: 0, fontSize: 13, color: "#f5f3ee", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, Menlo, monospace" }}>
              {prompt}
            </Text>
          </Section>

          <Section style={{ textAlign: "center", margin: "16px 0" }}>
            <Button href={adminUrl} style={{ backgroundColor: "#6d28d9", color: "#fff", padding: "12px 24px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
              Apri la scheda admin
            </Button>
          </Section>
        </Container>
        <Text style={{ color: "#8b8898", fontSize: 11, textAlign: "center", marginTop: 16 }}>
          Foll.IA — Desk Industries · notifica staff
        </Text>
      </Body>
    </Html>
  );
}

export const template: TemplateEntry = {
  component: FolliaNewRequestStaff,
  subject: (data) => `[Foll.IA] Nuova richiesta — ${data.businessName}`,
  displayName: "Foll.IA — Nuova richiesta (staff)",
  previewData: {
    businessName: "Bar da Mario",
    businessType: "restaurant",
    subdomain: "bar-da-mario",
    email: "mario@example.com",
    city: "Milano",
    description: "Bar storico di quartiere aperto dal 1985.",
    services: "Cappuccino, brioches artigianali, aperitivo",
    primaryColor: "#6d28d9",
    secondaryColor: "#f59e0b",
    prompt: "Crea un sito web per Bar da Mario...",
    adminUrl: "https://deskindustries.com/admin/sites/abc",
  },
};
