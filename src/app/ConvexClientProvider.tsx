"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL! as string);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Set auth token synchronously at component initialization to avoid
  // a flash where the client is unauthenticated before useEffect runs.
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("convex_auth_token");
    convex.setAuth(async () => token);
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
