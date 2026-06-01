import { render } from "@react-email/components";
import React from "react";
import { template } from "/dev-server/src/lib/email-templates/follia-new-request-staff.tsx";

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
const prompt = `Crea un sito vetrina monopagina per "${site.businessName}", un ${site.businessType} con sede a ${site.city}.\n\nContatti: ${site.address} · tel ${site.phone} · email ${site.email} · orari: ${site.openingHours}\n\nPalette: primario ${site.primaryColor}, secondario ${site.secondaryColor}.\n\nStruttura: hero + CTA, "Chi siamo", menù pizze, contatti con mappa e orari, footer.\nTono italiano caldo e professionale. SEO local-business. Mobile-first.\nSottodominio: ${site.subdomain}.deskinc.app`;
const adminUrl = `https://deskindustries.com/admin/sites/${site.id}`;
const data = { ...site, description: "", services: "", notes: "", prompt, adminUrl };
const el = React.createElement(template.component, data);
const html = await render(el);
const text = await render(el, { plainText: true });
const subject = typeof template.subject === "function" ? template.subject(data) : template.subject;
process.stdout.write(JSON.stringify({ subject, html, text }));
