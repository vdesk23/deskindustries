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

export interface PlannerRow {
  giorno: string;
  tipologia?: string;
  formato?: string;
  gancio?: string;
  cta?: string;
}

export interface BriefingItem {
  titolo?: string;
  tipologia?: string;
  formato?: string;
  cta?: string;
  gancio?: string;
  messaggio?: string;
  location?: string;
  editing?: string;
}

export interface ContentPlanAdminProps {
  clienteNome?: string;
  brandNome?: string;
  clienteEmail?: string;
  clienteTel?: string;
  profiloSocial?: string;
  dataCompilazione?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
  pinAutorevolezza?: string;
  pinChiSei?: string;
  pinTestimonianze?: string;
  planner?: PlannerRow[];
  briefings?: BriefingItem[];
  pdfUrl?: string;
  pdfFilename?: string;
  pdfExpiresInDays?: number;
}

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <Section style={row}>
    <Text style={rowLabel}>{label}</Text>
    <Text style={rowValue}>{value || "—"}</Text>
  </Section>
);

const QA = ({ n, q, a }: { n: number; q: string; a?: string }) => (
  <Section style={{ margin: "0 0 14px" }}>
    <Text style={qLabel}>
      Q{n}. {q}
    </Text>
    <Text style={qAnswer}>{a && a.length ? a : "—"}</Text>
  </Section>
);

