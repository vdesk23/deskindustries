import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { claimFolliaSite } from "@/lib/follia-account.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthSearch = {
  redirect: string;
  mode: "login" | "signup";
  email?: string;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: (search.redirect as string) || "/account",
    mode: (search.mode as "login" | "signup") || "login",
    email: (search.email as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Accedi — Desk Industries" },
      { name: "description", content: "Accedi alla tua area cliente Desk Industries." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

// Extract a Follia site UUID from a redirect like "/account/sites/<uuid>"
function extractFolliaSiteId(redirect: string): string | null {
  const m = redirect.match(/^\/account\/sites\/([0-9a-f-]{36})(?:[/?#]|$)/i);
  return m ? m[1] : null;
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const claimSite = useServerFn(claimFolliaSite);
  const [mode, setMode] = useState<"login" | "signup">(search.mode);
  const [email, setEmail] = useState(search.email || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!user) return;
    const siteId = extractFolliaSiteId(search.redirect);
    if (siteId) {
      claimSite({ data: { siteId } })
        .catch(() => {})
        .finally(() => navigate({ to: search.redirect, replace: true }));
    } else {
      navigate({ to: search.redirect, replace: true });
    }
  }, [user, navigate, search.redirect, claimSite]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${search.redirect}`,
            data: { full_name: fullName },
          },
        });
        if (err) throw err;
        setInfo("Controlla la tua email per confermare l'account.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message ?? "Errore Google sign-in");
      if (result.redirected) return;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border bg-surface-elevated p-8 lg:p-10">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            Area clienti
          </p>
          <h1 className="text-3xl font-display font-medium tracking-tight">
            {mode === "login" ? "Bentornato." : "Crea il tuo account."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Accedi per gestire il tuo abbonamento."
              : "Imposta una password per gestire il tuo abbonamento."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-amber bg-amber/10 rounded-md px-3 py-2">{info}</p>
            )}

            <Button type="submit" variant="amber" size="lg" className="w-full" disabled={loading}>
              {loading ? "Attendere..." : mode === "login" ? "Accedi" : "Crea account"}
              {!loading && <ArrowRight />}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">oppure</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full mt-4"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.86 3.36 14.65 2.4 12 2.4 6.92 2.4 2.8 6.52 2.8 11.6S6.92 20.8 12 20.8c6.93 0 9.2-4.86 9.2-7.41 0-.5-.05-.88-.12-1.19H12z"/>
            </svg>
            Continua con Google
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>

                Nuovo qui?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-amber hover:underline font-medium"
                >
                  Crea un account
                </button>
              </>
            ) : (
              <>
                Hai già un account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-amber hover:underline font-medium"
                >
                  Accedi
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Torna alla home
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
