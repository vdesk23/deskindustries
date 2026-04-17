import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/pacchetti")({
  head: () => ({
    meta: [
      { title: "Pacchetti COCO Lite e Pro — Desk Industries" },
      {
        name: "description",
        content: "Due pacchetti per ogni fase di crescita: COCO Lite €197 e COCO Pro €997.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Pacchetti"
      title="COCO Lite & Pro"
      description="Confronto dettagliato dei pacchetti, FAQ e checkout in arrivo."
    />
  ),
});
