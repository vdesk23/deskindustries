import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Save, Upload, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPostForEdit, upsertPost, uploadCoverImage } from "@/lib/blog.functions";

export const Route = createFileRoute("/admin/blog/$id")({
  component: AdminBlogEditor,
});

const CATEGORIES = [
  { v: "case-study", l: "Case study" },
  { v: "news", l: "News" },
  { v: "insight", l: "Insight" },
];

function AdminBlogEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const load = useServerFn(getPostForEdit);
  const save = useServerFn(upsertPost);
  const upload = useServerFn(uploadCoverImage);

  const [post, setPost] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    load({ data: { id } }).then(setPost).catch((e) => setMsg(e.message));
  }, [id, load]);

  if (!post) return <p className="text-muted-foreground">Caricamento…</p>;

  function update<K extends string>(k: K, v: any) {
    setPost((p: any) => ({ ...p, [k]: v }));
  }

  async function onSave(e?: FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await save({
        data: {
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt ?? "",
          cover_url: post.cover_url ?? "",
          content_md: post.content_md ?? "",
          category: post.category,
          tags: Array.isArray(post.tags) ? post.tags : [],
          author_name: post.author_name || "Desk Industries",
          published: post.published,
        } as any,
      });
      setMsg("Salvato ✓");
      setTimeout(() => setMsg(null), 2500);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Errore");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const buf = await f.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const r = await upload({
        data: { filename: f.name, contentBase64: b64, contentType: f.type || "image/jpeg" },
      });
      update("cover_url", r.url);
      setMsg("Immagine caricata ✓");
      setTimeout(() => setMsg(null), 2500);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Errore upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-amber">
          <ArrowLeft className="size-4" /> Torna alla lista
        </Link>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          <Button type="button" variant="outline" onClick={() => setPreview((p) => !p)}>
            <Eye className="size-4" /> {preview ? "Modifica" : "Anteprima"}
          </Button>
          <Button type="submit" variant="amber" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Salva
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div>
            <Label>Titolo</Label>
            <Input value={post.title} onChange={(e) => update("title", e.target.value)} className="text-2xl h-12" required />
          </div>
          <div>
            <Label>Estratto</Label>
            <Textarea value={post.excerpt ?? ""} onChange={(e) => update("excerpt", e.target.value)} rows={2} />
          </div>

          {preview ? (
            <div className="rounded-2xl border border-border bg-surface-elevated p-6 min-h-[500px] prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
            </div>
          ) : (
            <div>
              <Label>Contenuto (Markdown)</Label>
              <Textarea
                value={post.content_md ?? ""}
                onChange={(e) => update("content_md", e.target.value)}
                rows={24}
                className="font-mono text-sm"
              />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="published" className="cursor-pointer">Pubblicato</Label>
              <input
                id="published"
                type="checkbox"
                checked={post.published}
                onChange={(e) => update("published", e.target.checked)}
                className="size-5 accent-amber"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={post.slug} onChange={(e) => update("slug", e.target.value.toLowerCase())} pattern="[a-z0-9-]+" required />
            </div>
            <div>
              <Label>Categoria</Label>
              <select
                value={post.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
              </select>
            </div>
            <div>
              <Label>Tag (separati da virgola)</Label>
              <Input
                value={(post.tags || []).join(", ")}
                onChange={(e) => update("tags", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              />
            </div>
            <div>
              <Label>Autore</Label>
              <Input value={post.author_name || ""} onChange={(e) => update("author_name", e.target.value)} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-3">
            <Label>Immagine di copertina</Label>
            {post.cover_url ? (
              <img src={post.cover_url} alt="cover" className="w-full rounded-lg border border-border" />
            ) : (
              <div className="aspect-[16/10] rounded-lg bg-surface flex items-center justify-center text-muted-foreground text-sm">
                Nessuna immagine
              </div>
            )}
            <label className="block">
              <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
              <span className={`inline-flex w-full items-center justify-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-accent ${uploading ? "opacity-50" : ""}`}>
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {uploading ? "Caricamento..." : "Carica immagine"}
              </span>
            </label>
            <Input value={post.cover_url ?? ""} onChange={(e) => update("cover_url", e.target.value)} placeholder="oppure URL manuale" />
          </div>
        </aside>
      </div>
    </form>
  );
}
