import * as React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  businessName: string;
  previewUrl: string;
}

function FolliaPreviewReady({ businessName, previewUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Il tuo sito {businessName} è pronto in anteprima</Preview>
      <Body style={{ backgroundColor: "#f5f3ee", fontFamily: "Inter, system-ui, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", maxWidth: 560, margin: "0 auto", borderRadius: 14, padding: 36 }}>
          <Heading style={{ fontSize: 24, color: "#1f1d2b", margin: "0 0 8px" }}>
            Il tuo sito è pronto in anteprima
          </Heading>
          <Text style={{ color: "#4b4858", fontSize: 15, lineHeight: 1.6, margin: "0 0 18px" }}>
            Ciao! Abbiamo generato un'anteprima del sito web per <strong>{businessName}</strong> con l'IA di Foll.IA.
          </Text>
          <Text style={{ color: "#4b4858", fontSize: 15, lineHeight: 1.6, margin: "0 0 24px" }}>
            Per vederla, crea il tuo account: bastano 30 secondi. Da lì potrai pubblicarla subito o richiedere modifiche.
          </Text>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Button href={previewUrl} style={{ backgroundColor: "#6d28d9", color: "#fff", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
              Vedi la tua anteprima
            </Button>
          </Section>
          <Hr style={{ borderColor: "#eceae3", margin: "28px 0" }} />
          <Text style={{ color: "#8b8898", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Se non hai richiesto tu questa anteprima, ignora questa email.
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
  component: FolliaPreviewReady,
  subject: (data) => `La tua anteprima ${data.businessName} è pronta`,
  displayName: "Foll.IA — Anteprima pronta",
  previewData: { businessName: "Bar da Mario", previewUrl: "https://example.com" },
};
