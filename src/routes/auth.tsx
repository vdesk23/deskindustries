import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/account",
    mode: (search.mode as "login" | "signup") || "login",
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

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(search.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (user) navigate({ to: search.redirect, replace: true });
  }, [user, navigate, search.redirect]);

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
