import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import FooterAbout from "@/components/FooterAbout";
import BirthdayCelebration from "@/components/BirthdayCelebration";
import PageTransition from "@/components/PageTransition";
import "./globals.css";
import "./footer.css";
import fs from "fs";
import path from "path";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ivanaffriandi.com"),
  title: "Ivan Affriandi",
  description: "Swiss Grid Layout",
  openGraph: {
    title: "Ivan Affriandi",
    description: "Swiss Grid Layout",
    url: "https://ivanaffriandi.com",
    siteName: "Ivan Affriandi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ivan Affriandi",
    description: "Swiss Grid Layout",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pure server-side check if profile.jpg exists in the public directory
  const profileExists = fs.existsSync(path.join(process.cwd(), "public", "profile.jpg"));
  const avatarSrc = profileExists ? "/profile.jpg" : "/nature_hero.png";

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <BirthdayCelebration />
        <div className="layout-wrapper" style={{ padding: "0 4vw" }}>
          <Navigation />
          
          <main className="content-wrapper">
            <PageTransition>
              {children}
            </PageTransition>
          </main>

          <footer className="yunox-single-footer" style={{ 
            borderTop: "1px solid rgba(150,150,150,0.15)", 
            padding: "0.6rem 0", 
            marginTop: "1rem",
            display: "grid", 
            gridTemplateColumns: "1fr auto 1fr", 
            alignItems: "center"
          }}>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "500", fontFamily: "var(--font-sans)" }}>
              Ivan &copy; 2026
            </div>
            
            <div style={{ display: "flex", justifyContent: "center" }}>
              <FooterAbout />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "500", fontFamily: "var(--font-sans)", letterSpacing: "0.01em" }}>
              Jakarta, ID
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
