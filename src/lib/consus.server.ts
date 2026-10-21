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
    redirect: "error",
    signal: AbortSignal.timeout(15000),
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
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`CONSUS lead [${res.status}]: ${text.slice(0, 300)}`);
  return JSON.parse(text) as { clientId?: string; quoteId?: string; userId?: string };
}

// These separate endpoints must be implemented in CONSUS. Never fall back to the
// legacy /lead endpoint: it creates a quote during contact registration.
export async function registerConsusLead(payload: Omit<ConsusLeadPayload, "serviceCodes" | "serviceNames" | "lookingFor">) {
  return sendIntake("register", payload, "leadId");
}

export async function createConsusQuote(payload: ConsusLeadPayload) {
  return sendIntake("quote", payload, "quoteId");
}

async function sendIntake(endpoint: "register" | "quote", payload: unknown, requiredId: "leadId" | "quoteId") {
  const response = await fetch(`${CONSUS_URL}/api/public/desk-intake/${endpoint}`, {
    method: "POST",
    headers: { "x-intake-secret": secret(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`CONSUS ${endpoint}: ${response.status}`);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !(requiredId in result) || typeof (result as Record<string, unknown>)[requiredId] !== "string") {
    throw new Error(`CONSUS ${endpoint}: invalid acknowledgement`);
  }
}

// Signed, short-lived capability binds the second anonymous submission to the
// contact that was registered; a caller cannot update another lead by guessing its ID.
export async function issueContinuation(leadId: string) {
  const payload = btoa(JSON.stringify({ leadId, expires: Date.now() + 86400000 })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const signature = await signContinuation(payload);
  return `${payload}.${signature}`;
}

async function continuationKey() {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signContinuation(payload: string) {
  const signature = await crypto.subtle.sign("HMAC", await continuationKey(), new TextEncoder().encode(`desk-intake:${payload}`));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyContinuation(token: string): Promise<string> {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !/^[a-f0-9]{64}$/.test(signature)) throw new Error("Invalid continuation");
  const bytes = Uint8Array.from(signature.match(/.{2}/g) ?? [], (value) => parseInt(value, 16));
  if (!(await crypto.subtle.verify("HMAC", await continuationKey(), bytes, new TextEncoder().encode(`desk-intake:${payload}`)))) throw new Error("Invalid continuation");
  const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { leadId?: unknown; expires?: unknown };
  if (typeof decoded.leadId !== "string" || !/^[a-f0-9-]{36}$/.test(decoded.leadId) || typeof decoded.expires !== "number" || decoded.expires < Date.now()) throw new Error("Expired continuation");
  return decoded.leadId;
}
