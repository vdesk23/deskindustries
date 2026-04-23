import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "Desk Industries";
const SITE_URL = "https://deskindustries.lovable.app";

interface LeadRequestConfirmationProps {
  name?: string;
  selectedServices?: string[];
  accountCreated?: boolean;
}

const SERVICE_LABELS: Record<string, string> = {
  "coco-web": "Coco Web",
  "coco-social": "Coco Social",
  cocoaching: "CoCoaching",
  "cocoaching-executive": "CoCoaching Executive",
};

const LeadRequestConfirmationEmail = ({
  name,
  selectedServices = [],
  accountCreated,
}: LeadRequestConfirmationProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Abbiamo ricevuto la tua richiesta — ti rispondiamo entro 24h</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>DESK INDUSTRIES</Text>
        <Heading style={h1}>
          {name ? `Grazie ${name}.` : "Grazie."}
        </Heading>
        <Text style={text}>
          Abbiamo ricevuto la tua richiesta di informazioni e l'abbiamo già messa in cima alla
          nostra agenda. Un membro del team ti risponderà entro <strong>24 ore lavorative</strong>.
        </Text>

        {selectedServices.length > 0 && (
          <Section>
            <Heading as="h2" style={h2}>Aree di tuo interesse</Heading>
            <Text style={text}>
              {selectedServices.map((s) => SERVICE_LABELS[s] || s).join(" · ")}
            </Text>
          </Section>
        )}

        {accountCreated && (
          <Section>
            <Heading as="h2" style={h2}>Il tuo account è pronto</Heading>
            <Text style={text}>
              Hai già un'area personale dove troverai presto la nostra proposta, i materiali e
              gli aggiornamenti sul progetto.
            </Text>
            <Section style={buttonSection}>
              <Button href={`${SITE_URL}/account`} style={button}>
                Accedi alla tua area
              </Button>
            </Section>
          </Section>
        )}

        <Heading as="h2" style={h2}>Cosa succede adesso</Heading>
        <Text style={text}>
          <strong>1.</strong> Analizziamo le informazioni che ci hai dato.<br />
          <strong>2.</strong> Ti contattiamo per fissare una call gratuita di 30 minuti.<br />
          <strong>3.</strong> Costruiamo insieme una proposta su misura per la tua attività.
        </Text>

        <Text style={footer}>
          A presto,<br />
          Il team di {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LeadRequestConfirmationEmail,
  subject: "Abbiamo ricevuto la tua richiesta — Desk Industries",
  displayName: "Conferma richiesta lead",
  previewData: {
    name: "Mario",
    selectedServices: ["coco-web", "coco-social"],
    accountCreated: true,
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" };
const container = { maxWidth: "560px", margin: "0 auto", padding: "40px 28px" };
const brand = { fontSize: "11px", letterSpacing: "0.3em", color: "#d97706", fontWeight: "600" as const, margin: "0 0 32px" };
const h1 = { fontSize: "32px", fontWeight: "500" as const, color: "#0a0a0a", lineHeight: "1.2", margin: "0 0 24px", letterSpacing: "-0.02em" };
const h2 = { fontSize: "18px", fontWeight: "600" as const, color: "#0a0a0a", margin: "32px 0 16px" };
const text = { fontSize: "15px", color: "#404040", lineHeight: "1.6", margin: "0 0 16px" };
const buttonSection = { margin: "28px 0" };
const button = { backgroundColor: "#d97706", color: "#ffffff", padding: "14px 28px", borderRadius: "999px", fontSize: "15px", fontWeight: "600" as const, textDecoration: "none", display: "inline-block" };
const footer = { fontSize: "14px", color: "#737373", margin: "40px 0 0", paddingTop: "24px", borderTop: "1px solid #e5e5e5" };
