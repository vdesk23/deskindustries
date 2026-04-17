import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Annulla iscrizione — Desk Industries" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UnsubscribePage,
});

type Status = "loading" | "valid" | "already" | "invalid" | "submitting" | "success" | "error";

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const confirm = async () => {
    setStatus("submitting");
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else if (data.reason === "already_unsubscribed") setStatus("already");
      else {
        setError(data.error || "Errore durante l'operazione");
        setStatus("error");
      }
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface-elevated p-8 lg:p-10 text-center">
        <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
          Iscrizione email
        </p>

        {status === "loading" && <p className="text-muted-foreground">Verifica in corso...</p>}

        {status === "valid" && (
          <>
            <h1 className="text-2xl font-display font-medium mb-3">Conferma annullamento</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Confermando, non riceverai più email da Desk Industries.
            </p>
            <button
              onClick={confirm}
              className="inline-flex items-center justify-center rounded-full bg-amber px-6 py-3 text-sm font-medium text-amber-foreground hover:brightness-110 transition"
            >
              Conferma annullamento
            </button>
          </>
        )}

        {status === "submitting" && (
          <p className="text-muted-foreground">Annullamento in corso...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-display font-medium mb-3">Iscrizione annullata</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Non riceverai più email da noi. Ci dispiace vederti andare.
            </p>
            <Link to="/" className="text-amber hover:underline text-sm">
              ← Torna alla home
            </Link>
          </>
        )}

        {status === "already" && (
          <>
            <h1 className="text-2xl font-display font-medium mb-3">Già annullata</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Questa iscrizione è già stata annullata in precedenza.
            </p>
            <Link to="/" className="text-amber hover:underline text-sm">
              ← Torna alla home
            </Link>
          </>
        )}

        {status === "invalid" && (
          <>
            <h1 className="text-2xl font-display font-medium mb-3">Link non valido</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Il link è scaduto o non valido. Se hai bisogno di aiuto, contattaci.
            </p>
            <Link to="/contatti" className="text-amber hover:underline text-sm">
              Contattaci
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-display font-medium mb-3">Errore</h1>
            <p className="text-sm text-destructive mb-6">{error}</p>
            <button
              onClick={confirm}
              className="inline-flex items-center justify-center rounded-full bg-amber px-6 py-3 text-sm font-medium text-amber-foreground"
            >
              Riprova
            </button>
          </>
        )}
      </div>
    </section>
  );
}
