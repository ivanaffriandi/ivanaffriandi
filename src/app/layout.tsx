import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import FooterAbout from "@/components/FooterAbout";
import BirthdayCelebration from "@/components/BirthdayCelebration";
import KonamiEasterEgg from "@/components/KonamiEasterEgg";
import PageTransition from "@/components/PageTransition";
import GlobalProtector from "@/components/GlobalProtector";
import "./globals.css";
import "./footer.css";
import fs from "fs";
import path from "path";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents all mobile auto-zoom issues completely!
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ivanaffriandi.com"),
  title: "Hello, Ivan!",
  description: "Personal space of Ivan Affriandi — writing, moments, and thoughts.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ivan A.",
  },
  openGraph: {
    title: "Hello, Ivan!",
    description: "Personal space of Ivan Affriandi — writing, moments, and thoughts.",
    url: "https://ivanaffriandi.com",
    siteName: "Hello, Ivan!",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hello, Ivan!",
    description: "Personal space of Ivan Affriandi — writing, moments, and thoughts.",
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
        <GlobalProtector />
        <BirthdayCelebration />
        <KonamiEasterEgg />
        <div className="layout-wrapper" style={{ padding: "0 4vw" }}>
          <Navigation />
          
          <main className="content-wrapper" style={{ paddingBottom: "6rem" }}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>

          <footer className="yunox-single-footer" style={{ 
            position: "fixed",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 4vw)",
            maxWidth: "600px",
            padding: "0.6rem 1.2rem",
            backgroundColor: "var(--bg-glass)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "100px",
            border: "1px solid rgba(150,150,150,0.15)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            display: "grid", 
            gridTemplateColumns: "1fr auto 1fr", 
            alignItems: "center",
            zIndex: 90
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('PWA ServiceWorker registered on scope:', reg.scope);
                  }).catch(function(err) {
                    console.error('PWA ServiceWorker registration failed:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>

  );
}
