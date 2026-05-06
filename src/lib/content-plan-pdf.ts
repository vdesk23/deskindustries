import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { DESK_LOGO_BASE64 } from "./desk-logo-base64";

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

export interface ContentPlanData {
  clienteNome?: string;
  brandNome?: string;
  clienteEmail?: string;
  clienteTel?: string;
  profiloSocial?: string;
  dataCompilazione?: string;
  q1?: string; q2?: string; q3?: string; q4?: string; q5?: string; q6?: string; q7?: string;
  pinAutorevolezza?: string;
  pinChiSei?: string;
  pinTestimonianze?: string;
  planner?: PlannerRow[];
  briefings?: BriefingItem[];
}

const AMBER: [number, number, number] = [217, 119, 6];
const INK: [number, number, number] = [10, 10, 10];
const MUTED: [number, number, number] = [115, 115, 115];
const SOFT: [number, number, number] = [250, 250, 250];

const QUESTIONS = [
  "Perché ti dovrei seguire?",
  "Cosa hai di unico?",
  "Qual è il messaggio che vuoi mandare?",
  "La tua storia: come hai iniziato?",
  "Le tue passioni e la tua visione nel lavoro?",
  "Descrivi il tuo cliente ideale.",
  "Nicchia specifica fra i clienti ideali.",
];

export function buildContentPlanPdf(data: ContentPlanData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const contentW = pageW - marginX * 2;
  let y = 56;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 60) {
      addFooter();
      doc.addPage();
      y = 56;
    }
  };

  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    const page = doc.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text("Desk Industries — Piano Contenuti", marginX, pageH - 28);
    doc.text(`Pagina ${page} di ${pageCount}`, pageW - marginX, pageH - 28, { align: "right" });
  };

  // Header with logo
  try {
    doc.addImage(DESK_LOGO_BASE64, "PNG", marginX, y - 16, 36, 36);
  } catch { /* ignore */ }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...AMBER);
  doc.text("DESK INDUSTRIES", marginX + 48, y - 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Piano Contenuti", marginX + 48, y + 12);

  y += 48;
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(1.2);
  doc.line(marginX, y, marginX + 40, y);

  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  const titolo = data.brandNome || data.clienteNome || "Piano Contenuti";
  doc.text(titolo, marginX, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Compilato il ${data.dataCompilazione || "—"}`, marginX, y);
  y += 28;

  const sectionTitle = (n: string, t: string) => {
    ensureSpace(40);
    doc.setFillColor(...AMBER);
    doc.rect(marginX, y - 10, 3, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...AMBER);
    doc.text(`SEZIONE ${n}`, marginX + 10, y - 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(t, marginX + 10, y + 12);
    y += 26;
  };

  const labelValue = (label: string, value?: string) => {
    const v = value && value.trim() ? value : "—";
    const lines = doc.splitTextToSize(v, contentW - 8);
    const h = 14 + lines.length * 12 + 6;
    ensureSpace(h);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), marginX, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(lines, marginX, y);
    y += lines.length * 12 + 8;
  };

  // SEC 1
  sectionTitle("1", "Anagrafica");
  labelValue("Cliente", data.clienteNome);
  labelValue("Brand", data.brandNome);
  labelValue("Email", data.clienteEmail);
  labelValue("Telefono", data.clienteTel);
  labelValue("Profilo social", data.profiloSocial);

  // SEC 2
  sectionTitle("2", "Intervista di posizionamento");
  const answers = [data.q1, data.q2, data.q3, data.q4, data.q5, data.q6, data.q7];
  QUESTIONS.forEach((q, i) => labelValue(`Q${i + 1}. ${q}`, answers[i]));

  // SEC 3
  sectionTitle("3", "Tre post pinnati");
  labelValue("Autorevolezza", data.pinAutorevolezza);
  labelValue("Chi sei", data.pinChiSei);
  labelValue("Testimonianze", data.pinTestimonianze);

  // SEC 4 — Planner
  sectionTitle("4", "Planner settimanale");
  const planner = data.planner ?? [];
  ensureSpace(80);
  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["Giorno", "Tipologia", "Formato", "Gancio", "CTA"]],
    body: planner.map((r) => [
      r.giorno || "",
      r.tipologia || "—",
      r.formato || "—",
      r.gancio || "—",
      r.cta || "—",
    ]),
    styles: { font: "helvetica", fontSize: 9, textColor: INK, cellPadding: 6 },
    headStyles: { fillColor: AMBER, textColor: 255, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: SOFT },
    columnStyles: { 0: { fontStyle: "bold", textColor: AMBER, cellWidth: 50 } },
    didDrawPage: () => { /* keeps y tracking via finalY */ },
  });
  y = (doc as any).lastAutoTable.finalY + 24;

  // SEC 5 — Briefings
  sectionTitle("5", "Briefing singoli Reel");
  const briefings = (data.briefings ?? []).filter((b) =>
    Object.values(b).some((v) => v && String(v).trim().length),
  );
  if (!briefings.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("Nessun briefing compilato.", marginX, y);
    y += 14;
  } else {
    briefings.forEach((b, i) => {
      ensureSpace(80);
      doc.setFillColor(...SOFT);
      doc.setDrawColor(229, 229, 229);
      const blockTop = y;
      doc.roundedRect(marginX, y, contentW, 22, 6, 6, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...AMBER);
      doc.text(`REEL #${i + 1}`, marginX + 10, y + 14);
      if (b.titolo) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        doc.text(b.titolo, marginX + 70, y + 14);
      }
      y += 30;
      labelValue("Tipologia", b.tipologia);
      labelValue("Formato", b.formato);
      labelValue("Gancio", b.gancio);
      labelValue("Messaggio", b.messaggio);
      labelValue("CTA", b.cta);
      labelValue("Location/Outfit", b.location);
      labelValue("Note editing", b.editing);
      y += 4;
      void blockTop;
    });
  }

  // Footer on all pages
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text("Desk Industries — Piano Contenuti", marginX, pageH - 28);
    doc.text(`Pagina ${p} di ${total}`, pageW - marginX, pageH - 28, { align: "right" });
  }

  return doc;
}

export function contentPlanPdfFilename(data: ContentPlanData): string {
  const brand = (data.brandNome || data.clienteNome || "piano-contenuti")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const date = data.dataCompilazione || new Date().toISOString().slice(0, 10);
  return `piano-contenuti_${brand}_${date}.pdf`;
}
