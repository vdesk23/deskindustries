import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/metodo-coco")({
  head: () => ({
    meta: [
      { title: "Metodo COCO — Desk Industries" },
      {
        name: "description",
        content:
          "Costruire Online per Cementificare Offline: il metodo Desk Industries per le attività locali.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Il metodo"
      title="COCO — il metodo"
      description="La pagina dettagliata del metodo COCO arriva nel prossimo step."
    />
  ),
});
