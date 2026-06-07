import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Lora, Merriweather, Playfair_Display } from "next/font/google";
import Navigation from "@/components/Navigation";
import FooterAbout from "@/components/FooterAbout";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BirthdayCelebration from "@/components/BirthdayCelebration";
import CopyrightText from "@/components/CopyrightText";
import KonamiEasterEgg from "@/components/KonamiEasterEgg";
import PageTransition from "@/components/PageTransition";
import VisitorTracker from "@/components/VisitorTracker";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import { AudioProvider } from "@/contexts/AudioContext";

import "./globals.css";
import "./footer.css";
import fs from "fs";
import path from "path";

// Evaluated once at module load (server startup), not on every request.
// Avoids blocking the RSC streaming pipeline with a sync fs call.
const profileExists = fs.existsSync(path.join(process.cwd(), "public", "profile.jpg"));
const avatarSrc = profileExists ? "/profile.jpg" : "/nature_hero.png";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
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
  // avatarSrc is computed once at module load (see top of file)

  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} ${merriweather.variable} ${playfairDisplay.variable}`}>
      <body>
        <PerformanceProvider>
          <AudioProvider>
          <LanguageProvider>
            <VisitorTracker />
            <BirthdayCelebration />
            <KonamiEasterEgg />
            <div className="layout-wrapper" style={{ padding: "0 4vw" }}>
              <Navigation />
              
              <main className="content-wrapper" style={{ minHeight: "calc(100vh - 160px)", paddingBottom: "0.25rem" }}>
                {children}
              </main>

              <footer className="yunox-single-footer" style={{ 
                width: "100%",
                padding: "0.75rem 0 0.75rem 0",
                marginTop: "0.5rem",
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                boxSizing: "border-box"
              }}>
                <CopyrightText />
                
                {/* About button sits in the center column, perfectly aligned with left/right text */}
                <FooterAbout />
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "500", fontFamily: "var(--font-sans)", letterSpacing: "0.01em" }}>
                  <LanguageSwitcher />
                </div>
              </footer>
            </div>
          </LanguageProvider>
          </AudioProvider>
        </PerformanceProvider>
        <Script
          id="pwa-service-worker"
          strategy="afterInteractive"
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
