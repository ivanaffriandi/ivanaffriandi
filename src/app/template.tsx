"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

// Snappy, premium spring physics page transition: fade + slight rise ala iOS
const iosPageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      mass: 0.8,
      opacity: { duration: 0.25 },
      filter: { duration: 0.25 }
    }
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Prevent browser from trying to restore scroll position automatically
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      // Force scroll to top immediately on navigation
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={iosPageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
