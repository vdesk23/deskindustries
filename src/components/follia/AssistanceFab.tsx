import { useState } from "react";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { createFolliaTicketV2, uploadTicketAttachment } from "@/lib/follia-account.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LifeBuoy, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

type Category = "domain" | "branding" | "copy" | "general";

const CATEGORY_LABELS: Record<Category, string> = {
  domain: "Dominio",
  branding: "Colori e logo",
  copy: "Scritte e titoli",
  general: "Altro",
};

interface Props {
  siteId: string;
  siteName: string;
  hasFullAssistance: boolean;
}

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

export function AssistanceFab({ siteId, siteName, hasFullAssistance }: Props) {
  const [category, setCategory] = useState<Category | null>(null);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const createTicket = useServerFn(createFolliaTicketV2);
  const requestUpload = useServerFn(uploadTicketAttachment);
  const navigate = useNavigate();

  const reset = () => {
    setCategory(null);
    setBody("");
    setFiles([]);
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    const allowed: File[] = [];
    for (const f of list) {
      if (files.length + allowed.length >= MAX_FILES) {
        toast.error(`Massimo ${MAX_FILES} file`);
        break;
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} supera 10 MB`);
        continue;
      }
      allowed.push(f);
    }
    setFiles((prev) => [...prev, ...allowed]);
    e.target.value = "";
  };

  const submit = async () => {
    if (!category) return;
    if (body.trim().length < 10) {
      toast.error("Descrivi la richiesta (almeno 10 caratteri)");
      return;
    }
    setSubmitting(true);
    try {
      // Upload attachments first
      setUploading(true);
      const uploaded: Array<{ name: string; path: string; size: number }> = [];
      for (const f of files) {
        const { path, signedUrl } = await requestUpload({
          data: { fileName: f.name, contentType: f.type || "application/octet-stream", size: f.size },
        });
        const up = await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": f.type || "application/octet-stream" },
          body: f,
        });
        if (!up.ok) throw new Error(`Upload fallito: ${f.name}`);
        uploaded.push({ name: f.name, path, size: f.size });
      }
      setUploading(false);

      const r = await createTicket({
        data: { siteId, category, body, attachments: uploaded },
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      if (r.requiresPayment) {
        toast.success("Ticket creato — completa il pagamento per attivarlo");
        navigate({ to: "/account/tickets/$ticketId/pay", params: { ticketId: r.ticketId } });
      } else {
        toast.success("Ticket inviato. Il team risponderà via email.");
      }
      reset();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const subject = category ? `${CATEGORY_LABELS[category]} — ${siteName}` : "";

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="amber" size="lg" className="shadow-lg rounded-full">
              <LifeBuoy className="size-5" />
              Richiedi assistenza
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>Su cosa ti serve aiuto?</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
              <DropdownMenuItem key={c} onClick={() => setCategory(c)}>
                {CATEGORY_LABELS[c]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={category !== null} onOpenChange={(o) => !o && reset()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo ticket di assistenza</DialogTitle>
            <DialogDescription>
              {hasFullAssistance
                ? "Incluso nel tuo piano. Nessun costo."
                : "Apertura ticket €50 + IVA. Riceverai il link di pagamento; il ticket verrà preso in carico al pagamento."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Oggetto</Label>
              <Input value={subject} readOnly disabled />
            </div>

            <div className="space-y-1.5">
              <Label>Descrivi la richiesta</Label>
              <Textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Cosa serve modificare? Quanto più sei specifico, prima il team può intervenire."
                maxLength={4000}
              />
              <p className="text-xs text-muted-foreground">{body.length}/4000</p>
            </div>

            <div className="space-y-1.5">
              <Label>Allegati (opzionali) — max 5 file, 10 MB l'uno</Label>
              <label className="inline-flex">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={onPickFiles}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-3 h-9 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent">
                  <Paperclip className="size-4" /> Aggiungi file
                </span>
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-xs bg-muted/50 px-2 py-1 rounded">
                      <span className="truncate mr-2">
                        {f.name} <span className="text-muted-foreground">({Math.round(f.size / 1024)} KB)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={reset} disabled={submitting}>
              Annulla
            </Button>
            <Button variant="amber" onClick={submit} disabled={submitting}>
              {uploading ? "Caricamento allegati..." : submitting ? "Invio..." : "Invia richiesta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
