import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminListTickets, adminReplyTicket } from "@/lib/follia-admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/tickets")({
  component: AdminTickets,
});

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  requires_payment: boolean;
  paid_at: string | null;
  customer_email: string | null;
  site_id: string;
  created_at: string;
};

function AdminTickets() {
  const list = useServerFn(adminListTickets);
  const reply = useServerFn(adminReplyTicket);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [body, setBody] = useState("");

  useEffect(() => {
    list().then((r) => setTickets(r.tickets as Ticket[]));
  }, [list]);

  const send = async (id: string) => {
    if (!body.trim()) return;
    try {
      await reply({ data: { ticketId: id, body } });
      setBody(""); setOpenId(null);
      alert("Risposta inviata.");
    } catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="space-y-3">
      {tickets.length === 0 ? <p className="text-muted-foreground">Nessun ticket.</p> : tickets.map((t) => (
        <div key={t.id} className="rounded-2xl border border-border bg-surface-elevated p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] uppercase tracking-wider text-amber">{t.status} · {t.category}{t.requires_payment ? (t.paid_at ? " · pagato" : " · in attesa pagamento") : ""}</p>
              <h3 className="font-display font-semibold">{t.subject}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t.customer_email || "—"} · {new Date(t.created_at).toLocaleString("it-IT")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setOpenId(openId === t.id ? null : t.id)}>
              {openId === t.id ? "Chiudi" : "Rispondi"}
            </Button>
          </div>
          {openId === t.id && (
            <div className="mt-4 space-y-2">
              <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Risposta come staff…" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <Button variant="amber" size="sm" onClick={() => send(t.id)}>Invia risposta</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
