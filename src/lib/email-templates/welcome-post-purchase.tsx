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
const SITE_URL = "https://id-preview--665af6d8-e1ef-4a8b-9a76-5fea17beea52.lovable.app";

interface WelcomePostPurchaseProps {
  email?: string;
  sessionId?: string;
  mode?: string;
}

const WelcomePostPurchaseEmail = ({ email, mode }: WelcomePostPurchaseProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Benvenuto in {SITE_NAME} — il tuo abbonamento è attivo</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Text style={brand}>DESK INDUSTRIES</Text>
        </Section>

        <Heading style={h1}>Benvenuto a bordo. 🎉</Heading>

        <Text style={text}>
          Grazie per aver scelto {SITE_NAME}. Il tuo{" "}
          {mode === "subscription" ? "abbonamento" : "ordine"} è confermato e siamo già al lavoro.
        </Text>

        <Heading as="h2" style={h2}>
          I prossimi passi
        </Heading>

        <Text style={text}>
          <strong>1. Imposta la tua password.</strong> Ti basta cliccare il bottone qui sotto e
          creare un account con questa email ({email}). Da lì potrai vedere il tuo piano, la
          prossima fatturazione e gestire l'abbonamento in autonomia.
        </Text>

        <Section style={buttonSection}>
          <Button
            href={`${SITE_URL}/auth?mode=signup&redirect=%2Faccount`}
            style={button}
          >
            Crea il tuo account
          </Button>
        </Section>

        <Text style={text}>
          <strong>2. Ti contattiamo entro 24h.</strong> Riceverai un'email da un membro del nostro
          team per concordare la prima call di onboarding e iniziare a costruire la tua presenza
          digitale.
        </Text>

        <Text style={text}>
          <strong>3. Tutti i materiali pronti.</strong> Prepara accessi a sito web (se esiste),
          profili social, Google My Business — ti aiutiamo noi a centralizzare tutto.
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
  component: WelcomePostPurchaseEmail,
  subject: `Benvenuto in ${SITE_NAME} — il tuo abbonamento è attivo`,
  displayName: "Benvenuto post-acquisto",
  previewData: {
    email: "cliente@esempio.it",
    sessionId: "cs_test_xxx",
    mode: "subscription",
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 28px",
};

const brand = {
  fontSize: "11px",
  letterSpacing: "0.3em",
  color: "#d97706",
  fontWeight: "600" as const,
  margin: "0 0 32px",
};

const h1 = {
  fontSize: "32px",
  fontWeight: "500" as const,
  color: "#0a0a0a",
  lineHeight: "1.2",
  margin: "0 0 24px",
  letterSpacing: "-0.02em",
};

const h2 = {
  fontSize: "18px",
  fontWeight: "600" as const,
  color: "#0a0a0a",
  margin: "32px 0 16px",
};

const text = {
  fontSize: "15px",
  color: "#404040",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const buttonSection = {
  margin: "28px 0",
};

const button = {
  backgroundColor: "#d97706",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "999px",
  fontSize: "15px",
  fontWeight: "600" as const,
  textDecoration: "none",
  display: "inline-block",
};

const footer = {
  fontSize: "14px",
  color: "#737373",
  margin: "40px 0 0",
  paddingTop: "24px",
  borderTop: "1px solid #e5e5e5",
};
