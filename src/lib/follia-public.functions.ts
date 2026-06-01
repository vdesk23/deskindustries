import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const inputSchema = z.object({
  subdomain: z.string().trim().toLowerCase().min(1).max(60),
  preview: z.boolean().optional(),
});

export const getPublicFolliaSite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    let query = supabase
      .from("follia_sites")
      .select("id, subdomain, business_type, business_data, config, status")
      .eq("subdomain", data.subdomain);
    if (!data.preview) {
      query = query.eq("status", "live");
    }
    const { data: site } = await query.maybeSingle();
    if (!site) return { site: null, menu: [], products: [], services: [] };

    const [menu, products, services] = await Promise.all([
      supabase.from("follia_menu_items").select("id, category, name, description, price_cents, position, available, image_url").eq("site_id", site.id).eq("available", true).order("position"),
      supabase.from("follia_products").select("id, category, name, description, price_display, image_url, in_stock, position").eq("site_id", site.id).eq("in_stock", true).order("position"),
      supabase.from("follia_services").select("id, name, description, price_cents, duration_minutes, bookable, position").eq("site_id", site.id).order("position"),
    ]);

    return {
      site,
      menu: menu.data || [],
      products: products.data || [],
      services: services.data || [],
    };
  });
