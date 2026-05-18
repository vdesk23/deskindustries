import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface OptimizedResult {
  optimized_markdown: string;
  meta_description: string;
  slug: string;
  permalink_suggestion: string;
  alt_ideas: Array<{ context: string; alt: string }>;
  changes: Array<{ type: string; before: string; after: string; reason: string }>;
}

const MARGIN = 18;
const LINE_HEIGHT = 6;

function addWrappedText(doc: jsPDF, text: string, y: number, opts?: { size?: number; bold?: boolean }): number {
  const size = opts?.size ?? 11;
  doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  doc.setFontSize(size);
  const pageW = doc.internal.pageSize.getWidth();
  const lines = doc.splitTextToSize(text, pageW - MARGIN * 2);
  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT * (size / 11);
  }
  return y;
}

function renderMarkdown(doc: jsPDF, md: string, startY: number): number {
  let y = startY;
  const lines = md.split("\n");
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      y += LINE_HEIGHT / 2;
      continue;
    }
    if (line.startsWith("# ")) {
      y += 2;
      y = addWrappedText(doc, line.replace(/^#\s+/, ""), y, { size: 18, bold: true });
      y += 2;
    } else if (line.startsWith("## ")) {
      y += 2;
      y = addWrappedText(doc, line.replace(/^##\s+/, ""), y, { size: 14, bold: true });
      y += 1;
    } else if (line.startsWith("### ")) {
      y = addWrappedText(doc, line.replace(/^###\s+/, ""), y, { size: 12, bold: true });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      y = addWrappedText(doc, "•  " + line.replace(/^[-*]\s+/, ""), y);
    } else if (/^\d+\.\s/.test(line)) {
      y = addWrappedText(doc, line, y);
    } else {
      const clean = line.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1");
      y = addWrappedText(doc, clean, y);
    }
  }
  return y;
}

export function generateArticlePdf(result: OptimizedResult): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;
  y = renderMarkdown(doc, result.optimized_markdown, y);
  return doc;
}

export function generateGuidePdf(result: OptimizedResult): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  y = addWrappedText(doc, "Guida ottimizzazione SEO/AIO", y, { size: 20, bold: true });
  y += 4;
  y = addWrappedText(doc, "Articolo ottimizzato + spiegazione delle modifiche", y, { size: 11 });
  y += 8;

  y = addWrappedText(doc, "SEO Meta", y, { size: 14, bold: true });
  y += 2;
  y = addWrappedText(doc, `Meta description: ${result.meta_description}`, y);
  y = addWrappedText(doc, `Slug: ${result.slug}`, y);
  y = addWrappedText(doc, `Permalink: ${result.permalink_suggestion}`, y);
  y += 4;

  if (result.alt_ideas?.length) {
    y = addWrappedText(doc, "Idee ALT per immagini", y, { size: 14, bold: true });
    y += 2;
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Contesto", "Testo ALT suggerito"]],
      body: result.alt_ideas.map((a) => [a.context, a.alt]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [240, 200, 80] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  if (result.changes?.length) {
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = MARGIN;
    }
    y = addWrappedText(doc, "Modifiche applicate", y, { size: 14, bold: true });
    y += 2;
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Tipo", "Prima", "Dopo", "Motivo"]],
      body: result.changes.map((c) => [c.type, c.before, c.after, c.reason]),
      styles: { fontSize: 9, cellPadding: 2, valign: "top" },
      headStyles: { fillColor: [240, 200, 80] },
      columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 45 }, 2: { cellWidth: 45 } },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  doc.addPage();
  y = MARGIN;
  y = addWrappedText(doc, "Articolo ottimizzato", y, { size: 18, bold: true });
  y += 4;
  renderMarkdown(doc, result.optimized_markdown, y);

  return doc;
}
