import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import portfolioAsset from "@/assets/portfolio-desk-industries-v2.pdf.asset.json";

const SITE_URL = "https://www.deskindustries.com";

interface Props { name?: string }

const LeadPortfolioEmail = ({ name }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il portfolio Desk Industries: case study e risultati reali</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>DESK INDUSTRIES</Text>
        <Heading style={h1}>{name ? `Grazie ${name}, ecco il nostro portfolio.` : "Ecco il nostro portfolio."}</Heading>
        <Text style={text}>
          Abbiamo ricevuto i tuoi dati. Mentre prepariamo la risposta, scopri cosa abbiamo realizzato per altre imprese:
          CONSUS, siti veloci, campagne e crescita organica, con numeri reali.
        </Text>
        <Section style={card}>
          <Text style={stat}>ROAS 50 · 720 iscritti a 0,61 € · PageSpeed 66 → 99</Text>
        </Section>
        <Section style={{ margin: "28px 0" }}>
          <Button href={`${SITE_URL}${portfolioAsset.url}`} style={button}>Scarica il portfolio (PDF)</Button>
        </Section>
        <Text style={text}>Nessun vincolo contrattuale: paghi solo i servizi che usi, a settimana o a mese.</Text>
        <Text style={footer}>A presto,<br />Il team di Desk Industries</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LeadPortfolioEmail,
  subject: "Il portfolio Desk Industries — case study e risultati",
  displayName: "Portfolio dopo il primo step",
  previewData: { name: "Mario" },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" };
const container = { maxWidth: "560px", margin: "0 auto", padding: "40px 28px" };
const brand = { fontSize: "11px", letterSpacing: "0.3em", color: "#d97706", fontWeight: "600" as const, margin: "0 0 32px" };
const h1 = { fontSize: "28px", fontWeight: "500" as const, color: "#0a0a0a", lineHeight: "1.25", margin: "0 0 20px" };
const text = { fontSize: "15px", color: "#404040", lineHeight: "1.6", margin: "0 0 16px" };
const card = { backgroundColor: "#16121f", borderRadius: "16px", padding: "18px 22px" };
const stat = { fontSize: "14px", color: "#f2a93b", fontWeight: "600" as const, margin: 0 };
const button = { backgroundColor: "#d97706", color: "#ffffff", padding: "14px 28px", borderRadius: "999px", fontSize: "15px", fontWeight: "600" as const, textDecoration: "none", display: "inline-block" };
const footer = { fontSize: "14px", color: "#737373", margin: "40px 0 0", paddingTop: "24px", borderTop: "1px solid #e5e5e5" };
