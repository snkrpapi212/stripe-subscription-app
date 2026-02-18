import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export { convexClient, api };
