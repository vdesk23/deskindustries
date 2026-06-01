import { render } from "@react-email/components";
import React from "react";

const site = {
  id: "cf734502-de05-4251-aec5-fa86b0b9b0e8",
  businessName: "Pizzeria Rugantino e Pachino",
  businessType: "ristorante / bar",
  subdomain: "pizzeriarugantino",
  email: "valerio.raimondivallesi@gmail.com",
  city: "Roma",
  address: "Via Emilio Nazzani 25 00148 Roma",
  phone: "066554192",
  openingHours: "Lun-Sab 6:00-21:00, dom chiuso",
  primaryColor: "#662e00",
  secondaryColor: "#383838",
};

const prompt = `Crea un sito vetrina monopagina per "${site.businessName}", un ${site.businessType} con sede a ${site.city}.

Contatti / informazioni utili: indirizzo: ${site.address} · telefono: ${site.phone} · email: ${site.email} · orari: ${site.openingHours}

Palette colori: primario ${site.primaryColor}, secondario ${site.secondaryColor}.

Struttura desiderata: hero con headline + sottotitolo + CTA, sezione "Chi siamo", sezione menù/pizze, sezione contatti con mappa e orari, footer.
Tono di voce italiano, caldo e professionale. SEO local-business ottimizzato. Mobile-first.
Sottodominio richiesto: ${site.subdomain}.deskinc.app`;

const adminUrl = `https://deskindustries.com/admin/sites/${site.id}`;

const { template } = await import("/dev-server/src/lib/email-templates/follia-new-request-staff.tsx");
const data = { ...site, description: "", services: "", notes: "", prompt, adminUrl };
const element = React.createElement(template.component, data);
const html = await render(element);
const text = await render(element, { plainText: true });
const subject = typeof template.subject === "function" ? template.subject(data) : template.subject;

console.log("SUBJECT:", subject);
console.log("HTML_LEN:", html.length);

// Output JSON for psql
process.stdout.write("\n---PAYLOAD---\n");
process.stdout.write(JSON.stringify({ subject, html, text }));
