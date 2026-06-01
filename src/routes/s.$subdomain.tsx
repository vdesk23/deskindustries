import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicFolliaSite } from "@/lib/follia-public.functions";
import { MapPin, Phone, Mail, Clock, Eye } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  preview: z.union([z.literal("1"), z.literal("true"), z.boolean()]).optional(),
});

export const Route = createFileRoute("/s/$subdomain")({
  validateSearch: (s) => searchSchema.parse(s),
  component: PublicSitePage,
});

type Site = {
  id: string;
  subdomain: string;
  business_type: string;
  business_data: { name?: string; primary_color?: string; secondary_color?: string; generated?: any };
  config: { show_map?: boolean; opening_hours?: string; address?: string; phone?: string; email?: string };
  status?: string;
};

function PublicSitePage() {
  const { subdomain } = Route.useParams();
  const search = Route.useSearch();
  const isPreview = search.preview === true || search.preview === "1" || search.preview === "true";
  const fetchSite = useServerFn(getPublicFolliaSite);
  const [data, setData] = useState<{ site: Site | null; menu: any[]; products: any[]; services: any[] } | null>(null);

  useEffect(() => {
    fetchSite({ data: { subdomain, preview: isPreview } }).then((r) => setData(r as any));
  }, [fetchSite, subdomain, isPreview]);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Caricamento...</div>;
  if (!data.site) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Sito non trovato o non ancora pubblicato.</div>;

  const site = data.site;
  const gen = site.business_data?.generated || {};
  const name = site.business_data?.name || site.subdomain;
  const primary = site.business_data?.primary_color || "#6d28d9";
  const showPreviewBanner = isPreview && site.status !== "live";

  return (
    <div className="min-h-screen bg-background" style={{ ["--site-primary" as any]: primary }}>
      {showPreviewBanner && (
        <div className="sticky top-0 z-50 bg-amber text-amber-foreground px-5 py-3 text-sm flex flex-wrap items-center justify-center gap-3">
          <Eye className="size-4" />
          <span><strong>Anteprima gratuita</strong> — questo sito non è ancora pubblicato.</span>
          <a href="/account/sites" className="underline font-medium">Vai alla dashboard per pubblicarlo →</a>
        </div>
      )}

      <section className="py-20 lg:py-32 px-5 lg:px-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}15, transparent)` }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-display tracking-[0.3em] uppercase mb-4" style={{ color: primary }}>{name}</p>
          <h1 className="text-4xl lg:text-6xl font-display font-medium tracking-tight mb-4">{gen.hero_title || name}</h1>
          {gen.hero_subtitle && <p className="text-lg text-muted-foreground">{gen.hero_subtitle}</p>}
        </div>
      </section>

      {gen.about_body && (
        <section className="py-16 px-5 lg:px-8 max-w-3xl mx-auto text-center">
          {gen.about_title && <h2 className="text-3xl font-display font-medium mb-4">{gen.about_title}</h2>}
          <p className="text-muted-foreground leading-relaxed">{gen.about_body}</p>
        </section>
      )}

      {data.menu.length > 0 && (
        <section className="py-16 px-5 lg:px-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-medium mb-8 text-center">Menù</h2>
          <div className="grid gap-4">
            {data.menu.map((it: any) => (
              <div key={it.id} className="flex justify-between gap-4 border-b border-border py-4">
                <div>
                  <h3 className="font-display font-semibold">{it.name}</h3>
                  {it.description && <p className="text-sm text-muted-foreground mt-1">{it.description}</p>}
                </div>
                {it.price_cents != null && <p className="font-display font-medium whitespace-nowrap">€ {(it.price_cents / 100).toFixed(2)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.products.length > 0 && (
        <section className="py-16 px-5 lg:px-8 max-w-5xl mx-auto">
          <h2 className="text-3xl font-display font-medium mb-8 text-center">Prodotti</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.products.map((p: any) => (
              <div key={p.id} className="rounded-2xl border border-border p-5">
                <h3 className="font-display font-semibold">{p.name}</h3>
                {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
                {p.price_display && <p className="font-display font-medium mt-3" style={{ color: primary }}>{p.price_display}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.services.length > 0 && (
        <section className="py-16 px-5 lg:px-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-medium mb-8 text-center">Servizi</h2>
          <div className="grid gap-4">
            {data.services.map((s: any) => (
              <div key={s.id} className="flex justify-between gap-4 border-b border-border py-4">
                <div>
                  <h3 className="font-display font-semibold">{s.name}</h3>
                  {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                  {s.duration_minutes && <p className="text-xs text-muted-foreground mt-1">{s.duration_minutes} min</p>}
                </div>
                {s.price_cents != null && <p className="font-display font-medium whitespace-nowrap">€ {(s.price_cents / 100).toFixed(2)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-16 px-5 lg:px-8 max-w-4xl mx-auto border-t border-border">
        <h2 className="text-3xl font-display font-medium mb-8 text-center">Dove siamo</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {site.config?.address && <p className="flex gap-2"><MapPin className="size-4 mt-0.5 shrink-0" style={{ color: primary }} /> {site.config.address}</p>}
          {site.config?.phone && <p className="flex gap-2"><Phone className="size-4 mt-0.5 shrink-0" style={{ color: primary }} /> {site.config.phone}</p>}
          {site.config?.email && <p className="flex gap-2"><Mail className="size-4 mt-0.5 shrink-0" style={{ color: primary }} /> {site.config.email}</p>}
          {site.config?.opening_hours && <p className="flex gap-2 whitespace-pre-line"><Clock className="size-4 mt-0.5 shrink-0" style={{ color: primary }} /> {site.config.opening_hours}</p>}
        </div>
        {site.config?.show_map && site.config?.address && (
          <iframe
            title="Mappa"
            className="w-full h-80 mt-8 rounded-2xl border border-border"
            src={`https://www.google.com/maps?q=${encodeURIComponent(site.config.address)}&output=embed`}
            loading="lazy"
          />
        )}
      </section>

      <footer className="py-8 text-center text-xs text-muted-foreground border-t border-border">
        Realizzato con <a href="https://deskindustries.com/follia" className="underline" style={{ color: primary }}>Foll.IA</a> by Desk Industries
      </footer>
    </div>
  );
}
