"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";

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

export default function Navigation() {
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();

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
        backgroundColor: "transparent",
        borderBottom: "none",
        paddingTop: "1rem",
        paddingBottom: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "0 -4vw",
        paddingLeft: "4vw",
        paddingRight: "4vw",
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

      {/* Scroll progress bar — iOS inertia spring */}
      <div
        style={{
          flexGrow: 1,
          margin: "0 1.5rem",
          height: "1px",
          backgroundColor: "var(--grid-line)",
          position: "relative",
        }}
      >
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
          }}
        />
      </div>

      <NavLink href={pathname === "/ask" ? "/" : "/ask"}>
        {pathname === "/ask" ? "Home" : "Ask"}
      </NavLink>
    </header>
  );
}
