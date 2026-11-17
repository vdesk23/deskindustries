import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { CookieBanner } from "@/components/CookieBanner";
import { AuthProvider } from "@/hooks/useAuth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">404</p>
        <h1 className="text-5xl font-display font-semibold text-foreground">Pagina non trovata</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          La pagina che cerchi non esiste o è stata spostata.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-amber px-6 py-3 text-sm font-medium text-amber-foreground hover:brightness-110 transition"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Desk Industries — E-commerce e digitale per negozi fisici" },
      {
        name: "description",
        content:
          "Portiamo il tuo negozio fisico online: e-commerce, sync cassa e magazzino, agenti AI, advertising drive-to-store e branding. Zero vincoli, paghi a consumo.",
      },
      { name: "author", content: "Desk Industries SRLS" },
      { property: "og:title", content: "Desk Industries — E-commerce e digitale per negozi fisici" },
      {
        property: "og:description",
        content:
          "Dal negozio fisico all'e-commerce scalabile: inventario, logistica, vendite e branding. Zero vincoli contrattuali.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Desk Industries" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Desk Industries — E-commerce e digitale per negozi fisici" },
      { name: "twitter:description", content: "Dal negozio fisico all'e-commerce scalabile: inventario, logistica, vendite e branding. Zero vincoli contrattuali." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.deskindustries.com/#organization",
              name: "Desk Industries",
              legalName: "Desk Industries SRLS",
              url: "https://www.deskindustries.com",
              sameAs: ["https://www.desution.com"],
              logo: "https://www.deskindustries.com/favicon.png",
            },
            {
              "@type": "WebSite",
              "@id": "https://www.deskindustries.com/#website",
              url: "https://www.deskindustries.com",
              name: "Desk Industries",
              publisher: { "@id": "https://www.deskindustries.com/#organization" },
              inLanguage: "it-IT",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col text-foreground relative">
        <PaymentTestModeBanner />
        <Header />
        <main className="flex-1 pb-28">
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}
