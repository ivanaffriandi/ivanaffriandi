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
  title: "Ivan Affriandi",
  description: "Swiss Grid Layout",
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

            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", justifyContent: "flex-end" }}>
              <a href="mailto:hello@ivanaffriandi.com" className="social-icon-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
              <a href="https://instagram.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://x.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
