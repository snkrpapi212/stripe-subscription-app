import "@testing-library/jest-dom/vitest";

// Set env vars before any module loads - PLANS reads these at evaluation time
process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = "price_pro_123";
process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID = "price_team_456";
