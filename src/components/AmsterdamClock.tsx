"use client";

import { useState, useEffect } from "react";

export default function AmsterdamClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Europe/Amsterdam",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      // Format to HH:mm
      setTime(new Intl.DateTimeFormat("en-GB", options).format(new Date()));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span>Amsterdam, NL</span>
      <span style={{ opacity: 0.3 }}>—</span>
      <span style={{ 
        fontFamily: "monospace", 
        letterSpacing: "0.02em", 
        fontWeight: "600",
        color: "var(--text-primary)"
      }}>
        {time || "--:--"}
      </span>
      <span style={{
        width: "4px",
        height: "4px",
        borderRadius: "50%",
        backgroundColor: "#FF5F15", // Premium pulsing orange active dot
        display: "inline-block",
        animation: "pulse 2s infinite"
      }} />
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(0.9); }
        }
      `}</style>
    </span>
  );
}
