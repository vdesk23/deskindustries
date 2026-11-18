import { Body, Container, Head, Heading, Html, Preview, Text, Hr } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  stage?: "contact" | "hot";
  line?: string;
  variant?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  answers?: Record<string, string>;
  preferredSlot?: string;
  notes?: string;
  utm?: Record<string, string>;
}

const LandingLeadStaff = ({ stage = "contact", line = "", variant, firstName, lastName, email, phone, answers = {}, preferredSlot, notes, utm = {} }: Props) => (
  <Html lang="it">
    <Head />
    <Preview>{stage === "hot" ? "HOT LEAD" : "ANAGRAFICA CLIENTE"} {line.toUpperCase()}</Preview>
    <Body style={{ backgroundColor: "#ffffff", fontFamily: "-apple-system, Segoe UI, Roboto, sans-serif" }}>
      <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
        <Heading style={{ fontSize: "22px", color: "#0a0a0a" }}>
          {stage === "hot" ? "HOT LEAD" : "ANAGRAFICA CLIENTE"} {line.toUpperCase()}
        </Heading>
        <Text>Nome: {firstName} {lastName}</Text>
        <Text>Email: {email}</Text>
        <Text>Telefono: {phone}</Text>
        <Text>Variante landing: {variant?.toUpperCase() || "—"}</Text>
        {Object.keys(answers).length > 0 && <Hr />}
        {Object.entries(answers).map(([k, v]) => <Text key={k}>{k}: {v}</Text>)}
        {preferredSlot && <Text>Momento preferito per la call: {preferredSlot}</Text>}
        {notes && <Text>Note: {notes}</Text>}
        {Object.keys(utm).length > 0 && <><Hr /><Text style={{ color: "#666", fontSize: "12px" }}>{Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(" · ")}</Text></>}
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LandingLeadStaff,
  subject: (d: Record<string, any>) => `${d.stage === "hot" ? "HOT LEAD" : "ANAGRAFICA CLIENTE"} ${String(d.line ?? "").toUpperCase()}`,
  displayName: "Landing lead (staff)",
  to: "master@deskindustries.com",
  previewData: { stage: "hot", line: "productos", firstName: "Maria", lastName: "Rossi", email: "maria@example.com", phone: "333" },
} satisfies TemplateEntry;
