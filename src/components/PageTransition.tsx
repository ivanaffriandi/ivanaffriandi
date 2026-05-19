"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// iOS-style page transition: fade + slight vertical rise, spring physics
const iosPageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.42,
      ease: [0.25, 0.46, 0.45, 0.94] as const, // iOS ease-out-expo
      opacity: { duration: 0.3 },
      filter: { duration: 0.3 },
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(3px)",
    transition: {
      duration: 0.22,
      ease: [0.55, 0, 1, 0.45] as const, // iOS ease-in
    },
  },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
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
