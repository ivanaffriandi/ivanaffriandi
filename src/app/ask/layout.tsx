import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Ivan Affriandi",
  description: "Ask me anything anonymously.",
  openGraph: {
    title: "Ask Ivan Affriandi",
    description: "Ask me anything anonymously.",
    url: "https://ivanaffriandi.com/ask",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Ivan Affriandi",
    description: "Ask me anything anonymously.",
  }
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
