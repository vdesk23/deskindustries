import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/chi-siamo")({
  head: () => ({
    meta: [
      { title: "Chi siamo — Desk Industries" },
      {
        name: "description",
        content: "Desk Industries SRLS: agenzia di marketing per le attività locali.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Chi siamo"
      title="Desk Industries SRLS"
      description="Storia dell'agenzia, valori e team in arrivo nel prossimo step."
    />
  ),
});
