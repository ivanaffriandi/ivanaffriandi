"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LofiPlayer from "./LofiPlayer";
import { useLanguage } from "@/contexts/LanguageContext";

// iOS spring config — snappy, physical feel
const iosSpring = { type: "spring" as const, stiffness: 400, damping: 30 };

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [pressed, setPressed] = useState(false);
  return (
    <motion.div
      animate={{ scale: pressed ? 0.92 : 1 }}
      transition={iosSpring}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      <Link
        href={href}
        style={{
          fontSize: "0.9rem",
          fontWeight: "600",
          fontFamily: "var(--font-sans)",
          letterSpacing: "-0.01em",
          textDecoration: "none",
          color: "var(--text-primary)",
          opacity: pressed ? 0.6 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        {children}
      </Link>
    </motion.div>
  );
}

// Sign out icon button — only shows on /admin
function SignOutButton() {
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <motion.button
      animate={{ scale: pressed ? 0.9 : 1, opacity: loading ? 0.5 : 1 }}
      transition={iosSpring}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={handleSignOut}
      title="Sign out"
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        border: "1px solid rgba(255, 59, 48, 0.18)",
        backgroundColor: "rgba(255, 59, 48, 0.06)",
        color: "#FF3B30",
        cursor: loading ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      {/* Power/Sign-out icon */}
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </motion.button>
  );
}

export default function Navigation() {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdminPage = pathname === "/admin" || pathname === "/hq-panel" || pathname === "/x";

  // Smooth scroll listener for glassmorphism trigger
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // iOS-style momentum spring for scroll progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        backgroundColor: isScrolled ? "var(--bg-glass)" : "transparent",
        backdropFilter: isScrolled ? "blur(2px)" : "blur(0px)",
        WebkitBackdropFilter: isScrolled ? "blur(2px)" : "blur(0px)",
        borderBottom: "none",
        paddingTop: isScrolled ? "0.85rem" : "1.1rem",
        paddingBottom: isScrolled ? "0.85rem" : "1.1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "0 -4vw",
        paddingLeft: "4vw",
        paddingRight: "4vw",
        transition: "background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.8s cubic-bezier(0.16, 1, 0.3, 1), padding 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Logo — tap-scale like an iOS button */}
      <motion.div
        whileTap={{ scale: 0.9, opacity: 0.7 }}
        transition={iosSpring}
      >
        <Link
          href="/"
          className="logo"
          style={{
            fontSize: "1.05rem",
            fontWeight: "700",
            letterSpacing: "-0.02em",
            display: "block",
          }}
        >
          Ivan
        </Link>
      </motion.div>

      {/* High-Precision Architectural Ruler Scroll Progress Bar */}
      <div
        style={{
          flexGrow: 1,
          margin: "0 1.5rem",
          height: "1px",
          backgroundColor: "var(--grid-line)",
          position: "relative",
        }}
      >
        {/* Active Progress Overlay */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "var(--text-primary)",
            transformOrigin: "0%",
            scaleX,
            zIndex: 1,
          }}
        />

      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {pathname === "/hq-panel" || pathname === "/x" ? (
          <Link
            href="/x?tab=security"
            title="Access Security"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: "1px solid rgba(142, 142, 147, 0.18)",
              backgroundColor: "rgba(142, 142, 147, 0.06)",
              color: "var(--text-primary)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {/* iOS-like Shield Icon */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </Link>
        ) : (
          <LofiPlayer />
        )}
        {isAdminPage ? (
          <SignOutButton />
        ) : (
          <>
            {pathname === "/library" && (
              <NavLink href="/">{t("nav_home")}</NavLink>
            )}
            {pathname !== "/library" && (
              <NavLink href={pathname === "/ask" ? "/" : "/ask"}>
                {pathname === "/ask" ? t("nav_home") : t("nav_ask")}
              </NavLink>
            )}
          </>
        )}
      </div>
    </header>
  );
}
