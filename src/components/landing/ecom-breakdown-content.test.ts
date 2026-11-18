import { describe, expect, it } from "vitest";
import { ECOM_BREAKDOWN_QUESTIONS } from "./ecom-breakdown-content";

describe("ECOM Breakdown lead qualification", () => {
  it("distinguishes businesses that are offline from those already selling online", () => {
    const situation = ECOM_BREAKDOWN_QUESTIONS.find((question) => question.id === "Situazione attuale");

    expect(situation?.options).toContain("Non vendo ancora online");
    expect(situation?.options).toContain("Ho un e-commerce attivo");
  });

  it("captures whether the lead wants to start online or grow an existing e-commerce", () => {
    const goal = ECOM_BREAKDOWN_QUESTIONS.find((question) => question.id === "Obiettivo analisi");

    expect(goal?.options).toContain("Iniziare a vendere online");
    expect(goal?.options).toContain("Aumentare le vendite dell’e-commerce");
  });
});
