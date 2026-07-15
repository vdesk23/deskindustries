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
      { title: "Desk Industries — Gruppo di digitalizzazione per PMI" },
      {
        name: "description",
        content:
          "Desk Industries è un gruppo di digitalizzazione: team di agenti AI e specialisti che progettano soluzioni su misura per PMI. Marketing con Magnus, prodotti con Arkeo.",
      },
      { name: "author", content: "Desk Industries SRLS" },
      { property: "og:title", content: "Desk Industries — Gruppo di digitalizzazione per PMI" },
      {
        property: "og:description",
        content:
          "Team di agenti AI + specialisti per digitalizzare la tua azienda. Marketing (Magnus), prodotti proprietari (Arkeo), automazioni no-code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Desk Industries — Gruppo di digitalizzazione per PMI" },
      { name: "twitter:description", content: "Team di agenti AI + specialisti per digitalizzare la tua azienda." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
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
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <PaymentTestModeBanner />
        <Header />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}
