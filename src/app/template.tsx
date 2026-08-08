"use client";

import { ReactNode } from "react";

// Zero-blink, instant-smooth template wrapper for Next.js App Router
export default function Template({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
