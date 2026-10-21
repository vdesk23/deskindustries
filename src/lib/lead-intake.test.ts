import { describe, expect, it } from "vitest";
import { registrationSchema, quoteRequestSchema, groupServices, resolveServices } from "./lead-intake";

describe("two-step commercial intake", () => {
  it("accepts contact registration without services or quote details", () => {
    expect(registrationSchema.parse({ action: "register", name: "Mario Rossi", email: "mario@example.com", phone: "", business: "", sector: "Retail" }).action).toBe("register");
  });
  it("requires at least one Sibill service for the second step", () => {
    expect(quoteRequestSchema.safeParse({ action: "quote", continuation: "token", serviceCodes: [], lookingFor: "Nuovo sito" }).success).toBe(false);
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