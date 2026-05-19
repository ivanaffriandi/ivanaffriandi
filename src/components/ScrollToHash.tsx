"use client";

import { useEffect } from "react";

export default function ScrollToHash() {
  useEffect(() => {
    // Check if the URL has a hash for #about
    if (typeof window !== "undefined" && window.location.hash === "#about") {
      const el = document.getElementById("about");
      if (el) {
        // Delay slightly to let layout settle and animations render
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return null;
}
