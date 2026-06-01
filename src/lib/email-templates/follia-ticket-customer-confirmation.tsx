import * as React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  siteName: string;
  categoryLabel: string;
  subject: string;
  requiresPayment: boolean;
  paymentUrl?: string;
}

function FolliaTicketCustomerConfirmation({ siteName, categoryLabel, subject, requiresPayment, paymentUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        {requiresPayment
          ? `Completa il pagamento per attivare il ticket per ${siteName}`
          : `Abbiamo ricevuto la tua richiesta per ${siteName}`}
      </Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Inter, system-ui, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#f7f5ef", maxWidth: 560, margin: "0 auto", borderRadius: 14, padding: 36 }}>
          <Heading style={{ fontSize: 22, color: "#1f1d2b", margin: "0 0 12px" }}>
            {requiresPayment ? "Completa il pagamento per aprire il ticket" : "Abbiamo ricevuto la tua richiesta"}
          </Heading>
          <Text style={{ color: "#4b4858", fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>
            Categoria: <strong>{categoryLabel}</strong><br />
            Oggetto: <strong>{subject}</strong><br />
            Sito: <strong>{siteName}</strong>
          </Text>

          {requiresPayment ? (
            <>
              <Text style={{ color: "#4b4858", fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>
                Per inoltrare la richiesta al nostro team è necessario completare il pagamento di <strong>€50 + IVA</strong>.
                Il ticket verrà preso in carico appena registriamo il pagamento.
              </Text>
              {paymentUrl && (
                <Section style={{ textAlign: "center", margin: "20px 0" }}>
                  <Button href={paymentUrl} style={{ backgroundColor: "#6d28d9", color: "#fff", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
                    Completa il pagamento
                  </Button>
                </Section>
              )}
            </>
          ) : (
            <Text style={{ color: "#4b4858", fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>
              Il nostro team risponderà via email a breve. Visto che il tuo piano include l'assistenza, non c'è alcun costo aggiuntivo.
            </Text>
          )}

          <Hr style={{ borderColor: "#eceae3", margin: "24px 0" }} />
          <Text style={{ color: "#8b8898", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Risponderemo direttamente all'indirizzo da cui hai effettuato il login.
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
  component: FolliaTicketCustomerConfirmation,
  subject: (data) =>
    data.requiresPayment
      ? `Completa il pagamento per il ticket — ${data.siteName}`
      : `Abbiamo ricevuto la tua richiesta — ${data.siteName}`,
  displayName: "Foll.IA — Conferma ticket cliente",
  previewData: {
    siteName: "Bar da Mario",
    categoryLabel: "Dominio",
    subject: "Dominio — Bar da Mario",
    requiresPayment: true,
    paymentUrl: "https://deskindustries.com/account/tickets/abc/pay",
  },
};