const ContentPlanAdminEmail = ({
  clienteNome,
  brandNome,
  clienteEmail,
  clienteTel,
  profiloSocial,
  dataCompilazione,
  q1,
  q2,
  q3,
  q4,
  q5,
  q6,
  q7,
  pinAutorevolezza,
  pinChiSei,
  pinTestimonianze,
  planner = [],
  briefings = [],
  pdfUrl,
  pdfFilename,
  pdfExpiresInDays = 30,
}: ContentPlanAdminProps) => {
  const filledBriefings = briefings.filter((b) =>
    Object.values(b).some((v) => v && String(v).length),
  );

  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>
        Piano Contenuti — {brandNome || clienteNome || "nuovo invio"}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>DESK INDUSTRIES — PIANO CONTENUTI</Text>
          <Heading style={h1}>
            Nuovo piano da {brandNome || clienteNome || "Cliente"}
          </Heading>
          <Text style={text}>
            Modulo compilato dall'area clienti. Compilato il{" "}
            <strong>{dataCompilazione || "—"}</strong>.
          </Text>

          {pdfUrl ? (
            <Section style={pdfBox}>
              <Text style={pdfLabel}>📎 PDF brandizzato del piano</Text>
              <Text style={pdfFile}>{pdfFilename || "piano-contenuti.pdf"}</Text>
              <a href={pdfUrl} style={pdfButton as any}>
                Scarica PDF
              </a>
              <Text style={pdfHint}>
                Link valido per {pdfExpiresInDays} giorni.
              </Text>
            </Section>
          ) : null}

          <Hr style={hr} />
          <Heading as="h2" style={h2}>
            1 · Anagrafica
          </Heading>
          <Row label="Cliente" value={clienteNome} />
          <Row label="Brand" value={brandNome} />
          <Row label="Email" value={clienteEmail} />
          <Row label="Telefono" value={clienteTel} />
          <Row label="Profilo social" value={profiloSocial} />

          <Hr style={hr} />
          <Heading as="h2" style={h2}>
            2 · Intervista di posizionamento
          </Heading>
          <QA n={1} q="Perché ti dovrei seguire?" a={q1} />
          <QA n={2} q="Cosa hai di unico?" a={q2} />
          <QA n={3} q="Qual è il messaggio che vuoi mandare?" a={q3} />
          <QA n={4} q="La tua storia: come hai iniziato?" a={q4} />
          <QA n={5} q="Le tue passioni e la tua visione nel lavoro?" a={q5} />
          <QA n={6} q="Descrivi il tuo cliente ideale." a={q6} />
          <QA n={7} q="Nicchia specifica fra i clienti ideali." a={q7} />

          <Hr style={hr} />
          <Heading as="h2" style={h2}>
            3 · Tre post pinnati
          </Heading>
          <Row label="Autorevolezza" value={pinAutorevolezza} />
          <Row label="Chi sei" value={pinChiSei} />
          <Row label="Testimonianze" value={pinTestimonianze} />

          <Hr style={hr} />
          <Heading as="h2" style={h2}>
            4 · Planner settimanale
          </Heading>
          {planner.length === 0 ? (
            <Text style={text}>Nessun giorno compilato.</Text>
          ) : (
            planner.map((r) => {
              const filled = r.tipologia || r.formato || r.gancio || r.cta;
              return (
                <Section key={r.giorno} style={{ margin: "0 0 8px" }}>
                  <Text style={rowValue}>
                    <strong>{r.giorno}</strong> —{" "}
                    {filled
                      ? `[${r.tipologia || "-"}] ${r.formato || "-"}${
                          r.gancio ? ` · ${r.gancio}` : ""
                        }${r.cta ? ` · ${r.cta}` : ""}`
                      : "—"}
                  </Text>
                </Section>
              );
            })
          )}

          <Hr style={hr} />
          <Heading as="h2" style={h2}>
            5 · Briefing singoli Reel
          </Heading>
          {filledBriefings.length === 0 ? (
            <Text style={text}>Nessun briefing compilato.</Text>
          ) : (
            filledBriefings.map((b, i) => (
              <Section key={i} style={briefBlock}>
                <Text style={briefTitle}>Reel #{i + 1}</Text>
                <Row label="Titolo" value={b.titolo} />
                <Row label="Tipologia" value={b.tipologia} />
                <Row label="Formato" value={b.formato} />
                <Row label="Gancio" value={b.gancio} />
                <Row label="Messaggio" value={b.messaggio} />
                <Row label="CTA" value={b.cta} />
                <Row label="Location/Outfit" value={b.location} />
                <Row label="Note editing" value={b.editing} />
              </Section>
            ))
          )}

          <Hr style={hr} />
          <Text style={footer}>
            Inviato dal modulo Piano Contenuti — Desk Industries.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: ContentPlanAdminEmail,
  subject: (data: Record<string, any>) =>
    `[Piano Contenuti] ${data?.brandNome || data?.clienteNome || "Nuovo invio"}`,
  displayName: "Piano contenuti — invio team",
  previewData: {
    clienteNome: "Mario Rossi",
    brandNome: "Studio Rossi Nutrizione",
    clienteEmail: "mario@example.com",
    clienteTel: "+39 333 1234567",
    profiloSocial: "@studiorossi",
    dataCompilazione: "2026-05-03",
    q1: "Perché aiuto i vegani a stare meglio.",
    pinAutorevolezza: "10 anni di esperienza, 500+ clienti seguiti",
    planner: [
      { giorno: "Lun", tipologia: "E - Educativo", formato: "Dinamico", gancio: "3 errori comuni", cta: "Salva il post" },
      { giorno: "Mar" },
      { giorno: "Mer", tipologia: "S - Story-telling", formato: "Dinamico", gancio: "Come ho iniziato", cta: "" },
      { giorno: "Gio" },
      { giorno: "Ven", tipologia: "D - Dimostrativo", formato: "Statico", gancio: "Prima/dopo", cta: "Scrivimi in DM" },
      { giorno: "Sab" },
      { giorno: "Dom" },
    ],
    briefings: [
      {
        titolo: "3 errori dei vegani",
        tipologia: "Educativo",
        formato: "Dinamico",
        gancio: "Il 90% sbaglia questa cosa",
        messaggio: "Le proteine non sono il problema",
        cta: "Salva il post",
      },
    ],
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
const container = { maxWidth: "640px", margin: "0 auto", padding: "40px 28px" };
const brand = {
  fontSize: "11px",
  letterSpacing: "0.3em",
  color: "#d97706",
  fontWeight: "600" as const,
  margin: "0 0 24px",
};
const h1 = {
  fontSize: "26px",
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
const text = { fontSize: "14px", color: "#404040", lineHeight: "1.6", margin: "0 0 12px" };
const row = { margin: "0 0 8px" };
const rowLabel = {
  fontSize: "11px",
  color: "#737373",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 2px",
  fontWeight: "600" as const,
};
const rowValue = { fontSize: "14px", color: "#0a0a0a", margin: "0" };
const qLabel = {
  fontSize: "13px",
  color: "#0a0a0a",
  fontWeight: "600" as const,
  margin: "0 0 4px",
};
const qAnswer = {
  fontSize: "14px",
  color: "#404040",
  lineHeight: "1.6",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};
const briefBlock = {
  background: "#fafafa",
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  padding: "14px 16px",
  margin: "0 0 12px",
};
const briefTitle = {
  fontSize: "13px",
  fontWeight: "700" as const,
  color: "#d97706",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 8px",
};
const hr = { borderColor: "#e5e5e5", margin: "20px 0" };
const footer = { fontSize: "12px", color: "#737373", margin: "24px 0 0" };
