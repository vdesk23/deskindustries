import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/contatti")({
  head: () => ({
    meta: [
      { title: "Contatti — Desk Industries" },
      { name: "description", content: "Prenota una call gratuita con Desk Industries." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Contatti"
      title="Parliamone."
      description="Form di contatto e prenotazione call in arrivo nel prossimo step."
    />
  ),
});
