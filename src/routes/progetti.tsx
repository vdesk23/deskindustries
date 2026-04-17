import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/progetti")({
  head: () => ({
    meta: [
      { title: "Progetti — Desk Industries" },
      { name: "description", content: "Ecosistema Desk: Foll.IA e gli altri progetti." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Progetti"
      title="L'ecosistema Desk"
      description="Vetrina dei progetti interni — Foll.IA in primis — in arrivo."
    />
  ),
});
