"use client";

import { useState, useEffect } from "react";

export default function AmsterdamClock() {
  const [time, setTime] = useState<string>("");
  const [tz, setTz] = useState<string>("CEST");

  useEffect(() => {
    const updateClock = () => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Europe/Amsterdam",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      
      // Format to h:mm AM/PM
      const formattedTime = new Intl.DateTimeFormat("en-US", options).format(date);
      setTime(formattedTime);

      // Determine timezone abbreviation (CET or CEST)
      try {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Amsterdam",
          timeZoneName: "short"
        }).formatToParts(date);
        const tzPart = parts.find(p => p.type === "timeZoneName");
        if (tzPart) {
          const val = tzPart.value;
          if (val.includes("GMT+2") || val.toLowerCase().includes("summer") || val === "CEST") {
            setTz("CEST");
          } else if (val.includes("GMT+1") || val === "CET") {
            setTz("CET");
          } else {
            setTz(val);
          }
        }
      } catch (e) {
        // Dynamic fallback
        const month = date.getMonth();
        if (month > 2 && month < 10) {
          setTz("CEST");
        } else {
          setTz("CET");
        }
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{ 
      fontFamily: "var(--font-sans)", 
      fontSize: "0.76rem",
      fontWeight: "500",
      color: "var(--text-primary)",
      display: "inline-flex",
      alignItems: "center"
    }}>
      {time ? `${time} ${tz}` : `--:-- CEST`}
    </span>
  );
}
