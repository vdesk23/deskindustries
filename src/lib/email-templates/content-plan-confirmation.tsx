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

interface ContentPlanConfirmationProps {
  clienteNome?: string;
  brandNome?: string;
}

const ContentPlanConfirmationEmail = ({
  clienteNome,
  brandNome,
}: ContentPlanConfirmationProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>
      Abbiamo ricevuto il tuo piano contenuti — è in lavorazione
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>DESK INDUSTRIES</Text>
        <Heading style={h1}>
          {clienteNome ? `Grazie ${clienteNome}.` : "Grazie."}
        </Heading>
        <Text style={text}>
          Abbiamo ricevuto il piano contenuti
          {brandNome ? ` per ${brandNome}` : ""}. Il nostro team marketing &amp;
          content lo sta già esaminando.
        </Text>
        <Text style={text}>
          Ti contatteremo entro <strong>2 giorni lavorativi</strong> per
          allineare il calendario editoriale, validare i tre post pinnati e
          partire con la produzione dei Reel.
        </Text>

        <Hr style={hr} />
        <Heading as="h2" style={h2}>
          Cosa succede adesso
        </Heading>
        <Text style={text}>
          1. Lettura del modulo da parte di marketing &amp; content.
          <br />
          2. Call di allineamento sul tono di voce e sulla nicchia.
          <br />
          3. Calendario editoriale settimanale + briefing definitivi.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          Hai aggiornamenti o materiali da aggiungere? Rispondi a questa email,
          finiranno direttamente nel team.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: ContentPlanConfirmationEmail,
  subject: "Abbiamo ricevuto il tuo piano contenuti",
  displayName: "Piano contenuti — conferma cliente",
  previewData: {
    clienteNome: "Mario",
    brandNome: "Studio Rossi Nutrizione",
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
const container = { maxWidth: "560px", margin: "0 auto", padding: "40px 28px" };
const brand = {
  fontSize: "11px",
  letterSpacing: "0.3em",
  color: "#d97706",
  fontWeight: "600" as const,
  margin: "0 0 24px",
};
const h1 = {
  fontSize: "28px",
  fontWeight: "500" as const,
  color: "#0a0a0a",
  lineHeight: "1.2",
  margin: "0 0 16px",
  letterSpacing: "-0.02em",
};
const h2 = {
  fontSize: "15px",
  fontWeight: "600" as const,
  color: "#0a0a0a",
  margin: "20px 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};
const text = {
  fontSize: "15px",
  color: "#404040",
  lineHeight: "1.7",
  margin: "0 0 16px",
};
const hr = { borderColor: "#e5e5e5", margin: "28px 0" };
const footer = { fontSize: "13px", color: "#737373", margin: "0" };
