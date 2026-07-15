import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAllPosts, deletePost, upsertPost } from "@/lib/blog.functions";

export const Route = createFileRoute("/admin/blog/")({
  component: AdminBlogList,
});

function AdminBlogList() {
  const list = useServerFn(listAllPosts);
  const del = useServerFn(deletePost);
  const create = useServerFn(upsertPost);
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => list().then(setPosts).catch(() => setPosts([]));
  useEffect(() => { refresh(); }, []);

  async function onNew() {
    setBusy(true);
    try {
      const slug = `bozza-${Date.now()}`;
      const r = await create({
        data: {
          slug,
          title: "Nuovo articolo",
          content_md: "# Titolo\n\nScrivi qui...",
          category: "insight",
          tags: [],
          author_name: "Desk Industries",
          published: false,
          excerpt: "",
          cover_url: "",
        } as any,
      });
      navigate({ to: "/admin/blog/$id", params: { id: r.id } });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Eliminare questo articolo?")) return;
    await del({ data: { id } });
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold">Articoli</h2>
        <Button onClick={onNew} disabled={busy} variant="amber">
          <Plus className="size-4" /> Nuovo articolo
        </Button>
      </div>

      {posts === null ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">Nessun articolo ancora.</p>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-left">
              <tr>
                <th className="p-3">Titolo</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Stato</th>
                <th className="p-3">Modificato</th>
                <th className="p-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 font-medium">{p.title}<div className="text-xs text-muted-foreground">/{p.slug}</div></td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">
                    {p.published ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-500">Pubblicato</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Bozza</span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString("it-IT")}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {p.published && (
                        <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-muted-foreground hover:text-amber" target="_blank">
                          <ExternalLink className="size-4" />
                        </Link>
                      )}
                      <Link to="/admin/blog/$id" params={{ id: p.id }} className="text-amber hover:brightness-110">
                        <Pencil className="size-4" />
                      </Link>
                      <button onClick={() => onDelete(p.id)} className="text-destructive hover:brightness-110">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
