"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function FadeIn({ 
  children, 
  delay = 0,
  className = "",
  style = {}
}: { 
  children: ReactNode, 
  delay?: number,
  className?: string,
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ 
        duration: 0.52, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // iOS ease-out-expo
        opacity: { duration: 0.38, delay },
        filter: { duration: 0.38, delay },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
