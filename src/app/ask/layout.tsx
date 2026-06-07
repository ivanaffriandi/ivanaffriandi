import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask",
  description: "Ask a question or chat with Ivan AI.",
  openGraph: {
    title: "Ask",
    description: "Ask a question or chat with Ivan AI.",
    url: "https://ivanaffriandi.com/ask",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask",
    description: "Ask a question or chat with Ivan AI.",
  }
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
