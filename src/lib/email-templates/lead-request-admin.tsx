import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const ADMIN_EMAIL = "master@deskindustries.com";

interface LeadRequestAdminProps {
  name?: string;
  email?: string;
  phone?: string;
  business?: string;
  sector?: string;
  selectedServices?: string[];
  expectedGoals?: string[];
  lookingFor?: string;
  hasWebsite?: string;
  websiteUrl?: string;
  hasSocial?: string;
  socialLinks?: string;
  webNeeds?: string[];
  socialNeeds?: string[];
  coachingFocus?: string;
  companyResources?: string;
  contactPreference?: string;
  message?: string;
  accountCreated?: boolean;
}

const labelize = (value?: string) =>
  value ? value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Section style={row}>
    <Text style={rowLabel}>{label}</Text>
    <Text style={rowValue}>{value || "—"}</Text>
  </Section>
);

const LeadRequestAdminEmail = ({
  name,
  email,
  phone,
  business,
  sector,
  selectedServices = [],
  expectedGoals = [],
  lookingFor,
  hasWebsite,
  websiteUrl,
  hasSocial,
  socialLinks,
  webNeeds = [],
  socialNeeds = [],
  coachingFocus,
  companyResources,
  contactPreference,
  message,
  accountCreated,
}: LeadRequestAdminProps) => {
  const hasWeb = selectedServices.includes("coco-web");
  const hasSocialSvc = selectedServices.includes("coco-social");
  const hasCoaching =
    selectedServices.includes("cocoaching") ||
    selectedServices.includes("cocoaching-executive");

  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>Nuovo lead — {name ?? "richiesta"} ({sector ?? "settore"})</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>DESK INDUSTRIES — LEAD QUALIFICATO</Text>
          <Heading style={h1}>Nuova richiesta da {name ?? "Cliente"}</Heading>
          <Text style={text}>
            {accountCreated
              ? "Il contatto ha completato il modulo e ha creato un account sulla piattaforma."
              : "Il contatto ha completato il modulo (account piattaforma non ancora attivato)."}
          </Text>

          <Hr style={hr} />
          <Heading as="h2" style={h2}>Contatto</Heading>
          <Row label="Nome" value={name} />
          <Row label="Email" value={email} />
          <Row label="Telefono" value={phone} />
          <Row label="Attività" value={business} />
          <Row label="Settore" value={labelize(sector)} />
          <Row label="Preferenza contatto" value={labelize(contactPreference)} />

          <Hr style={hr} />
          <Heading as="h2" style={h2}>Aree di interesse</Heading>
          <Row label="Servizi COCO" value={selectedServices.map(labelize).join(", ")} />
          <Row label="Obiettivi attesi" value={expectedGoals.map(labelize).join(", ")} />
          <Row label="Cosa cerca" value={lookingFor} />

          {hasWeb && (
            <Section>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>Coco Web — qualificazione</Heading>
              <Row label="Ha già un sito" value={labelize(hasWebsite)} />
              <Row label="URL sito" value={websiteUrl} />
              <Row label="Necessità web" value={webNeeds.map(labelize).join(", ")} />
            </Section>
          )}

          {hasSocialSvc && (
            <Section>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>Coco Social — qualificazione</Heading>
              <Row label="Ha profili social" value={labelize(hasSocial)} />
              <Row label="Link / handle" value={socialLinks} />
              <Row label="Necessità social" value={socialNeeds.map(labelize).join(", ")} />
            </Section>
          )}

          {hasCoaching && (
            <Section>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>Coaching — qualificazione</Heading>
              <Row label="Focus desiderato" value={coachingFocus} />
              <Row label="Risorse interne / team" value={companyResources} />
            </Section>
          )}

          {message && (
            <Section>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>Note aggiuntive</Heading>
              <Text style={text}>{message}</Text>
            </Section>
          )}

          <Hr style={hr} />
          <Text style={footer}>Lead inoltrato a {ADMIN_EMAIL} dalla piattaforma Desk Industries.</Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: LeadRequestAdminEmail,
  subject: (data: Record<string, any>) =>
    `Nuovo lead — ${data?.name ?? "Cliente"} (${data?.sector ?? "settore"})`,
  to: ADMIN_EMAIL,
  displayName: "Lead admin (master@deskindustries.com)",
  previewData: {
    name: "Mario Rossi",
    email: "mario@example.com",
    phone: "+39 333 1234567",
    business: "Studio Rossi & Partners",
    sector: "studi-professionisti",
    selectedServices: ["coco-web", "coco-social"],
    expectedGoals: ["nuovi-clienti", "autorevolezza"],
    lookingFor: "Strategia digitale completa per lo studio",
    hasWebsite: "yes-needs-improvement",
    websiteUrl: "https://studiorossi.it",
    hasSocial: "no",
    webNeeds: ["seo", "redesign"],
    socialNeeds: ["contenuti", "format"],
    contactPreference: "email",
    accountCreated: true,
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" };
const container = { maxWidth: "640px", margin: "0 auto", padding: "40px 28px" };
const brand = { fontSize: "11px", letterSpacing: "0.3em", color: "#d97706", fontWeight: "600" as const, margin: "0 0 24px" };
const h1 = { fontSize: "26px", fontWeight: "500" as const, color: "#0a0a0a", lineHeight: "1.2", margin: "0 0 16px", letterSpacing: "-0.02em" };
const h2 = { fontSize: "15px", fontWeight: "600" as const, color: "#0a0a0a", margin: "20px 0 8px", textTransform: "uppercase" as const, letterSpacing: "0.08em" };
const text = { fontSize: "14px", color: "#404040", lineHeight: "1.6", margin: "0 0 12px" };
const row = { margin: "0 0 8px" };
const rowLabel = { fontSize: "11px", color: "#737373", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "0 0 2px", fontWeight: "600" as const };
const rowValue = { fontSize: "14px", color: "#0a0a0a", margin: "0" };
const hr = { borderColor: "#e5e5e5", margin: "20px 0" };
const footer = { fontSize: "12px", color: "#737373", margin: "24px 0 0" };
