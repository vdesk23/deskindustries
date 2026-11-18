import { describe, expect, it } from "vitest";
import { registrationSchema, quoteRequestSchema, groupServices, resolveServices, shouldSendLeadPortfolio, STORE_CATEGORIES, STORE_SITUATIONS } from "./lead-intake";

const company = { business: "Boutique Rossi srl", vatNumber: "12345678901", address: "Via Roma 1", city: "Roma" };
const baseQuote = { action: "quote", continuation: "token", sector: STORE_CATEGORIES[0], situation: STORE_SITUATIONS[0], serviceCodes: ["SEO"], company };

describe("two-step commercial intake", () => {
  it("accepts contact registration without services or quote details", () => {
    expect(registrationSchema.parse({ action: "register", name: "Mario Rossi", email: "mario@example.com", phone: "", business: "", sector: "Retail" }).action).toBe("register");
  });
  it("requires at least one Sibill service for the second step", () => {
    expect(quoteRequestSchema.safeParse({ ...baseQuote, serviceCodes: [] }).success).toBe(false);
  });
  it("step 1 creates the contact with only name, email and phone", () => {
    expect(registrationSchema.safeParse({ action: "register", name: "Mario Rossi", email: "mario@example.com", phone: "333" }).success).toBe(true);
  });
  it("accepts corrected contact details with the existing lead continuation", () => {
    const corrected = registrationSchema.parse({ action: "register", continuation: "existing-lead-token", name: "Maria Rossi", email: "maria@example.com", phone: "3331234567" });
    expect(corrected.continuation).toBe("existing-lead-token");
    expect(corrected.name).toBe("Maria Rossi");
    expect(corrected.email).toBe("maria@example.com");
    expect(corrected.phone).toBe("3331234567");
  });
  it("leaves the goal text optional", () => {
    expect(quoteRequestSchema.safeParse(baseQuote).success).toBe(true);
  });
  it("sends the portfolio on first registration", () => {
    expect(shouldSendLeadPortfolio(undefined, "maria@example.com")).toBe(true);
  });
  it("sends a new portfolio to a corrected email", () => {
    expect(shouldSendLeadPortfolio("typo@example.com", "maria@example.com")).toBe(true);
  });
  it("does not resend the portfolio for unchanged email or other contact corrections", () => {
    expect(shouldSendLeadPortfolio("maria@example.com", " MARIA@example.com ")).toBe(false);
  });
  it("requires company data for the quote", () => {
    expect(quoteRequestSchema.safeParse({ ...baseQuote, company: { ...company, vatNumber: "" } }).success).toBe(false);
  });
  it("groups generic catalog entries by service sector", () => {
    expect(groupServices([{ code: "SEO", name: "Audit SEO", category: "Servizi" }, { code: "ADS", name: "Google Ads", category: "Servizi" }]).map(([category]) => category)).toEqual(["Sviluppo Web / Mobile", "Advertising"]);
  });
  it("categorizes automation services rather than placing them in other services", () => {
    expect(groupServices([{ code: "AUTO", name: "Automazioni per Email Marketing", category: "Servizi" }])[0]?.[0]).toBe("Automazioni");
  });
  it("uses official catalog names and rejects unknown services", () => {
    expect(resolveServices(["SEO", "SEO"], [{ code: "SEO", name: "Audit SEO", category: "Web" }])).toEqual([{ code: "SEO", name: "Audit SEO", category: "Web" }]);
    expect(() => resolveServices(["FAKE"], [])).toThrow();
  });
});