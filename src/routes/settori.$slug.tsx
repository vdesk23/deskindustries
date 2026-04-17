import { createFileRoute, notFound } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

const SECTORS: Record<string, { label: string; tagline: string }> = {
  barbieri: { label: "Barbieri", tagline: "Riempi la sedia tutti i giorni." },
  tatuatori: { label: "Tatuatori", tagline: "Mostra la tua arte, prenota la tua agenda." },
  pizzerie: { label: "Pizzerie", tagline: "Più clienti in sala e a domicilio." },
  "centri-estetici": { label: "Centri estetici", tagline: "Costruisci una clientela fidelizzata." },
  palestre: { label: "Palestre", tagline: "Acquisisci nuovi iscritti ogni mese." },
};

export const Route = createFileRoute("/settori/$slug")({
  loader: ({ params }) => {
    const sector = SECTORS[params.slug];
    if (!sector) throw notFound();
    return { sector };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Marketing per ${loaderData.sector.label} — Desk Industries` },
          { name: "description", content: loaderData.sector.tagline },
        ]
      : [],
  }),
  component: SectorPage,
  notFoundComponent: () => (
    <ComingSoon eyebrow="404" title="Settore non trovato" description="Torna ai settori." />
  ),
});

function SectorPage() {
  const { sector } = Route.useLoaderData();
  return (
    <ComingSoon
      eyebrow={`Settore — ${sector.label}`}
      title={sector.tagline}
      description={`Pagina dedicata ${sector.label.toLowerCase()} con casi studio, pacchetti e strategie verticali in arrivo.`}
    />
  );
}
