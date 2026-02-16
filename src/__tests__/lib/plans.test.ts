import { describe, it, expect } from "vitest";
import { PLANS, isPlanAtLeast, getPlanFromPriceId } from "@/lib/plans";
import type { PlanKey } from "@/lib/plans";

describe("PLANS", () => {
  it("defines three plans: free, pro, team", () => {
    expect(Object.keys(PLANS)).toEqual(["free", "pro", "team"]);
  });

  it("free plan has null priceId", () => {
    expect(PLANS.free.priceId).toBeNull();
  });

  it("pro plan has priceId from env", () => {
    expect(PLANS.pro.priceId).toBe("price_pro_123");
  });

  it("team plan has priceId from env", () => {
    expect(PLANS.team.priceId).toBe("price_team_456");
  });

  it("each plan has required fields", () => {
    for (const key of Object.keys(PLANS) as PlanKey[]) {
      const plan = PLANS[key];
      expect(plan).toHaveProperty("name");
      expect(plan).toHaveProperty("description");
      expect(plan).toHaveProperty("price");
      expect(plan).toHaveProperty("features");
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });
});

describe("isPlanAtLeast", () => {
  it("free is at least free", () => {
    expect(isPlanAtLeast("free", "free")).toBe(true);
  });

  it("free is NOT at least pro", () => {
    expect(isPlanAtLeast("free", "pro")).toBe(false);
  });

  it("free is NOT at least team", () => {
    expect(isPlanAtLeast("free", "team")).toBe(false);
  });

  it("pro is at least free", () => {
    expect(isPlanAtLeast("pro", "free")).toBe(true);
  });

  it("pro is at least pro", () => {
    expect(isPlanAtLeast("pro", "pro")).toBe(true);
  });

  it("pro is NOT at least team", () => {
    expect(isPlanAtLeast("pro", "team")).toBe(false);
  });

  it("team is at least free", () => {
    expect(isPlanAtLeast("team", "free")).toBe(true);
  });

  it("team is at least pro", () => {
    expect(isPlanAtLeast("team", "pro")).toBe(true);
  });

  it("team is at least team", () => {
    expect(isPlanAtLeast("team", "team")).toBe(true);
  });
});

describe("getPlanFromPriceId", () => {
  it("returns 'pro' for pro price ID", () => {
    expect(getPlanFromPriceId("price_pro_123")).toBe("pro");
  });

  it("returns 'team' for team price ID", () => {
    expect(getPlanFromPriceId("price_team_456")).toBe("team");
  });

  it("returns 'free' for unknown price ID", () => {
    expect(getPlanFromPriceId("price_unknown")).toBe("free");
  });

  it("returns 'free' for empty string", () => {
    expect(getPlanFromPriceId("")).toBe("free");
  });
});
