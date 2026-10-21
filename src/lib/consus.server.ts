// Server-only bridge to CONSUS (Desk PM). CONSUS owns Sibill pricing, clients and the sales pipeline.
// Desk Industries never receives prices: CONSUS's catalog endpoint returns code/name/category only.

const CONSUS_URL = "https://project--9c11710f-93d6-4339-9fe9-6c7d82dcf3c1.lovable.app";

export type PublicService = { code: string; name: string; category: string };

function secret() {
  const s = process.env["CONSUS_INTAKE_SECRET"];
  if (!s) throw new Error("CONSUS_INTAKE_SECRET mancante");
  return s;
}

export async function fetchConsusCatalog(): Promise<PublicService[]> {
  const res = await fetch(`${CONSUS_URL}/api/public/desk-intake/catalog`, {
    headers: { "x-intake-secret": secret(), Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`CONSUS catalog [${res.status}]: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { services?: unknown[] };
  // Whitelist fields even if CONSUS ever sends more (never leak prices to the browser).
  return (json.services ?? [])
    .map((s) => s as Record<string, unknown>)
    .filter((s) => typeof s.code === "string" && typeof s.name === "string")
    .map((s) => ({
      code: String(s.code).slice(0, 60),
      name: String(s.name).slice(0, 160),
      category: typeof s.category === "string" ? s.category.slice(0, 60) : "Servizi",
    }));
}

export type ConsusLeadPayload = {
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  business?: string;
  sector: string;
  serviceCodes: string[];
  serviceNames: string[];
  lookingFor: string;
};

export async function pushLeadToConsus(payload: ConsusLeadPayload) {
  const res = await fetch(`${CONSUS_URL}/api/public/desk-intake/lead`, {
    method: "POST",
    headers: { "x-intake-secret": secret(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`CONSUS lead [${res.status}]: ${text.slice(0, 300)}`);
  return JSON.parse(text) as { clientId?: string; quoteId?: string; userId?: string };
}
