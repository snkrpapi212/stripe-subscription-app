import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    env: { NODE_ENV: "test" },
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: /.*\/convex\/_generated\/api/,
        replacement: path.resolve(__dirname, "./src/__tests__/__mocks__/convex-api.ts"),
      },
    ],
  },
});
