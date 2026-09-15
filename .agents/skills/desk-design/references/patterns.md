# Pattern pronti — Desk Industries

## Animazione base

```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};
```

## Intestazione di sezione

```tsx
<section className="relative py-24 lg:py-32">
  <div className="mx-auto max-w-7xl px-5 lg:px-8">
    <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
      <div className="lg:col-span-7">
        <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">Etichetta</p>
        <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
          Titolo con <span className="italic text-amber font-normal">parola chiave</span>.
        </h2>
      </div>
      <div className="lg:col-span-5">
        <p className="text-lg text-muted-foreground">Testo di supporto, una o due frasi.</p>
      </div>
    </div>
  </div>
</section>
```

## Card grande (gruppo / progetti)

```tsx
<Card3D className="group h-full p-8 rounded-3xl bg-surface-elevated/50 backdrop-blur-xl border border-border overflow-hidden">
  <div className="absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br from-amber to-amber/60 opacity-30 blur-3xl" />
  <div className="relative">
    <p className="text-xs uppercase tracking-widest text-amber mb-4">TAG</p>
    <h3 className="text-3xl font-display font-semibold mb-4">Titolo</h3>
    <p className="text-muted-foreground leading-relaxed">Descrizione.</p>
    <div className="mt-8 inline-flex items-center gap-1.5 text-sm text-foreground">
      Scopri <ArrowUpRight className="size-4 text-amber" />
    </div>
  </div>
</Card3D>
```

## Card feature con icona

```tsx
<Card3D intensity={6} className="p-6 rounded-2xl border border-border bg-surface-elevated/50 backdrop-blur-xl h-full">
  <div className="size-12 rounded-xl bg-amber-soft flex items-center justify-center mb-5">
    <Icon className="size-5 text-amber" />
  </div>
  <h3 className="font-display font-semibold text-lg mb-2">Titolo</h3>
  <p className="text-sm text-muted-foreground leading-relaxed">Descrizione breve.</p>
</Card3D>
```

## CTA principale

```tsx
<a href="#lead">
  <Card3D className="rounded-full" intensity={12}>
    <Button variant="hero" size="xl" className="rounded-full">
      Richiedi una consulenza <ArrowRight />
    </Button>
  </Card3D>
</a>
```

## Eyebrow badge (hero)

```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur-xl px-3 py-1.5 text-xs text-muted-foreground">
  <span className="size-1.5 rounded-full bg-amber animate-pulse" />
  Soluzioni Digitali, Impatto Reale.
</div>
```

## Blocco statistiche

```tsx
<div className="min-w-[160px] border-t-2 border-amber pt-4 px-6">
  <div className="text-3xl lg:text-4xl font-display font-semibold">40+</div>
  <div className="mt-1 text-sm text-muted-foreground leading-snug">MPMI digitalizzate</div>
</div>
```

## head() di una rotta

```tsx
export const Route = createFileRoute("/servizi")({
  head: () => ({
    meta: [
      { title: "Servizi di automazione per MPMI | Desk Industries" },
      { name: "description", content: "Automazioni, agenti AI e siti su misura per far crescere la tua attività. Prima call gratuita." },
      { property: "og:title", content: "Servizi di automazione per MPMI | Desk Industries" },
      { property: "og:description", content: "Automazioni, agenti AI e siti su misura per far crescere la tua attività." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiziPage,
});
```

## Copy: sì / no

| Sì | No |
| --- | --- |
| "Ti facciamo risparmiare tempo e risorse." | "Soluzioni innovative all'avanguardia." |
| "Prima call gratuita, 30 minuti, senza impegno." | "Contattaci per maggiori informazioni." |
| "500+ flussi di automazione attivi." | "Leader nel settore digitale." |
