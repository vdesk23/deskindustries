import * as React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  businessName: string;
  accountUrl: string;
}

function FolliaRequestReceived({ businessName, accountUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Abbiamo ricevuto la tua richiesta per {businessName}</Preview>
      <Body style={{ backgroundColor: "#f5f3ee", fontFamily: "Inter, system-ui, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", maxWidth: 560, margin: "0 auto", borderRadius: 14, padding: 36 }}>
          <Heading style={{ fontSize: 24, color: "#1f1d2b", margin: "0 0 8px" }}>
            Richiesta ricevuta ✓
          </Heading>
          <Text style={{ color: "#4b4858", fontSize: 15, lineHeight: 1.6, margin: "0 0 18px" }}>
            Grazie! Abbiamo ricevuto la richiesta per <strong>{businessName}</strong>. Il nostro team sta già
            iniziando a lavorare al tuo sito web.
          </Text>
          <Text style={{ color: "#4b4858", fontSize: 15, lineHeight: 1.6, margin: "0 0 24px" }}>
            Ti scriveremo non appena la prima versione sarà pronta e quando il sito sarà disponibile per il pagamento.
            Nel frattempo puoi creare il tuo account per seguire l'avanzamento e contattarci tramite ticket.
          </Text>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Button href={accountUrl} style={{ backgroundColor: "#6d28d9", color: "#fff", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
              Vai alla mia area cliente
            </Button>
          </Section>
          <Hr style={{ borderColor: "#eceae3", margin: "28px 0" }} />
          <Text style={{ color: "#8b8898", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Se non hai inviato tu questa richiesta, ignora questa email.
          </Text>
        </Container>
        <Text style={{ color: "#8b8898", fontSize: 11, textAlign: "center", marginTop: 16 }}>
          Foll.IA — Desk Industries
        </Text>
      </Body>
    </Html>
  );
}

export const template: TemplateEntry = {
  component: FolliaRequestReceived,
  subject: (data) => `Abbiamo ricevuto la tua richiesta — ${data.businessName}`,
  displayName: "Foll.IA — Richiesta ricevuta (cliente)",
  previewData: { businessName: "Bar da Mario", accountUrl: "https://deskindustries.com/account" },
};
