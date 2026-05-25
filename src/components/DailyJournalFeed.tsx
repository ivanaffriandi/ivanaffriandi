"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FadeIn from "./FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import { getAllCalendarEvents, CalendarEvent } from "@/lib/calendar";
import { triggerLightClick, triggerActionClick } from "@/lib/haptic";


// iOS stagger spring config
const iosCardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98, filter: "blur(3px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.05,
      duration: 0.38,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
    filter: "blur(2px)",
    transition: { duration: 0.16, ease: [0.55, 0, 1, 0.45] as const },
  },
};

const STATIC_SEEDED_EVENTS: CalendarEvent[] = [
  // --- RECURRING BIRTHDAYS & SOLAR FIXED HOLIDAYS ---
  { id: "s-0", dateKey: "08-03", name: "Ivan's Birthday", type: "ivan", emoji: "👑🎂" },
  { id: "s-1", dateKey: "05-19", name: "Naveena's Birthday", type: "female", emoji: "🎂" },
  { id: "s-2", dateKey: "08-31", name: "Vera's Birthday", type: "female", emoji: "🎂" },
  { id: "s-3", dateKey: "01-15", name: "Dhiffa's Birthday", type: "female", emoji: "🎂" },
  { id: "s-4", dateKey: "10-05", name: "Aluna's Birthday", type: "female", emoji: "🎂" },
  
  { id: "s-5", dateKey: "01-01", name: "New Year's Day", type: "general_holiday", emoji: "🎉" },
  { id: "s-6", dateKey: "05-01", name: "International Labor Day", type: "general_holiday", emoji: "🛠️" },
  { id: "s-7", dateKey: "06-01", name: "Pancasila Day", type: "general_holiday", emoji: "🦅" },
  { id: "s-8", dateKey: "08-17", name: "Independence Day", type: "independence", emoji: "🇮🇩" },
  { id: "s-9", dateKey: "12-25", name: "Christmas Day", type: "christmas", emoji: "🎄" },

  // --- SHIFTING NATIONAL HOLIDAYS BY YEAR ---
  // Year 2024
  { id: "s-2024-1", dateKey: "2024-02-08", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { id: "s-2024-2", dateKey: "2024-02-10", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { id: "s-2024-3", dateKey: "2024-03-11", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { id: "s-2024-4", dateKey: "2024-03-29", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { id: "s-2024-5", dateKey: "2024-03-31", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { id: "s-2024-6", dateKey: "2024-04-10", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2024-7", dateKey: "2024-04-11", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2024-8", dateKey: "2024-05-09", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { id: "s-2024-9", dateKey: "2024-05-23", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { id: "s-2024-10", dateKey: "2024-06-17", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { id: "s-2024-11", dateKey: "2024-07-07", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { id: "s-2024-12", dateKey: "2024-09-16", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2025
  { id: "s-2025-1", dateKey: "2025-01-27", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { id: "s-2025-2", dateKey: "2025-01-29", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { id: "s-2025-3", dateKey: "2025-03-29", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { id: "s-2025-4", dateKey: "2025-04-18", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { id: "s-2025-5", dateKey: "2025-04-20", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { id: "s-2025-6", dateKey: "2025-03-31", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2025-7", dateKey: "2025-04-01", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2025-8", dateKey: "2025-05-29", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { id: "s-2025-9", dateKey: "2025-05-12", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { id: "s-2025-10", dateKey: "2025-06-06", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { id: "s-2025-11", dateKey: "2025-06-27", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { id: "s-2025-12", dateKey: "2025-09-05", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2026 (Current Year)
  { id: "s-2026-1", dateKey: "2026-01-16", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { id: "s-2026-2", dateKey: "2026-02-17", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { id: "s-2026-3", dateKey: "2026-03-19", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { id: "s-2026-4", dateKey: "2026-04-03", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { id: "s-2026-5", dateKey: "2026-04-05", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { id: "s-2026-6", dateKey: "2026-03-20", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2026-7", dateKey: "2026-03-21", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2026-8", dateKey: "2026-05-14", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { id: "s-2026-9", dateKey: "2026-05-31", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { id: "s-2026-10", dateKey: "2026-05-27", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { id: "s-2026-11", dateKey: "2026-06-16", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { id: "s-2026-12", dateKey: "2026-08-25", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2027
  { id: "s-2027-1", dateKey: "2027-01-05", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { id: "s-2027-2", dateKey: "2027-02-06", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { id: "s-2027-3", dateKey: "2027-03-08", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { id: "s-2027-4", dateKey: "2027-03-26", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { id: "s-2027-5", dateKey: "2027-03-28", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { id: "s-2027-6", dateKey: "2027-03-09", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2027-7", dateKey: "2027-03-10", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2027-8", dateKey: "2027-05-06", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { id: "s-2027-9", dateKey: "2027-05-20", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { id: "s-2027-10", dateKey: "2027-05-16", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { id: "s-2027-11", dateKey: "2027-06-06", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { id: "s-2027-12", dateKey: "2027-08-15", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2028
  { id: "s-2028-1", dateKey: "2028-01-24", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { id: "s-2028-2", dateKey: "2028-01-26", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { id: "s-2028-3", dateKey: "2028-03-26", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { id: "s-2028-4", dateKey: "2028-04-14", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { id: "s-2028-5", dateKey: "2028-04-16", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { id: "s-2028-6", dateKey: "2028-02-26", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2028-7", dateKey: "2028-02-27", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2028-8", dateKey: "2028-05-25", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { id: "s-2028-9", dateKey: "2028-05-08", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { id: "s-2028-10", dateKey: "2028-05-04", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { id: "s-2028-11", dateKey: "2028-05-25", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { id: "s-2028-12", dateKey: "2028-08-03", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2029
  { id: "s-2029-1", dateKey: "2029-01-13", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { id: "s-2029-2", dateKey: "2029-02-13", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { id: "s-2029-3", dateKey: "2029-03-15", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { id: "s-2029-4", dateKey: "2029-03-30", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { id: "s-2029-5", dateKey: "2029-04-01", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { id: "s-2029-6", dateKey: "2029-02-14", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2029-7", dateKey: "2029-02-15", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2029-8", dateKey: "2029-05-10", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { id: "s-2029-9", dateKey: "2029-05-27", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { id: "s-2029-10", dateKey: "2029-04-23", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { id: "s-2029-11", dateKey: "2029-05-14", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { id: "s-2029-12", dateKey: "2029-07-23", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2030
  { id: "s-2030-1", dateKey: "2030-01-02", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { id: "s-2030-2", dateKey: "2030-12-22", name: "Isra Mi'raj Holiday", type: "isra_miraj", emoji: "🌙" },
  { id: "s-2030-3", dateKey: "2030-02-03", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { id: "s-2030-4", dateKey: "2030-03-05", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { id: "s-2030-5", dateKey: "2030-04-19", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { id: "s-2030-6", dateKey: "2030-04-21", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { id: "s-2030-7", dateKey: "2030-02-04", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2030-8", dateKey: "2030-02-05", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { id: "s-2030-9", dateKey: "2030-05-30", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { id: "s-2030-10", dateKey: "2030-05-16", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { id: "s-2030-11", dateKey: "2030-04-12", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { id: "s-2030-12", dateKey: "2030-05-03", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { id: "s-2030-13", dateKey: "2030-07-12", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" }
];

const getSelectedTheme = (date: Date, calendarEvents: CalendarEvent[]) => {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  const dateKey = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const fullDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const matchingEvent = calendarEvents.find(e => e.dateKey === dateKey || e.dateKey === fullDateKey);
  if (matchingEvent) {
    if (matchingEvent.type === "ivan" || matchingEvent.type === "male" || matchingEvent.type === "female" || matchingEvent.type === "both") {
      const namesText = matchingEvent.name.includes("'s Birthday") ? matchingEvent.name.split("'s Birthday")[0] : matchingEvent.name;
      const primaryColor = matchingEvent.type === "female" ? "#ff5c9d" : (matchingEvent.type === "ivan" ? "#007aff" : (matchingEvent.type === "both" ? "#a855f7" : "#007aff"));
      const bgLight = matchingEvent.type === "female" ? "#FFF5F7" : (matchingEvent.type === "ivan" ? "#F0F6FF" : (matchingEvent.type === "both" ? "#FAF5FF" : "#F0F6FF"));
      const bgDark = matchingEvent.type === "female" ? "#1A0F11" : (matchingEvent.type === "ivan" ? "#0B1528" : (matchingEvent.type === "both" ? "#1E112A" : "#0B1528"));
      const bgUnselected = matchingEvent.type === "female" ? "rgba(255, 192, 203, 0.18)" : (matchingEvent.type === "ivan" ? "rgba(0, 122, 255, 0.12)" : (matchingEvent.type === "both" ? "rgba(168, 85, 247, 0.1)" : "rgba(0, 122, 255, 0.12)"));
      const borderUnselected = matchingEvent.type === "female" ? "1px solid rgba(255, 105, 180, 0.55)" : (matchingEvent.type === "ivan" ? "1px solid rgba(0, 122, 255, 0.45)" : (matchingEvent.type === "both" ? "1px solid rgba(168, 85, 247, 0.45)" : "1px solid rgba(0, 122, 255, 0.45)"));

      return {
        type: matchingEvent.type,
        primary: primaryColor,
        bgLight,
        bgDark,
        bgUnselected,
        borderUnselected,
        emoji: matchingEvent.emoji,
        text: `${namesText}'s Birthday! ${matchingEvent.emoji}`
      };
    }

    if (matchingEvent.type === "idul_fitri" || matchingEvent.type === "isra_miraj" || matchingEvent.type === "islamic_new_year" || matchingEvent.type === "maulid_nabi") {
      return {
        type: "idul_fitri",
        primary: "#10b981",
        bgLight: "#F0FDF4",
        bgDark: "#061F12",
        bgUnselected: "rgba(16, 185, 129, 0.12)",
        borderUnselected: "1px solid rgba(16, 185, 129, 0.45)",
        emoji: matchingEvent.emoji,
        text: matchingEvent.name
      };
    }

    if (matchingEvent.type === "idul_adha") {
      return {
        type: "idul_adha",
        primary: "#10b981",
        bgLight: "#F0FDF4",
        bgDark: "#061F12",
        bgUnselected: "rgba(16, 185, 129, 0.12)",
        borderUnselected: "1px solid rgba(16, 185, 129, 0.45)",
        emoji: matchingEvent.emoji,
        text: matchingEvent.name
      };
    }

    if (matchingEvent.type === "christmas") {
      return {
        type: "christmas",
        primary: "#ef4444",
        bgLight: "#FEF2F2",
        bgDark: "#270808",
        bgUnselected: "rgba(239, 68, 68, 0.12)",
        borderUnselected: "1px solid rgba(239, 68, 68, 0.45)",
        emoji: matchingEvent.emoji,
        text: matchingEvent.name
      };
    }

    if (matchingEvent.type === "waisak") {
      return {
        type: "waisak",
        primary: "#f59e0b",
        bgLight: "#FEF3C7",
        bgDark: "#241305",
        bgUnselected: "rgba(245, 158, 11, 0.12)",
        borderUnselected: "1px solid rgba(245, 158, 11, 0.45)",
        emoji: matchingEvent.emoji,
        text: matchingEvent.name
      };
    }

    if (matchingEvent.type === "nyepi") {
      return {
        type: "nyepi",
        primary: "#6366f1",
        bgLight: "#EEF2FF",
        bgDark: "#0B0C1E",
        bgUnselected: "rgba(99, 102, 241, 0.12)",
        borderUnselected: "1px solid rgba(99, 102, 241, 0.45)",
        emoji: matchingEvent.emoji,
        text: matchingEvent.name
      };
    }

    if (matchingEvent.type === "chinese_new_year") {
      return {
        type: "lunar_new_year",
        primary: "#f43f5e",
        bgLight: "#FFF1F2",
        bgDark: "#200408",
        bgUnselected: "rgba(244, 63, 94, 0.12)",
        borderUnselected: "1px solid rgba(244, 63, 94, 0.45)",
        emoji: matchingEvent.emoji,
        text: matchingEvent.name
      };
    }

    if (matchingEvent.type === "independence") {
      return {
        type: "independence",
        primary: "#ef4444",
        bgLight: "#FEF2F2",
        bgDark: "#1F0707",
        bgUnselected: "rgba(239, 68, 68, 0.12)",
        borderUnselected: "1px solid rgba(239, 68, 68, 0.45)",
        emoji: matchingEvent.emoji,
        text: matchingEvent.name
      };
    }

    return {
      type: "general_holiday",
      primary: "#f97316",
      bgLight: "#FFF7ED",
      bgDark: "#240E05",
      bgUnselected: "rgba(249, 115, 22, 0.12)",
      borderUnselected: "1px solid rgba(249, 115, 22, 0.45)",
      emoji: matchingEvent.emoji,
      text: matchingEvent.name
    };
  }

  return null;
};

const SnowEffect = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 99999 }}>
      {Array.from({ length: 60 }).map((_, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = 5 + Math.random() * 6;
        const size = 3 + Math.random() * 4;
        const opacity = 0.3 + Math.random() * 0.5;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: "-10px",
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              opacity: opacity,
              willChange: "transform, opacity",
              animation: `fall ${duration}s linear infinite`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(20px, 50vh, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(-10px, 100vh, 0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

const IndoIndependenceEffect = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 99999 }}>
      {Array.from({ length: 30 }).map((_, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 6;
        const duration = 4 + Math.random() * 5;
        const size = 6 + Math.random() * 6;
        const isRed = idx % 2 === 0;
        const opacity = 0.5 + Math.random() * 0.4;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: "-15px",
              left: `${left}%`,
              width: isRed ? `${size * 1.4}px` : `${size}px`,
              height: `${size}px`,
              backgroundColor: isRed ? "#ff0000" : "#ffffff",
              borderRadius: isRed ? "1px" : "50%",
              opacity: opacity,
              willChange: "transform, opacity",
              animation: `float-confetti ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}
      <style>{`
        @keyframes float-confetti {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.85);
          }
          50% {
            transform: translate3d(15px, 50vh, 0) rotate(180deg) scale(1.05);
          }
          100% {
            transform: translate3d(-10px, 100vh, 0) rotate(360deg) scale(0.85);
          }
        }
      `}</style>
    </div>
  );
};

const EidFitriEffect = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 99999 }}>
      {Array.from({ length: 18 }).map((_, idx) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 4;
        const duration = 3.5 + Math.random() * 3.5;
        const size = 8 + Math.random() * 10;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: 0,
              color: "#fbbf24",
              willChange: "transform, opacity",
              animation: `pulse-star ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
        );
      })}
      <style>{`
        @keyframes pulse-star {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(0.2) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translate3d(0, 0, 0) scale(1.05) rotate(180deg);
            opacity: 0.75;
          }
        }
      `}</style>
    </div>
  );
};

const WaisakEffect = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 99999 }}>
      {Array.from({ length: 10 }).map((_, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = 8 + Math.random() * 8;
        const size = 16 + Math.random() * 14;
        const opacity = 0.4 + Math.random() * 0.4;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              bottom: "-40px",
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: 0,
              color: "#fbbf24", // Golden Saffron
              willChange: "transform, opacity",
              animation: `waisak-rise ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
              <path d="M12 21.5c-1.35-1.15-4-3.5-4-6.5 0-2.5 1.5-4.5 4-6.5 2.5 2 4 4 4 6.5 0 3-2.65 5.35-4 6.5zm-5-8.5c-.75-.65-1.5-1.5-1.5-3 0-1.5 1-2.5 2.5-3.5 1.5 1 2 2 2 3.5 0 1.5-.75 2.35-3 3zm10 0c-2.25-.65-3-1.5-3-3 0-1.5.5-2.5 2-3.5 1.5 1 2.5 2 2.5 3.5 0 1.5-.75 2.35-1.5 3z" />
            </svg>
          </div>
        );
      })}
      <style>{`
        @keyframes waisak-rise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.6) rotate(-5deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(0, -110vh, 0) scale(1.1) rotate(5deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const NyepiEffect = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 99999 }}>
      {Array.from({ length: 28 }).map((_, idx) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 6;
        const duration = 3 + Math.random() * 5;
        const size = 1.5 + Math.random() * 2;
        const isShootingStar = idx === 0 || idx === 10;
        
        if (isShootingStar) {
          const shootingDelay = Math.random() * 12;
          const shootingDuration = 1.5 + Math.random() * 1.5;
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `${Math.random() * 40}%`,
                left: `${Math.random() * 60}%`,
                width: "60px",
                height: "1px",
                background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8))",
                transform: "rotate(-35deg)",
                opacity: 0,
                willChange: "transform, opacity",
                animation: `shooting-star ${shootingDuration}s linear infinite`,
                animationDelay: `${shootingDelay}s`
              }}
            />
          );
        }

        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              opacity: 0,
              willChange: "transform, opacity",
              animation: `nyepi-twinkle ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}
      <style>{`
        @keyframes nyepi-twinkle {
          0%, 100% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.6);
          }
          50% {
            opacity: 0.8;
            transform: translate3d(0, 0, 0) scale(1.1);
          }
        }
        @keyframes shooting-star {
          0% {
            transform: translate3d(0, 0, 0) rotate(-35deg) scaleX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
          }
          30% {
            transform: translate3d(200px, 140px, 0) rotate(-35deg) scaleX(1);
            opacity: 0;
          }
          100% {
            transform: translate3d(200px, 140px, 0) rotate(-35deg) scaleX(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const LunarNewYearEffect = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 99999 }}>
      {Array.from({ length: 12 }).map((_, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 6;
        const duration = 6 + Math.random() * 6;
        const size = 12 + Math.random() * 12;
        const isLantern = idx % 2 === 0;
        
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              bottom: "-40px",
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: 0,
              color: isLantern ? "#f43f5e" : "#eab308", // Lantern Red or Gold Coin
              willChange: "transform, opacity",
              animation: `lunar-float ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`
            }}
          >
            {isLantern ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 3.31 2.69 6 6 6v3h-3v4h10v-4h-3v-3c3.31 0 6-2.69 6-6 0-3.87-3.13-7-7-7zm0 11c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
                <rect x="9" y="9" width="6" height="6" fill="var(--bg-color)" />
              </svg>
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes lunar-float {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translate3d(30px, -110vh, 0) rotate(15deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const HolyLightEffect = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 99999 }}>
      {Array.from({ length: 10 }).map((_, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = 6 + Math.random() * 6;
        const size = 30 + Math.random() * 40;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: `${Math.random() * 80}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0) 70%)",
              borderRadius: "50%",
              opacity: 0,
              willChange: "transform, opacity",
              animation: `holy-glow ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}
      <style>{`
        @keyframes holy-glow {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translate3d(0, -50px, 0) scale(1.15);
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
};

const BirthdayConfettiEffect = ({ type }: { type: string }) => {
  const isIvan = type === "ivan";
  
  const colors = isIvan
    ? ["#007aff", "#3b82f6", "#ef4444", "#f43f5e", "#10b981", "#fbbf24", "#a855f7", "#ec4899"] // Fully rich colorful rainbow for Ivan's royal birthday!
    : type === "female" 
    ? ["#ff5c9d", "#f472b6", "#ec4899", "#f43f5e", "#fcd34d"] // Pink & gold
    : type === "male"
    ? ["#007aff", "#60a5fa", "#3b82f6", "#1d4ed8", "#fcd34d"] // Blue & gold
    : ["#a855f7", "#c084fc", "#ff5c9d", "#007aff", "#fcd34d"]; // Purple, pink, blue & gold

  // Initial burst counts (plays once for everyone!)
  const confettiCount = isIvan ? 50 : 35;
  const burstBalloonCount = isIvan ? 12 : 6;
  
  // Continuous gentle floating (Ivan only - loops infinitely!)
  const continuousBalloonCount = isIvan ? 3 : 0;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 99999 }}>
      {/* 1. Confetti Rain (Initial burst - plays once) */}
      {Array.from({ length: confettiCount }).map((_, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const duration = isIvan ? 3.0 + Math.random() * 2.0 : 2.0 + Math.random() * 1.5;
        const size = 5 + Math.random() * 6;
        const color = colors[idx % colors.length];
        return (
          <div
            key={`c-${idx}`}
            style={{
              position: "absolute",
              top: "-20px",
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * 1.5}px`,
              backgroundColor: color,
              borderRadius: "1.5px",
              opacity: 0.85,
              willChange: "transform, opacity",
              animation: `confetti-rain ${duration}s ease-out forwards`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}

      {/* 2. Initial Burst Balloons (Plays once, then clears) */}
      {Array.from({ length: burstBalloonCount }).map((_, idx) => {
        const left = 10 + Math.random() * 80;
        const delay = Math.random() * 1.0;
        const duration = 3.0 + Math.random() * 1.5;
        const size = isIvan ? 24 + Math.random() * 22 : 28 + Math.random() * 14;
        const color = colors[idx % colors.length];
        return (
          <div
            key={`b-burst-${idx}`}
            style={{
              position: "absolute",
              bottom: "-80px",
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * 1.25}px`,
              backgroundColor: color,
              borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
              boxShadow: "inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.06)",
              opacity: 0.85,
              willChange: "transform, opacity",
              animation: `balloon-rise ${duration}s ease-in-out forwards`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}

      {/* 3. Continuous Gentle Floating Balloons (Loop infinitely - Ivan only!) */}
      {isIvan && Array.from({ length: continuousBalloonCount }).map((_, idx) => {
        const left = 15 + Math.random() * 70;
        const delay = 3.0 + idx * 3.5; // Stagger after the main burst starts clearing
        const duration = 8.0 + Math.random() * 3.0; // Slow, lazy, beautiful float
        const size = 26 + Math.random() * 10;
        const color = colors[(idx + 4) % colors.length];
        return (
          <div
            key={`b-loop-${idx}`}
            style={{
              position: "absolute",
              bottom: "-80px",
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * 1.25}px`,
              backgroundColor: color,
              borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
              boxShadow: "inset -4px -4px 8px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.06)",
              opacity: 0.75,
              willChange: "transform, opacity",
              animation: `balloon-rise ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}

      <style>{`
        @keyframes confetti-rain {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 105vh, 0) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes balloon-rise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.8) rotate(-5deg);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translate3d(0, -120vh, 0) scale(1.15) rotate(5deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default function DailyJournalFeed({ posts, moments = [] }: { posts: any[], moments?: any[] }) {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(STATIC_SEEDED_EVENTS);
  const [isDark, setIsDark] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const visibleCards = 3; // Always show 3 cards per slide for a beautiful minimalist gallery layout

  // Sync system dark mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(media.matches);
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const events = await getAllCalendarEvents();
        setCalendarEvents(events);
      } catch (err) {
        console.error("Failed to fetch calendar events:", err);
      }
    };
    fetchCalendar();
  }, []);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedTheme = getSelectedTheme(selectedDate, calendarEvents);

  // Sort all moments by published date descending, or fallback to aesthetic placeholders if empty
  const displayMoments = moments.length > 0
    ? [...moments].sort((a: any, b: any) => new Date(b.published || 0).getTime() - new Date(a.published || 0).getTime())
    : Array.from({ length: 8 }).map((_, idx) => ({
        id: `placeholder-${idx}`,
        url: `https://picsum.photos/seed/${idx + 10}/300/300`,
        title: `Moment ${idx + 1}`
      }));

  // Holiday and Sunday indicators computed globally
  const selectedKey = `${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedFullKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const matchingEvent = calendarEvents.find(e => e.dateKey === selectedKey || e.dateKey === selectedFullKey);
  const selectedHoliday = matchingEvent ? matchingEvent.name : undefined;
  const isSelectedSunday = selectedDate.getDay() === 0;
  const themeColor = isSelectedSunday ? "#ff3b30" : "#ff726f";

  // Casino slot-machine reel states
  const [scrollDirection, setScrollDirection] = useState<"forward" | "backward">("forward");
  const lastDateRef = useRef<Date>(selectedDate);

  // Sync scroll direction on selectedDate change
  useEffect(() => {
    if (selectedDate.toDateString() !== lastDateRef.current.toDateString()) {
      const dir = selectedDate.getTime() > lastDateRef.current.getTime() ? "forward" : "backward";
      setScrollDirection(dir);
      lastDateRef.current = selectedDate;
    }
  }, [selectedDate]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isWheelPickerOpen, setIsWheelPickerOpen] = useState(false);
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [yearPageStart, setYearPageStart] = useState(() => {
    const currentYear = new Date().getFullYear();
    return currentYear - (currentYear % 8);
  });
  const [showBirthdayConfetti, setShowBirthdayConfetti] = useState(false);

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const SHORT_MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const YEARS_LIST = Array.from({ length: 8 }, (_, i) => yearPageStart + i);

  // Confetti trigger timer for birthday page load and switch
  useEffect(() => {
    const theme = getSelectedTheme(selectedDate, calendarEvents);
    if (theme && (theme.type === "male" || theme.type === "female" || theme.type === "both" || theme.type === "ivan")) {
      if (theme.type === "ivan") {
        // Ivan's birthday celebration stays indefinitely!
        setShowBirthdayConfetti(true);
      } else {
        setShowBirthdayConfetti(true);
        const timer = setTimeout(() => {
          setShowBirthdayConfetti(false);
        }, 4500); // 4.5 seconds celebratory burst
        return () => clearTimeout(timer);
      }
    } else {
      setShowBirthdayConfetti(false);
    }
  }, [selectedDate]);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const calendarMobileRef = useRef<HTMLDivElement>(null);
  const calendarDesktopRef = useRef<HTMLDivElement>(null);
  const stripContainerMobileRef = useRef<HTMLDivElement>(null);
  const stripContainerDesktopRef = useRef<HTMLDivElement>(null);

  // Guards for smooth scroll-snapping interaction
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticScroll = useRef(false);
  const lastHapticIndexRef = useRef(-1);


  // Low-latency hardware-accelerated 3D barrel roll updater
  const updatePillAnimations = () => {
    [stripContainerMobileRef, stripContainerDesktopRef].forEach((ref) => {
      if (!ref.current) return;
      const container = ref.current;
      const containerCenter = container.scrollLeft + (container.offsetWidth / 2);
      
      const pills = container.querySelectorAll(".date-pill");
      pills.forEach((pill) => {
        const el = pill as HTMLElement;
        const pillCenter = el.offsetLeft + (el.offsetWidth / 2);
        const distance = Math.abs(pillCenter - containerCenter);
        
        const maxEffectDistance = 150; // pixels
        const distanceRatio = Math.min(distance / maxEffectDistance, 1); // 0 at center, 1 at edge
        
        // Apple-premium 3D physical scaling: 1.0 (center) -> 0.88 (edges)
        const scale = 1.0 - (distanceRatio * 0.12);
        
        // Elegant opacity fall-off: 1.0 (center) -> 0.50 (edges)
        const opacity = 1.0 - (distanceRatio * 0.50);
        
        // watchOS 3D barrel roll rotation: bends date strip in 3D cylindrical space
        const direction = pillCenter < containerCenter ? 1 : -1;
        const rotateY = direction * (distanceRatio * 20); // rotate up to 20deg
        const translateZ = -distanceRatio * 22; // push back in Z-axis up to 22px
        
        // Direct DOM manipulation guarantees buttery 120 FPS animations without React lag
        el.style.transform = `perspective(500px) scale(${scale}) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
        el.style.opacity = `${opacity}`;
      });
    });
  };

  // Orchestrates scrolling a target date pill perfectly to the horizontal viewport center
  const selectAndCenterDate = (date: Date) => {
    if (date.toDateString() !== selectedDate.toDateString()) {
      triggerActionClick();
    }
    setSelectedDate(date);


    // Wait briefly for React rendering so the correct month DOM pills are fully available
    requestAnimationFrame(() => {
      setTimeout(() => {
        [stripContainerMobileRef, stripContainerDesktopRef].forEach((ref) => {
          if (!ref.current) return;
          const container = ref.current;
          const pills = container.querySelectorAll(".date-pill");
          let targetEl: HTMLElement | null = null;

          pills.forEach((pill) => {
            const el = pill as HTMLElement;
            if (el.getAttribute("data-date") === date.toDateString()) {
              targetEl = el;
            }
          });

          if (targetEl) {
            const el = targetEl as HTMLElement;
            isProgrammaticScroll.current = true;
            const scrollLeft = el.offsetLeft - (container.offsetWidth / 2) + (el.offsetWidth / 2);
            
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
          }
        });

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
          updatePillAnimations(); // Sync styles once scrolling concludes
        }, 450);
      }, 50);
    });
  };

  // Mount/Initial centering animation alignment and client-device timezone sync
  useEffect(() => {
    const clientToday = new Date();
    setCalendarViewDate(new Date(clientToday));
    selectAndCenterDate(clientToday);
  }, []);

  // Cleanup scroll timeouts on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);


  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedMobile = calendarMobileRef.current && calendarMobileRef.current.contains(e.target as Node);
      const clickedDesktop = calendarDesktopRef.current && calendarDesktopRef.current.contains(e.target as Node);
      if (!clickedMobile && !clickedDesktop) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  // Sync calendar view date when opening
  const handleOpenCalendar = () => {
    setCalendarViewDate(new Date(selectedDate));
    setIsCalendarOpen(!isCalendarOpen);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Timezone-safe parsing to preserve the exact publication calendar date from Blogger API
  const parseBloggerDate = (publishedStr: string) => {
    // Parse the full ISO string (which includes the timezone) into a JS Date object. 
    // This allows it to natively resolve to the user's correct local timezone date.
    return new Date(publishedStr);
  };

  // Generate all days in the CURRENT MONTH of the selected date
  const generateStrip = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    return dates;
  };

  const stripDates = generateStrip();
  const today = new Date();

  const filteredPosts = posts.filter(post => isSameDay(parseBloggerDate(post.published), selectedDate));
  const hasPostOnDate = (d: Date) => posts.some(post => isSameDay(parseBloggerDate(post.published), d));

  // Calendar navigation logic
  const changeMonth = (offset: number) => {
    const newDate = new Date(calendarViewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarViewDate(newDate);
  };

  // Main scroll snapping selection logic: picks whichever date is closest to center
  const handleStripScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    // Keep 3D animations updated in real-time on every single scroll frame
    updatePillAnimations();

    // If scrolling was triggered programmatically (e.g. clicking a date),
    // skip center tracking to avoid fighting the smooth scroll animation.
    if (isProgrammaticScroll.current) return;
    if (!ref.current) return;

    const container = ref.current;
    const containerCenter = container.scrollLeft + (container.offsetWidth / 2);

    let closestIndex = -1;
    let minDistance = Infinity;

    const pills = container.querySelectorAll(".date-pill");
    pills.forEach((pill, index) => {
      const pillCenter = (pill as HTMLElement).offsetLeft + ((pill as HTMLElement).offsetWidth / 2);
      const distance = Math.abs(pillCenter - containerCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1) {
      // 1. Play haptic light ticks immediately during active scroll without React re-render!
      if (closestIndex !== lastHapticIndexRef.current) {
        triggerLightClick();
        lastHapticIndexRef.current = closestIndex;

        // Perform instant DOM highlight for closest index immediately
        pills.forEach((pill, idx) => {
          const el = pill as HTMLElement;
          if (idx === closestIndex) {
            el.classList.add("visual-active-scroll");
            el.style.borderColor = "rgba(255, 255, 255, 0.4)";
          } else {
            el.classList.remove("visual-active-scroll");
            el.style.borderColor = "";
          }
        });
      }

      // 2. Debounce the heavy React state update until the scroll stops or slows down
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        const targetDate = stripDates[closestIndex];
        if (targetDate && targetDate.toDateString() !== selectedDate.toDateString()) {
          setSelectedDate(targetDate);
        }
      }, 75); // ultra-fast 75ms settling debounce
    }
  };

  const handleStripScrollMobile = () => handleStripScroll(stripContainerMobileRef);
  const handleStripScrollDesktop = () => handleStripScroll(stripContainerDesktopRef);

  const renderCalendarDays = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

    const days = [];
    // Empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: "100%", aspectRatio: "1/1" }} />);
    }
    
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isSelected = isSameDay(date, selectedDate);
      const isToday = isSameDay(date, today);
      const hasPost = hasPostOnDate(date);
      const cellTheme = getSelectedTheme(date, calendarEvents);
      
      days.push(
        <div 
          key={i} 
          className="calendar-day-cell"
          onClick={() => {
            selectAndCenterDate(date);
            setIsCalendarOpen(false);
          }}
          title={cellTheme ? cellTheme.text : undefined}
          style={{ 
            width: "100%", 
            aspectRatio: "1/1", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "50%",
            fontSize: "0.75rem",
            fontWeight: isSelected ? "600" : (cellTheme || hasPost ? "700" : "500"),
            backgroundColor: isSelected 
              ? (selectedTheme ? selectedTheme.primary : (hasPost ? "#B47A3E" : "var(--text-primary)")) 
              : (cellTheme 
                  ? (isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.95)") 
                  : (hasPost 
                      ? (isDark ? "rgba(180, 122, 62, 0.12)" : "#ffffff") 
                      : "transparent")),
            color: isSelected 
              ? "var(--bg-color)" 
              : (isToday 
                  ? "#ff3b30" 
                  : (cellTheme 
                      ? cellTheme.primary 
                      : (hasPost ? "#B47A3E" : "var(--text-primary)"))),
            border: isSelected
              ? "none"
              : (cellTheme 
                  ? `1px solid ${cellTheme.primary}45` 
                  : (hasPost && !isSelected ? "1px solid rgba(180, 122, 62, 0.45)" : "none")),
            boxShadow: isSelected
              ? (isDark 
                  ? "0 4px 10px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)" 
                  : "0 4px 12px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.5)")
              : (hasPost
                  ? (isDark 
                      ? "4px 4px 12px rgba(0, 0, 0, 0.5), -2px -2px 8px rgba(255, 255, 255, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.06)" 
                      : "4px 4px 10px rgba(180, 165, 150, 0.28), -3px -3px 8px #ffffff, inset 0 1px 0 #ffffff")
                  : (cellTheme
                      ? (isDark 
                          ? "0 3px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)" 
                          : "0 3px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)")
                      : "none")),
            transition: "all 0.2s ease",
            position: "relative"
          }}
        >
          <span style={{ position: "relative", zIndex: 2 }}>
            {cellTheme && cellTheme.emoji.includes("🎂") ? "🎂" : i}
          </span>
        </div>
      );
    }
    return days;
  };

  return (
    <div 
      className="daily-journal-feed-container"
      style={{ 
        margin: "0 auto", 
        fontFamily: "var(--font-sans)",
        color: "var(--text-primary)"
      }}
    >
      {/* Dynamic Seasonal Holiday Animations */}
      {selectedTheme?.type === "christmas" && <SnowEffect />}
      {selectedTheme?.type === "independence" && <IndoIndependenceEffect />}
      {(selectedTheme?.type === "idul_fitri" || selectedTheme?.type === "idul_adha" || selectedTheme?.type === "isra_miraj" || selectedTheme?.type === "islamic_new_year" || selectedTheme?.type === "maulid_nabi") && <EidFitriEffect />}
      {selectedTheme?.type === "waisak" && <WaisakEffect />}
      {selectedTheme?.type === "nyepi" && <NyepiEffect />}
      {selectedTheme?.type === "lunar_new_year" && <LunarNewYearEffect />}
      {selectedTheme?.type === "general_holiday" && <HolyLightEffect />}
      {showBirthdayConfetti && selectedTheme && (
        <BirthdayConfettiEffect type={selectedTheme.type} />
      )}
      {selectedTheme && (
        <style>{`
          :root {
            --bg-color: ${selectedTheme.bgLight} !important;
            --bg-color-rgba: rgba(255, 255, 255, 0.75) !important;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-color: ${selectedTheme.bgDark} !important;
              --bg-color-rgba: rgba(0, 0, 0, 0.75) !important;
            }
          }
        `}</style>
      )}
      <style>{`
        .blog-slider-section {
          margin-top: 2.8rem !important;
          padding-top: 1.8rem !important;
          border-top: 1px solid rgba(150, 150, 150, 0.12) !important;
        }
        .mobile-only-section {
          display: block !important;
        }
        .desktop-only-section {
          display: none !important;
        }
        @media (min-width: 768px) {
          .mobile-only-section {
            display: none !important;
          }
          .desktop-only-section {
            display: block !important;
          }
        }
        body, html {
          transition: background-color 0.4s ease !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .date-strip-container {
          margin-left: calc(-4vw - 1.25rem) !important;
          margin-right: calc(-4vw - 1.25rem) !important;
          padding-left: calc(50% - 25px) !important; /* Centering padding */
          padding-right: calc(50% - 25px) !important; /* Centering padding */
          scroll-snap-type: x mandatory;
          /* Beautiful visual edge fade to prevent hard cuts on scroll */
          mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent) !important;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent) !important;
        }
        @media (min-width: 768px) {
          .date-strip-container {
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            /* Slightly tighter edge fade on desktop sidebar */
            mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent) !important;
            -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent) !important;
          }
        }

        .today-btn, .month-picker-btn {
          transition: transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.18s ease, box-shadow 0.18s ease !important;
        }
        .today-btn:hover, .month-picker-btn:hover {
          transform: translateY(-2.5px) scale(1.04) !important;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.05), inset 0 1.5px 0 #ffffff, inset 0 -2px 0 rgba(0, 0, 0, 0.08) !important;
          background-color: var(--bg-color) !important;
        }
        @media (prefers-color-scheme: dark) {
          .today-btn:hover, .month-picker-btn:hover {
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.6) !important;
            background-color: rgba(255, 255, 255, 0.12) !important;
          }
        }
        .today-btn:active, .month-picker-btn:active {
          transform: translateY(0.5px) scale(0.96) !important;
        }
        .date-pill {
          transition: transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease !important;
        }
        .date-pill:hover {
          transform: translateY(-6px) scale(1.03) !important;
          box-shadow: 0 14px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
          z-index: 5;
        }
        @media (prefers-color-scheme: dark) {
          .date-pill:hover {
            box-shadow: 0 14px 30px -4px rgba(0, 0, 0, 0.45), 0 4px 10px -2px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
          }
        }
        .date-pill:active {
          transform: translateY(0px) scale(0.96) !important;
        }
        .calendar-day-cell {
          transition: transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.18s ease, box-shadow 0.18s ease !important;
        }
        .calendar-day-cell:hover {
          transform: scale(1.18) translateY(-1.5px) !important;
          box-shadow: 0 6px 14px -2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
          z-index: 5;
        }
        @media (prefers-color-scheme: dark) {
          .calendar-day-cell:hover {
            box-shadow: 0 6px 14px -2px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
          }
        }
        .calendar-day-cell:active {
          transform: scale(0.93) translateY(0.5px) !important;
        }

        /* High-Density Mobile Overrides */
        @media (max-width: 599px) {
          .daily-journal-feed-container {
            padding: 0.85rem 0.65rem !important; /* Compact padding */
          }
          .journal-header-container {
            margin-bottom: 0.75rem !important; /* Muted spacing */
          }
          .journal-day-header {
            font-size: 1.65rem !important; /* Even sleeker day header */
          }
          .month-picker-btn {
            padding: 4px 9px !important; /* Snugger button */
            border-radius: 12px !important;
          }
          .month-picker-btn span {
            font-size: 0.76rem !important; /* Compact text inside dropdown trigger */
          }
          .month-picker-btn svg {
            width: 12px !important;
            height: 12px !important;
          }
          .today-btn {
            padding: 4px 9px !important;
            border-radius: 12px !important;
            font-size: 0.76rem !important;
          }
          .journal-post-card {
            padding: 0.65rem 0.75rem !important; /* High density iOS card padding */
            gap: 0.55rem !important;
            border-radius: 12px !important;
          }
          .journal-post-card h3 {
            font-size: 0.85rem !important;
            margin-bottom: 0.1rem !important;
          }
          .journal-post-card p {
            font-size: 0.72rem !important;
            line-height: 1.3 !important;
          }
          .journal-post-card img {
            width: 40px !important; /* Snug post card thumbnail */
            height: 40px !important;
            border-radius: 6px !important;
          }
          .moments-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }

          .date-strip-container {
            margin-left: calc(-4vw - 0.65rem) !important;
            margin-right: calc(-4vw - 0.65rem) !important;
            padding-left: calc(50% - 25px) !important;
            padding-right: calc(50% - 25px) !important;
            padding-bottom: 0.75rem !important;
          }
          .timeline-post-link {
            gap: 0.6rem !important;
            padding-bottom: 0.75rem !important; /* Compact timeline height gaps */
          }
          .custom-calendar-popup {
            padding: 0.75rem !important;
            width: 220px !important; /* Responsive popup size */
            border-radius: 16px !important;
            top: calc(100% + 6px) !important;
          }
          .blog-slider-section {
            margin-top: 1.4rem !important;
            padding-top: 0.9rem !important;
          }
        }
        @media (min-width: 768px) {
          .feed-split-layout {
            display: flex !important;
            flex-direction: row !important;
            gap: 2.5rem !important;
            align-items: flex-start !important;
            justify-content: space-between !important; /* Distribute columns beautifully across layout width */
            min-height: 600px !important; /* Elegant vertical footprint to space footer */
          }
          .feed-column-left {
            flex: 0 0 300px !important; /* Beautiful symmetric width matching Right Column! */
            min-width: 0 !important;
          }
          .feed-column-middle {
            flex: 1 !important;
            min-width: 0 !important;
            max-width: 480px !important; /* Premium book-like readability limit */
          }
          .feed-column-right {
            flex: 0 0 300px !important;
            min-width: 0 !important;
          }
          /* Custom overrides to hide events border on desktop */
          .events-header-container {
            border-top: none !important;
            padding-top: 0 !important;
            margin-top: 1.5rem !important;
          }
        }
      `}</style>

      {/* MOBILE ONLY TOP CALENDAR SECTION */}
      <div className="mobile-only-section">
        {/* 1. HEADER: DAY & CUSTOM DATE PICKER (FULL WIDTH, ABOVE COLUMNS) */}
        <FadeIn delay={0.05} style={{ position: "relative", zIndex: 999999 }}>
        <div className="journal-header-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", padding: "0 0.25rem" }}>
          
          {/* Casino-style letter-by-letter slot-machine vertical roll window */}
          <h1 
            className="journal-day-header"
            style={{ 
              fontSize: "2.5rem", 
              fontWeight: "800", 
              fontFamily: "var(--font-sans)",
              color: "var(--text-primary)",
              margin: 0, 
              lineHeight: 1,
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center"
            }}
          >
            {selectedDate.toLocaleDateString("en-US", { weekday: "short" }).split("").map((char, idx) => {
              // Proportional standard spacing to make letter placement perfectly natural (not too tight, not too loose)
              let charWidth = "0.56em";
              if (char === "W") charWidth = "0.90em";
              else if (char === "M") charWidth = "0.84em";
              else if (char === "T" || char === "F" || char === "S") charWidth = "0.62em";
              else if (char === "w" || char === "m") charWidth = "0.78em";
              else if (char === "i" || char === "l") charWidth = "0.26em";
              else if (char === "f" || char === "t" || char === "r") charWidth = "0.38em";

              return (
                <div 
                  key={idx}
                  style={{ 
                    height: "1.55em", 
                    width: charWidth,
                    overflow: "hidden", 
                    display: "inline-flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    position: "relative"
                  }}
                >
                  <AnimatePresence mode="popLayout" custom={scrollDirection}>
                    <motion.span
                      key={`${char}-${idx}`}
                      custom={scrollDirection}
                      variants={{
                        initial: (direction: "forward" | "backward") => ({
                          y: direction === "forward" ? "100%" : "-100%",
                          opacity: 0,
                          filter: "blur(3px)"
                        }),
                        animate: {
                          y: 0,
                          opacity: 1,
                          filter: "blur(0px)",
                          transition: {
                            type: "spring",
                            stiffness: 380,
                            damping: 20,
                            delay: idx * 0.05 // Authentic staggered jackpot reel stops!
                          }
                        },
                        exit: (direction: "forward" | "backward") => ({
                          y: direction === "forward" ? "-100%" : "100%",
                          opacity: 0,
                          filter: "blur(3px)",
                          transition: {
                            duration: 0.14,
                            ease: "easeInOut"
                          }
                        })
                      }}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      style={{
                        display: "inline-block",
                        lineHeight: 1,
                      }}
                    >
                      {char}
                    </motion.span>
                  </AnimatePresence>
                </div>
              );
            })}
          </h1>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {/* DYNAMIC TODAY BUTTON */}
            {!isSameDay(selectedDate, today) && (
              <button
                onClick={() => selectAndCenterDate(new Date())}
                className="today-btn"
                style={{
                  padding: "6px 12px", 
                  borderRadius: "16px",
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
                  boxShadow: isDark 
                    ? "0 8px 20px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.6)" 
                    : "0 8px 20px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1.5px 0 #ffffff, inset 0 -2px 0 rgba(0, 0, 0, 0.08)",
                  cursor: "pointer",
                  fontSize: "0.76rem", 
                  fontWeight: "600",
                  color: selectedTheme ? selectedTheme.primary : "var(--text-primary)",
                  fontFamily: "var(--font-sans)"
                }}
              >
                Today
              </button>
            )}

            {/* Custom Date Picker Button & Dropdown */}
            <div style={{ position: "relative", zIndex: 1000 }} ref={calendarMobileRef}>
              <button 
                onClick={handleOpenCalendar}
                className="month-picker-btn"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  color: selectedTheme ? selectedTheme.primary : "var(--text-primary)", 
                  cursor: "pointer",
                  padding: "6px 12px", 
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
                  boxShadow: isDark 
                    ? "0 8px 20px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.6)" 
                    : "0 8px 20px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1.5px 0 #ffffff, inset 0 -2px 0 rgba(0, 0, 0, 0.08)",
                  outline: "none",
                  borderRadius: "16px",
                  fontFamily: "var(--font-sans)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: "600", fontFamily: "var(--font-sans)", letterSpacing: "-0.01em" }}>
                    {selectedDate.toLocaleDateString("en-US", { month: "long" })}
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: "400", opacity: 0.65, fontFamily: "var(--font-sans)", paddingTop: "0.5px" }}>
                    {selectedDate.getFullYear()}
                  </span>
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: selectedTheme ? 0.9 : 0.6, color: selectedTheme ? selectedTheme.primary : "inherit", transform: isCalendarOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            
            {/* CUSTOM CALENDAR POPUP */}
            <AnimatePresence>
              {isCalendarOpen && (
                <motion.div 
                  className="custom-calendar-popup"
                  initial={{ opacity: 0, scale: 0.94, y: -8, originX: 0.9, originY: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ type: "spring", damping: 25, stiffness: 320 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "240px", 
                    backgroundColor: isDark 
                      ? (selectedTheme ? selectedTheme.bgDark : "#141312") 
                      : (selectedTheme ? selectedTheme.bgLight : "#FDFBF7"),
                    border: selectedTheme 
                      ? (isDark ? `1px solid rgba(255, 255, 255, 0.15)` : `1px solid rgba(180, 122, 62, 0.22)`)
                      : (isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)"),
                    borderRadius: "22px",
                    boxShadow: isDark 
                      ? "0 24px 60px -8px rgba(0, 0, 0, 0.7), 0 8px 24px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)" 
                      : (selectedTheme 
                          ? "0 20px 48px -8px rgba(0, 0, 0, 0.12), 0 8px 20px -4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
                          : "0 20px 48px -8px rgba(0, 0, 0, 0.1), 0 8px 20px -4px rgba(0, 0, 0, 0.05), inset 0 1px 0 #ffffff"),
                    padding: "1.1rem", 
                    zIndex: 100,
                  }}
                >
                  {/* Calendar Header: Month Year + Chevrons */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                    <button 
                      onClick={() => {
                        if (isWheelPickerOpen) {
                          setIsWheelPickerOpen(false);
                        } else {
                          changeMonth(-1);
                        }
                      }} 
                      style={{ 
                        background: "rgba(150,150,150,0.06)", 
                        border: "1px solid rgba(150,150,150,0.1)", 
                        cursor: isWheelPickerOpen ? "default" : "pointer", 
                        color: "var(--text-primary)", 
                        padding: "4px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                        opacity: isWheelPickerOpen ? 0.25 : 1
                      }}
                      disabled={isWheelPickerOpen}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    
                    <div 
                      onClick={() => {
                        if (!isWheelPickerOpen) {
                          const viewYear = calendarViewDate.getFullYear();
                          setTempMonth(calendarViewDate.getMonth());
                          setTempYear(viewYear);
                          setYearPageStart(viewYear - (viewYear % 8));
                        }
                        setIsWheelPickerOpen(!isWheelPickerOpen);
                      }}
                      style={{ 
                        fontWeight: "750", 
                        fontSize: "0.90rem", 
                        fontFamily: "var(--font-sans)", 
                        letterSpacing: "0.01em", 
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "8px",
                        backgroundColor: isWheelPickerOpen ? "rgba(150, 150, 150, 0.08)" : "transparent",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(150, 150, 150, 0.12)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isWheelPickerOpen ? "rgba(150, 150, 150, 0.08)" : "transparent"}
                    >
                      {isWheelPickerOpen 
                        ? `${MONTH_NAMES[tempMonth]} ${tempYear}`
                        : calendarViewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isWheelPickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s ease", opacity: 0.6 }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    <button 
                      onClick={() => {
                        if (isWheelPickerOpen) {
                          setIsWheelPickerOpen(false);
                        } else {
                          changeMonth(1);
                        }
                      }} 
                      style={{ 
                        background: "rgba(150,150,150,0.06)", 
                        border: "1px solid rgba(150,150,150,0.1)", 
                        cursor: isWheelPickerOpen ? "default" : "pointer", 
                        color: "var(--text-primary)", 
                        padding: "4px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                        opacity: isWheelPickerOpen ? 0.25 : 1
                      }}
                      disabled={isWheelPickerOpen}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </div>

                  {isWheelPickerOpen ? (
                    /* TACTILE KEYCAP GRID DASHBOARD SELECTOR */
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                        {/* Month Picker Column */}
                        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.62rem", fontWeight: "750", color: "var(--text-secondary)", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.03em", fontFamily: "var(--font-sans)", paddingLeft: "2px" }}>
                            Month
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
                            {SHORT_MONTHS.map((m, idx) => {
                              const isSelected = tempMonth === idx;
                              return (
                                <button
                                  key={m}
                                  onClick={() => {
                                    setTempMonth(idx);
                                    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
                                  }}
                                  style={{
                                    padding: "5px 0",
                                    borderRadius: "8px",
                                    fontSize: "0.68rem",
                                    fontWeight: "700",
                                    fontFamily: "var(--font-sans)",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    border: isSelected 
                                      ? "1px solid transparent" 
                                      : (isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)"),
                                    backgroundColor: isSelected 
                                      ? (selectedTheme ? selectedTheme.primary : "var(--text-primary)")
                                      : (isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff"),
                                    color: isSelected 
                                      ? (selectedTheme ? "#ffffff" : "var(--bg-color)")
                                      : "var(--text-primary)",
                                    boxShadow: isSelected
                                      ? (isDark 
                                          ? "0 3px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.4)" 
                                          : "0 3px 8px rgba(0,0,0,0.12), inset 0 1.5px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)")
                                      : (isDark 
                                          ? "0 2px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1.5px 0 rgba(0,0,0,0.3)" 
                                          : "0 2px 4px rgba(0,0,0,0.03), inset 0 1px 0 #ffffff, inset 0 -1.5px 0 rgba(0,0,0,0.06)"),
                                    transition: "all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
                                      e.currentTarget.style.backgroundColor = isDark ? "rgba(255, 255, 255, 0.1)" : "#f5f5f7";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.transform = "none";
                                      e.currentTarget.style.backgroundColor = isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff";
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    e.currentTarget.style.transform = "scale(0.94)";
                                  }}
                                  onMouseUp={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
                                    } else {
                                      e.currentTarget.style.transform = "none";
                                    }
                                  }}
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Year Picker Column */}
                        <div style={{ flex: 0.8, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingRight: "4px" }}>
                            <span style={{ fontSize: "0.62rem", fontWeight: "750", color: "var(--text-secondary)", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.03em", fontFamily: "var(--font-sans)", paddingLeft: "2px" }}>
                              Year
                            </span>
                            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setYearPageStart(prev => prev - 8);
                                }}
                                style={{ 
                                  background: "none", 
                                  border: "none", 
                                  cursor: "pointer", 
                                  color: "var(--text-primary)", 
                                  opacity: 0.6,
                                  padding: "0 2px", 
                                  display: "flex", 
                                  alignItems: "center" 
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setYearPageStart(prev => prev + 8);
                                }}
                                style={{ 
                                  background: "none", 
                                  border: "none", 
                                  cursor: "pointer", 
                                  color: "var(--text-primary)", 
                                  opacity: 0.6,
                                  padding: "0 2px", 
                                  display: "flex", 
                                  alignItems: "center" 
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </button>
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px" }}>
                            {YEARS_LIST.map((y) => {
                              const isSelected = tempYear === y;
                              return (
                                <button
                                  key={y}
                                  onClick={() => {
                                    setTempYear(y);
                                    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
                                  }}
                                  style={{
                                    padding: "5px 0",
                                    borderRadius: "8px",
                                    fontSize: "0.66rem",
                                    fontWeight: "700",
                                    letterSpacing: "-0.01em",
                                    fontFamily: "var(--font-sans)",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    border: isSelected 
                                      ? "1px solid transparent" 
                                      : (isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)"),
                                    backgroundColor: isSelected 
                                      ? (selectedTheme ? selectedTheme.primary : "var(--text-primary)")
                                      : (isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff"),
                                    color: isSelected 
                                      ? (selectedTheme ? "#ffffff" : "var(--bg-color)")
                                      : "var(--text-primary)",
                                    boxShadow: isSelected
                                      ? (isDark 
                                          ? "0 3px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.4)" 
                                          : "0 3px 8px rgba(0,0,0,0.12), inset 0 1.5px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)")
                                      : (isDark 
                                          ? "0 2px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1.5px 0 rgba(0,0,0,0.3)" 
                                          : "0 2px 4px rgba(0,0,0,0.03), inset 0 1px 0 #ffffff, inset 0 -1.5px 0 rgba(0,0,0,0.06)"),
                                    transition: "all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
                                      e.currentTarget.style.backgroundColor = isDark ? "rgba(255, 255, 255, 0.1)" : "#f5f5f7";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.transform = "none";
                                      e.currentTarget.style.backgroundColor = isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff";
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    e.currentTarget.style.transform = "scale(0.94)";
                                  }}
                                  onMouseUp={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
                                    } else {
                                      e.currentTarget.style.transform = "none";
                                    }
                                  }}
                                >
                                  {y}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Apply Done Button */}
                      <button
                        onClick={() => {
                          const newDate = new Date(calendarViewDate);
                          newDate.setMonth(tempMonth);
                          newDate.setFullYear(tempYear);
                          setCalendarViewDate(newDate);
                          setIsWheelPickerOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          marginTop: "2px",
                          backgroundColor: "var(--text-primary)",
                          color: "var(--bg-color)",
                          border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.12)",
                          borderRadius: "12px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          fontFamily: "var(--font-sans)",
                          cursor: "pointer",
                          boxShadow: isDark
                            ? "0 4px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(255, 255, 255, 0.1)"
                            : "0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.1)",
                          transition: "all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1.5px)";
                          e.currentTarget.style.boxShadow = isDark
                            ? "0 6px 14px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)"
                            : "0 6px 12px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = isDark
                            ? "0 4px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(255, 255, 255, 0.1)"
                            : "0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.1)";
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = "translateY(0.5px) scale(0.98)";
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = "translateY(-1.5px)";
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Day Labels */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", marginBottom: "0.5rem" }}>
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                          <div key={day} className="calendar-day-label" style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", rowGap: "5px" }}>
                        {renderCalendarDays()}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </FadeIn>

      {/* 2. HORIZONTAL DATE SELECTOR STRIP (FULL WIDTH, ABOVE COLUMNS) */}
      <FadeIn delay={0.1} style={{ position: "relative", zIndex: 1 }}>
        <div 
          ref={stripContainerMobileRef}
          onScroll={handleStripScrollMobile}
          className="no-scrollbar date-strip-container"
          style={{ 
            display: "flex", 
            gap: "0.22rem",
            alignItems: "flex-end", // Ground the pills to the bottom baseline so floating looks natural
            marginBottom: "1.5rem",
            borderBottom: "1px solid rgba(150, 150, 150, 0.12)",
            padding: "12px 0 1.1rem 0", // Give 12px breathing room at the top to prevent clipping during hover/active rises
            overflowX: "auto",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            transformStyle: "preserve-3d",
            perspective: "500px"
          }}>
          {stripDates.map((d, i) => {
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);
            const hasPost = hasPostOnDate(d);
            const pillTheme = getSelectedTheme(d, calendarEvents);
            
            const isSunday = d.getDay() === 0;
            const dKey = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const fullDKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const isHoliday = calendarEvents.some(e => (e.dateKey === dKey || e.dateKey === fullDKey) && e.type !== "ivan" && e.type !== "female" && e.type !== "male" && e.type !== "both");
            
            // Color Hierarchy
            const sundayColor = "#ff3b30";
            const holidayColor = "#ff726f"; 
            const activeColor = isSunday 
              ? sundayColor 
              : (isHoliday 
                  ? holidayColor 
                  : (pillTheme 
                      ? pillTheme.primary 
                      : (selectedTheme ? selectedTheme.primary : "var(--text-primary)")));
            
            const bgSelected = activeColor;
            
            const bgUnselected = isSunday 
              ? "rgba(255, 59, 48, 0.06)" 
              : (isHoliday 
                  ? "rgba(255, 114, 111, 0.05)" 
                  : (pillTheme 
                      ? pillTheme.bgUnselected 
                      : (hasPost 
                          ? "rgba(180, 122, 62, 0.08)" 
                          : "rgba(150, 150, 150, 0.03)")));
            
            const borderSelected = `1.5px solid ${activeColor}`;
            
            const borderUnselected = isSunday 
              ? "1px solid rgba(255, 59, 48, 0.55)" 
              : (isHoliday 
                  ? "1px solid rgba(255, 114, 111, 0.45)" 
                  : (pillTheme 
                      ? pillTheme.borderUnselected 
                      : (hasPost 
                          ? "1px solid rgba(180, 122, 62, 0.65)" 
                          : (selectedTheme ? selectedTheme.borderUnselected : (isDark ? "1px solid rgba(255, 255, 255, 0.22)" : "1px solid rgba(0, 0, 0, 0.16)")))));
            
            return (
              <div 
                key={i}
                className="date-pill"
                data-selected={isSelected}
                data-date={d.toDateString()}
                onClick={() => selectAndCenterDate(d)}
                title={pillTheme ? pillTheme.text : undefined}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  width: "50px", 
                  height: "70px", 
                  borderRadius: "16px", 
                  backgroundColor: isSelected ? bgSelected : bgUnselected,
                  border: isSelected ? borderSelected : borderUnselected,
                  color: isSelected ? "var(--bg-color)" : activeColor,
                  // hardware acceleration properties to keep 3D transforms razor-sharp without blur or jagged edges!
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitFontSmoothing: "subpixel-antialiased",
                  transformOrigin: "center center",
                  scrollSnapAlign: "center",
                  transform: isSelected ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: isSelected 
                    ? (isDark 
                        ? "0 12px 28px -4px rgba(0, 0, 0, 0.45), 0 4px 10px -2px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)" 
                        : `0 12px 28px -4px rgba(0, 0, 0, 0.14), 0 4px 10px -2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.45)`)
                    : (isDark 
                        ? "0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)" 
                        : "0 2px 6px rgba(0, 0, 0, 0.03), inset 0 1px 0 #ffffff"),
                  transition: "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease"
                }}
              >
                {/* Hanging ribbon bookmark for dates with posts */}
                {hasPost && (
                  <div 
                    title="Contains journal entries"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "11px",
                      width: "8px",
                      height: "15px",
                      backgroundColor: isSelected ? "var(--bg-color)" : (pillTheme ? pillTheme.primary : "#B47A3E"),
                      clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)",
                      opacity: 0.95,
                      transition: "all 0.2s ease",
                      zIndex: 3
                    }} 
                  />
                )}

                {/* Dot indicator area */}
                <div style={{ position: "absolute", top: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pillTheme ? null : isToday ? (
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: isSelected ? "var(--bg-color)" : sundayColor }} />
                  ) : null}
                </div>
                
                {/* Birthday cake replaces date numbers directly */}
                {pillTheme && pillTheme.emoji && pillTheme.emoji.includes("🎂") ? (
                  <span 
                    className="date-pill-day-num"
                    style={{ 
                      fontSize: "1.45rem", 
                      lineHeight: 1,
                      marginTop: "10px",
                      display: "block"
                    }}
                  >
                    🎂
                  </span>
                ) : (
                  <span 
                    className="date-pill-day-num"
                    style={{ 
                      fontSize: "1.22rem", 
                      fontWeight: isSelected ? "750" : "600", // Slightly bolder for higher contrast when unselected
                      lineHeight: 1,
                      marginTop: "10px"
                    }}
                  >
                    {d.getDate()}
                  </span>
                )}
                
                <span 
                  className="date-pill-day-name"
                  style={{ 
                    fontSize: "0.6rem", 
                    textTransform: "uppercase",
                    fontWeight: isSelected ? "750" : "600",
                    letterSpacing: "0.05em",
                    marginTop: "6px",
                    color: isSelected ? "var(--bg-color)" : (isToday ? sundayColor : (isSunday || isHoliday ? activeColor : "var(--text-secondary)")),
                    opacity: isSelected ? 1 : (isSunday || isHoliday || isToday ? 1 : 0.85) // Significantly clearer unselected text color
                  }}
                >
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              </div>
            );
          })}
        </div>
      </FadeIn>
      </div>

      {/* 3. SPLIT LAYOUT (3 COLUMNS ON DESKTOP, VERTICALLY STACKED ON MOBILE) */}
      <div className="feed-split-layout">
        
        {/* Column 1: Events (Left Column) */}
        <FadeIn delay={0.15} className="feed-column feed-column-left" style={{ position: "relative", zIndex: 50 }}>
          
          {/* DESKTOP ONLY SIDEBAR CALENDAR SECTION */}
          <div className="desktop-only-section" style={{ 
            borderTop: "1px solid rgba(150,150,150,0.12)", 
            paddingTop: "1rem", 
            marginTop: "0.85rem", 
            marginBottom: "1rem" 
          }}>
            
            {/* 1. HEADER: DAY & CUSTOM DATE PICKER */}
            <div className="journal-header-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "0.8rem" }}>
              
              {/* Casino-style letter-by-letter slot-machine vertical roll window */}
              <h1 
                className="journal-day-header"
                style={{ 
                  fontSize: "2.1rem", 
                  fontWeight: "800", 
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-primary)",
                  margin: 0, 
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {selectedDate.toLocaleDateString("en-US", { weekday: "short" }).split("").map((char, idx) => {
                  let charWidth = "0.56em";
                  if (char === "W") charWidth = "0.90em";
                  else if (char === "M") charWidth = "0.84em";
                  else if (char === "T" || char === "F" || char === "S") charWidth = "0.62em";
                  else if (char === "w" || char === "m") charWidth = "0.78em";
                  else if (char === "i" || char === "l") charWidth = "0.26em";
                  else if (char === "f" || char === "t" || char === "r") charWidth = "0.38em";

                  return (
                    <div 
                      key={idx}
                      style={{ 
                        height: "1.55em", 
                        width: charWidth,
                        overflow: "hidden", 
                        display: "inline-flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        position: "relative"
                      }}
                    >
                      <AnimatePresence mode="popLayout" custom={scrollDirection}>
                        <motion.span
                          key={`${char}-${idx}`}
                          custom={scrollDirection}
                          variants={{
                            initial: (direction: "forward" | "backward") => ({
                              y: direction === "forward" ? "100%" : "-100%",
                              opacity: 0,
                              filter: "blur(3px)"
                            }),
                            animate: {
                              y: 0,
                              opacity: 1,
                              filter: "blur(0px)",
                              transition: {
                                type: "spring",
                                stiffness: 380,
                                damping: 20,
                                delay: idx * 0.05
                              }
                            },
                            exit: (direction: "forward" | "backward") => ({
                              y: direction === "forward" ? "-100%" : "100%",
                              opacity: 0,
                              filter: "blur(3px)",
                              transition: {
                                duration: 0.14,
                                ease: "easeInOut"
                              }
                            })
                          }}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          style={{
                            display: "inline-block",
                            lineHeight: 1,
                          }}
                        >
                          {char}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  );
                })}
              </h1>
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.6rem", width: "100%" }}>
                {/* DYNAMIC TODAY BUTTON */}
                {!isSameDay(selectedDate, today) && (
                  <button
                    onClick={() => selectAndCenterDate(new Date())}
                    className="today-btn"
                    style={{
                      padding: "5px 10px", 
                      borderRadius: "12px",
                      backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
                      boxShadow: isDark 
                        ? "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)" 
                        : "0 4px 12px rgba(0, 0, 0, 0.04), inset 0 1px 0 #ffffff",
                      cursor: "pointer",
                      fontSize: "0.72rem", 
                      fontWeight: "600",
                      color: selectedTheme ? selectedTheme.primary : "var(--text-primary)",
                      fontFamily: "var(--font-sans)"
                    }}
                  >
                    Today
                  </button>
                )}

                {/* Custom Date Picker Button & Dropdown */}
                <div style={{ position: "relative", zIndex: 1000 }} ref={calendarDesktopRef}>
                  <button 
                    onClick={handleOpenCalendar}
                    className="month-picker-btn"
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "5px",
                      color: selectedTheme ? selectedTheme.primary : "var(--text-primary)", 
                      cursor: "pointer",
                      padding: "5px 10px", 
                      backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
                      boxShadow: isDark 
                        ? "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)" 
                        : "0 4px 12px rgba(0, 0, 0, 0.04), inset 0 1px 0 #ffffff",
                      outline: "none",
                      borderRadius: "12px",
                      fontFamily: "var(--font-sans)"
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                      {selectedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isCalendarOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                
                  {/* CUSTOM CALENDAR POPUP */}
                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div 
                        className="custom-calendar-popup"
                        initial={{ opacity: 0, scale: 0.94, y: -8, originX: 0, originY: 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={{ type: "spring", damping: 25, stiffness: 320 }}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 8px)",
                          left: 0, 
                          width: "230px", 
                          backgroundColor: isDark 
                            ? (selectedTheme ? selectedTheme.bgDark : "#141312") 
                            : (selectedTheme ? selectedTheme.bgLight : "#FDFBF7"),
                          border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
                          borderRadius: "18px",
                          boxShadow: isDark 
                            ? "0 20px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)" 
                            : "0 20px 48px rgba(0, 0, 0, 0.08), inset 0 1px 0 #ffffff",
                          padding: "0.9rem", 
                          zIndex: 100,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                          <button 
                            onClick={() => isWheelPickerOpen ? setIsWheelPickerOpen(false) : changeMonth(-1)} 
                            style={{ background: "rgba(150,150,150,0.06)", border: "1px solid rgba(150,150,150,0.1)", cursor: isWheelPickerOpen ? "default" : "pointer", color: "var(--text-primary)", padding: "4px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                            disabled={isWheelPickerOpen}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                          </button>
                          
                          <div 
                            onClick={() => {
                              if (!isWheelPickerOpen) {
                                const viewYear = calendarViewDate.getFullYear();
                                setTempMonth(calendarViewDate.getMonth());
                                setTempYear(viewYear);
                                setYearPageStart(viewYear - (viewYear % 8));
                              }
                              setIsWheelPickerOpen(!isWheelPickerOpen);
                            }}
                            style={{ fontWeight: "750", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            {isWheelPickerOpen ? `${MONTH_NAMES[tempMonth]} ${tempYear}` : calendarViewDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: isWheelPickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s ease", opacity: 0.6 }}>
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>

                          <button 
                            onClick={() => isWheelPickerOpen ? setIsWheelPickerOpen(false) : changeMonth(1)} 
                            style={{ background: "rgba(150,150,150,0.06)", border: "1px solid rgba(150,150,150,0.1)", cursor: isWheelPickerOpen ? "default" : "pointer", color: "var(--text-primary)", padding: "4px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                            disabled={isWheelPickerOpen}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </button>
                        </div>

                        {isWheelPickerOpen ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ fontSize: "0.58rem", fontWeight: "750", color: "var(--text-secondary)", textTransform: "uppercase" }}>Month</span>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px" }}>
                                  {SHORT_MONTHS.map((m, idx) => (
                                    <button
                                      key={m}
                                      onClick={() => setTempMonth(idx)}
                                      style={{
                                        padding: "4px 0",
                                        borderRadius: "6px",
                                        fontSize: "0.64rem",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        border: tempMonth === idx ? "1px solid transparent" : "1px solid rgba(150,150,150,0.08)",
                                        backgroundColor: tempMonth === idx ? (selectedTheme ? selectedTheme.primary : "var(--text-primary)") : "transparent",
                                        color: tempMonth === idx ? "#ffffff" : "var(--text-primary)"
                                      }}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div style={{ flex: 0.8, display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ fontSize: "0.58rem", fontWeight: "750", color: "var(--text-secondary)", textTransform: "uppercase" }}>Year</span>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "3px" }}>
                                  {YEARS_LIST.map((y) => (
                                    <button
                                      key={y}
                                      onClick={() => setTempYear(y)}
                                      style={{
                                        padding: "4px 0",
                                        borderRadius: "6px",
                                        fontSize: "0.62rem",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        border: tempYear === y ? "1px solid transparent" : "1px solid rgba(150,150,150,0.08)",
                                        backgroundColor: tempYear === y ? (selectedTheme ? selectedTheme.primary : "var(--text-primary)") : "transparent",
                                        color: tempYear === y ? "#ffffff" : "var(--text-primary)"
                                      }}
                                    >
                                      {y}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newDate = new Date(calendarViewDate);
                                newDate.setMonth(tempMonth);
                                newDate.setFullYear(tempYear);
                                setCalendarViewDate(newDate);
                                setIsWheelPickerOpen(false);
                              }}
                              style={{ width: "100%", padding: "6px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: "700", cursor: "pointer" }}
                            >
                              Apply
                            </button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "0.4rem" }}>
                              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                                <div key={day} style={{ textAlign: "center", fontSize: "0.64rem", fontWeight: "700", color: "var(--text-secondary)" }}>{day}</div>
                              ))}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                              {renderCalendarDays()}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* 2. HORIZONTAL DATE SELECTOR STRIP */}
            <div 
              ref={stripContainerDesktopRef}
              onScroll={handleStripScrollDesktop}
              className="no-scrollbar date-strip-container"
              style={{ 
                display: "flex", 
                gap: "0.22rem",
                alignItems: "flex-end",
                marginBottom: "1rem",
                borderBottom: "1px solid rgba(150, 150, 150, 0.12)",
                padding: "12px 0 0.9rem 0", /* Increased top padding to 12px for hover elevation safety! */
                overflowX: "auto",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                transformStyle: "preserve-3d",
                perspective: "500px",
                width: "100%"
              }}
            >
              {stripDates.map((d, i) => {
                const isSelected = isSameDay(d, selectedDate);
                const isToday = isSameDay(d, today);
                const hasPost = hasPostOnDate(d);
                const pillTheme = getSelectedTheme(d, calendarEvents);
                
                const isSunday = d.getDay() === 0;
                const dKey = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const fullDKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const isHoliday = calendarEvents.some(e => (e.dateKey === dKey || e.dateKey === fullDKey) && e.type !== "ivan" && e.type !== "female" && e.type !== "male" && e.type !== "both");
                
                const sundayColor = "#ff3b30";
                const holidayColor = "#ff726f"; 
                const activeColor = isSunday ? sundayColor : (isHoliday ? holidayColor : (pillTheme ? pillTheme.primary : (selectedTheme ? selectedTheme.primary : "var(--text-primary)")));
                const bgSelected = activeColor;
                const bgUnselected = isSunday ? "rgba(255, 59, 48, 0.06)" : (isHoliday ? "rgba(255, 114, 111, 0.05)" : (pillTheme ? pillTheme.bgUnselected : (hasPost ? "rgba(180, 122, 62, 0.08)" : "rgba(150, 150, 150, 0.03)")));
                const borderSelected = `1.5px solid ${activeColor}`;
                const borderUnselected = isSunday ? "1px solid rgba(255, 59, 48, 0.55)" : (isHoliday ? "1px solid rgba(255, 114, 111, 0.45)" : (pillTheme ? pillTheme.borderUnselected : (hasPost ? "1px solid rgba(180, 122, 62, 0.65)" : (selectedTheme ? selectedTheme.borderUnselected : (isDark ? "1px solid rgba(255, 255, 255, 0.22)" : "1px solid rgba(0, 0, 0, 0.16)")))));
                
                return (
                  <div 
                    key={i}
                    className="date-pill"
                    data-selected={isSelected}
                    data-date={d.toDateString()}
                    onClick={() => selectAndCenterDate(d)}
                    title={pillTheme ? pillTheme.text : undefined}
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      width: "44px", 
                      height: "60px", 
                      borderRadius: "12px", 
                      backgroundColor: isSelected ? bgSelected : bgUnselected,
                      border: isSelected ? borderSelected : borderUnselected,
                      color: isSelected ? "var(--bg-color)" : activeColor,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      WebkitFontSmoothing: "subpixel-antialiased",
                      transformOrigin: "center center",
                      scrollSnapAlign: "center",
                      transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                      boxShadow: isSelected 
                        ? "0 4px 10px rgba(0, 0, 0, 0.15)" 
                        : "0 2px 4px rgba(0, 0, 0, 0.02)",
                      transition: "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease"
                    }}
                  >
                    {hasPost && (
                      <div 
                        title="Contains journal entries"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "9px",
                          width: "6px",
                          height: "12px",
                          backgroundColor: isSelected ? "var(--bg-color)" : (pillTheme ? pillTheme.primary : "#B47A3E"),
                          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)",
                          opacity: 0.95,
                          zIndex: 3
                        }} 
                      />
                    )}

                    <div style={{ position: "absolute", top: "4px" }}>
                      {pillTheme ? null : isToday ? (
                        <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: isSelected ? "var(--bg-color)" : sundayColor }} />
                      ) : null}
                    </div>
                    
                    {pillTheme && pillTheme.emoji && pillTheme.emoji.includes("🎂") ? (
                      <span className="date-pill-day-num" style={{ fontSize: "1.15rem", lineHeight: 1, marginTop: "6px" }}>🎂</span>
                    ) : (
                      <span className="date-pill-day-num" style={{ fontSize: "1.05rem", fontWeight: isSelected ? "750" : "600", lineHeight: 1, marginTop: "6px" }}>{d.getDate()}</span>
                    )}
                    
                    <span 
                      className="date-pill-day-name"
                      style={{ 
                        fontSize: "0.55rem", 
                        textTransform: "uppercase",
                        fontWeight: isSelected ? "750" : "600",
                        letterSpacing: "0.05em",
                        marginTop: "4px",
                        color: isSelected ? "var(--bg-color)" : (isToday ? sundayColor : (isSunday || isHoliday ? activeColor : "var(--text-secondary)")),
                        opacity: isSelected ? 1 : (isSunday || isHoliday || isToday ? 1 : 0.85) // Significantly clearer unselected text color
                      }}
                    >
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {(() => {
            const selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const selectedDay = String(selectedDate.getDate()).padStart(2, '0');
            const selectedDateKey = `${selectedMonth}-${selectedDay}`;
            const selectedFullDateKey = `${selectedDate.getFullYear()}-${selectedMonth}-${selectedDay}`;
            const dayEvents = calendarEvents.filter(e => e.dateKey === selectedDateKey || e.dateKey === selectedFullDateKey);
            return (
              <>
                <div className="events-header-container" style={{ 
                  borderTop: "1px solid rgba(150,150,150,0.12)", 
                  paddingTop: "1rem", 
                  marginBottom: "0.6rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <h2 style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: "700", 
                    color: "var(--text-primary)", 
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}>
                    Events
                  </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", paddingTop: "0.4rem" }}>
                  {dayEvents.length > 0 ? (
                    dayEvents.map(event => (
                      <div 
                        key={event.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                          color: "var(--text-primary)",
                          padding: "0.4rem 0"
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>{event.emoji}</span>
                        <span>{event.name}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      padding: "0.4rem 0",
                      opacity: 0.75
                    }}>
                      • No events for this date.
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </FadeIn>

        {/* Column 2: Journal (Middle Column) */}
        <FadeIn delay={0.15} className="feed-column feed-column-middle">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ 
            borderTop: "1px solid rgba(150,150,150,0.12)", 
            paddingTop: "1rem", 
            marginTop: "0.85rem", /* Perfectly aligned with the Left and Right column baselines! */
            marginBottom: "0.6rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h2 style={{ 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              color: "var(--text-primary)", 
              margin: 0,
              fontFamily: "var(--font-sans)",
              textTransform: "uppercase",
              letterSpacing: "0.04em"
            }}>
              Journal
            </h2>
            <div style={{
              fontSize: "0.66rem",
              fontWeight: "500",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-sans)",
              opacity: 0.75
            }}>
              {selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          
          {/* TIMELINE FEED */}
          <AnimatePresence mode="wait">
          <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingTop: "0.4rem" }} key={selectedDate.toDateString()}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => {
                const publishTime = new Date(post.published).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                const match = post.content.match(/<img[^>]+src="([^">]+)"/);
                const imageUrl = match ? match[1] : null;
                const rawText = post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                const excerpt = rawText.length > 100 ? rawText.slice(0, 100) + "..." : rawText;

                return (
                  <motion.div
                    key={post.id}
                    custom={index}
                    variants={iosCardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                  <Link 
                    href={`/blog/${post.id}`}
                    className="timeline-post-link"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem", 
                      textDecoration: "none",
                      color: "inherit",
                      paddingBottom: index === filteredPosts.length - 1 ? "0.75rem" : "1.5rem",
                      position: "relative",
                      zIndex: 1
                    }}
                  >
                    {/* Dynamic Spine Line connecting to the next post */}
                    {index !== filteredPosts.length - 1 && (
                      <div style={{ 
                        position: "absolute",
                        top: "10px", 
                        bottom: "-10px", 
                        left: "17px", 
                        width: "1.5px", 
                        backgroundColor: selectedTheme ? `rgba(${selectedTheme.type === "both" ? "168, 85, 247" : selectedTheme.type === "male" ? "0, 122, 255" : "255, 92, 157"}, 0.3)` : "rgba(150,150,150,0.12)",
                        zIndex: 0
                      }} />
                    )}

                    {/* Left Column: Timeline Dot & Time */}
                    <div style={{ 
                      flexShrink: 0, 
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "36px",
                      position: "relative",
                      zIndex: 2,
                      marginTop: "5px"
                    }}>
                      <div style={{ 
                        width: "10px", 
                        height: "10px", 
                        borderRadius: "50%", 
                        backgroundColor: selectedTheme ? selectedTheme.primary : "var(--text-primary)",
                        border: "2.5px solid var(--bg-color)",
                        boxShadow: selectedTheme ? `0 0 0 1px rgba(${selectedTheme.type === "both" ? "168, 85, 247" : selectedTheme.type === "male" ? "0, 122, 255" : "255, 92, 157"}, 0.3)` : "0 0 0 1px rgba(150,150,150,0.15)", 
                        marginBottom: "0.4rem",
                        position: "relative",
                        zIndex: 2
                      }} />
                      <span style={{ 
                        fontSize: "0.68rem", 
                        fontFamily: "var(--font-sans)", 
                        color: selectedTheme ? selectedTheme.primary : "var(--text-secondary)",
                        fontWeight: "600",
                        letterSpacing: "-0.01em"
                      }}>
                        {publishTime}
                      </span>
                    </div>

                    {/* Right Column: iOS Card */}
                    <div
                      className="journal-post-card"
                      style={{
                      flex: 1,
                      backgroundColor: selectedTheme ? selectedTheme.bgUnselected : `var(--card-bg-${(index % 4) + 1})`,
                      borderRadius: "16px", 
                      padding: "1rem", 
                      boxShadow: selectedTheme ? `0 3px 15px rgba(${selectedTheme.type === "both" ? "168, 85, 247" : selectedTheme.type === "male" ? "0, 122, 255" : "255, 92, 157"}, 0.04)` : "0 3px 15px rgba(0, 0, 0, 0.02)",
                      border: selectedTheme ? selectedTheme.borderUnselected : `1px solid var(--card-border-${(index % 4) + 1})`,
                      display: "flex",
                      gap: "0.85rem",
                      minWidth: 0
                    }}
                    >
                      {/* Text Section */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          fontSize: "0.92rem", 
                          fontWeight: "600", 
                          margin: "0 0 0.4rem 0",
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-sans)",
                          letterSpacing: "-0.01em",
                          lineHeight: "1.3"
                        }}>
                          {post.title}
                        </h3>
                        <div style={{ 
                          height: "1px", 
                          backgroundColor: "var(--text-secondary)", 
                          opacity: 0.12, 
                          margin: "0.4rem 0 0.45rem 0" 
                        }} />
                        <p style={{ 
                          fontSize: "0.76rem", 
                          color: "var(--text-secondary)", 
                          margin: 0, 
                          lineHeight: "1.45",
                          fontFamily: "var(--font-sans)",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}>
                          {excerpt}
                        </p>
                      </div>
                      
                      {/* Optional Thumbnail */}
                      {imageUrl && (
                        <div style={{
                          flexShrink: 0,
                          width: "48px", 
                          height: "48px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid rgba(150,150,150,0.08)",
                          backgroundColor: "rgba(150,150,150,0.08)"
                        }}>
                          <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                    </div>
                  </Link>
                  </motion.div>
                );
              })
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "2.5rem 0", 
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontFamily: "var(--font-sans)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <span style={{ fontWeight: "500", opacity: 0.65 }}>No entries for this date.</span>
              </div>
            )}
          </div>
          </AnimatePresence>
        </div>
      </FadeIn>

      {/* MOMENTS SECTION (B&W NATURE GRID) */}
      <FadeIn delay={0.2} className="feed-column feed-column-right">
        <div id="moments" style={{ 
          marginTop: "0.85rem", 
          paddingTop: "1rem", /* Increased to 1rem to perfectly align with Column 1 and Column 2! */
          borderTop: "1px solid rgba(150,150,150,0.12)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <h2 style={{ 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              color: "var(--text-primary)", 
              margin: 0,
              fontFamily: "var(--font-sans)",
              textTransform: "uppercase",
              letterSpacing: "0.04em"
            }}>
              Moments
            </h2>
            
            <Link href="/moments" style={{
              fontSize: "0.66rem",
              fontWeight: "500",
              color: "var(--text-secondary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontFamily: "var(--font-sans)",
              opacity: 0.75
            }}>
              View All 
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>
          </div>
          
          <div 
            className="moments-grid"
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(4, 1fr)", 
              gap: "2px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(150,150,150,0.08)"
            }}
          >
            {displayMoments.map((moment, idx) => (
              <Link href="/moments" key={moment.id || idx} style={{ 
                aspectRatio: "1/1", 
                backgroundColor: "rgba(150,150,150,0.04)",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
                display: "block"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.8";
                const img = e.currentTarget.querySelector('img');
                if(img) img.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
                const img = e.currentTarget.querySelector('img');
                if(img) img.style.transform = "scale(1)";
              }}
              >
                <img 
                  src={moment.url} 
                  alt={moment.title || `Moment ${idx + 1}`} 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    filter: "grayscale(100%) contrast(1.1)", 
                    transition: "transform 0.4s ease" 
                  }} 
                  onError={(e) => { e.currentTarget.src = "/nature_hero.png"; }}
                />
              </Link>
            ))}
          </div>
        </div>
        </FadeIn>
      </div> {/* End feed-split-layout */}

      {/* TACTILE MINIMALIST GALLERY SLIDER SECTION FOR ALL BLOG POSTS */}
      {posts && posts.length > 0 && (() => {
        const canPrev = sliderIndex > 0;
        const canNext = sliderIndex + visibleCards < posts.length;
        const gapPx = 10;
        
        return (
          <FadeIn delay={0.25}>
            <div 
              className="blog-slider-section"
              style={{ paddingBottom: "0.5rem" }}
            >
              {/* Slider Header Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
                <h2 style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "700", 
                  color: "var(--text-primary)", 
                  margin: 0,
                  fontFamily: "var(--font-sans)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em"
                }}>
                  Blog Posts
                </h2>
                
                {/* Minimalist Prev / Next Buttons */}
                {posts.length > visibleCards && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => { if (canPrev) setSliderIndex(prev => prev - 1); }}
                      disabled={!canPrev}
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.08)",
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: canPrev ? "pointer" : "not-allowed",
                        opacity: canPrev ? 1 : 0.35,
                        transition: "all 0.2s ease",
                        outline: "none",
                        padding: 0
                      }}
                      title="Previous posts"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => { if (canNext) setSliderIndex(prev => prev + 1); }}
                      disabled={!canNext}
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.08)",
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: canNext ? "pointer" : "not-allowed",
                        opacity: canNext ? 1 : 0.35,
                        transition: "all 0.2s ease",
                        outline: "none",
                        padding: 0
                      }}
                      title="Next posts"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Slider Viewport Container */}
              <div style={{ position: "relative", width: "100%", overflow: "hidden", paddingBottom: "0.5rem" }}>
                <div style={{
                  display: "flex",
                  gap: `${gapPx}px`,
                  transform: `translateX(calc(-${sliderIndex} * (100% + ${gapPx}px) / ${visibleCards}))`,
                  transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                  width: "100%",
                }}>
                  {posts.map((post) => {
                    const match = post.content.match(/<img[^>]+src="([^">]+)"/);
                    const imageUrl = match ? match[1] : null;
                    const formattedDate = new Date(post.published).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short"
                    });
                    
                    const NATURE_FALLBACKS = [
                      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=300&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=300&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=300&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=300&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=300&auto=format&fit=crop"
                    ];
                    const hash = post.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                    const fallbackImage = NATURE_FALLBACKS[hash % NATURE_FALLBACKS.length];
                    
                    return (
                      <div 
                        key={post.id}
                        style={{
                          width: `calc(${100 / visibleCards}% - ${(gapPx * (visibleCards - 1)) / visibleCards}px)`,
                          flexShrink: 0,
                          boxSizing: "border-box",
                        }}
                      >
                        <Link 
                          href={`/blog/${post.id}`}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            textDecoration: "none",
                            color: "inherit",
                            height: "100%",
                            backgroundColor: selectedTheme ? selectedTheme.bgUnselected : (isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.6)"),
                            border: selectedTheme ? selectedTheme.borderUnselected : "1px solid var(--border-color)",
                            borderRadius: "12px",
                            overflow: "hidden",
                            transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-3px)";
                            e.currentTarget.style.boxShadow = isDark 
                              ? "0 6px 16px rgba(0, 0, 0, 0.35)" 
                              : "0 6px 14px rgba(0, 0, 0, 0.04)";
                            e.currentTarget.style.borderColor = "rgba(150, 150, 150, 0.25)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.borderColor = selectedTheme ? (selectedTheme.borderUnselected.replace("1px solid ", "")) : "var(--border-color)";
                          }}
                        >
                          {/* Chic Gallery Square Image Container */}
                          <div style={{ 
                            width: "100%", 
                            aspectRatio: "1/1", 
                            overflow: "hidden",
                            backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                            position: "relative"
                          }}>
                            <img 
                              src={imageUrl || fallbackImage} 
                              alt="" 
                              style={{ 
                                width: "100%", 
                                height: "100%", 
                                objectFit: "cover",
                                filter: imageUrl ? "none" : "grayscale(100%) contrast(1.15) brightness(0.92)",
                                opacity: imageUrl ? 1 : 0.88,
                                transition: "transform 0.4s ease"
                              }} 
                            />
                          </div>
                          
                          {/* Content Section - High density / ultra clean */}
                          <div style={{ padding: "0.5rem 0.6rem", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ 
                              fontSize: "0.5rem", 
                              fontWeight: "600", 
                              color: "var(--text-secondary)", 
                              opacity: 0.6,
                              textTransform: "uppercase",
                              letterSpacing: "0.02em"
                            }}>
                              {formattedDate}
                            </span>
                            <h4 style={{ 
                              fontSize: "0.72rem", 
                              fontWeight: "650", 
                              margin: 0, 
                              lineHeight: "1.25", 
                              color: "var(--text-primary)",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              height: "2.5em",
                              fontFamily: "var(--font-sans)",
                              letterSpacing: "-0.015em"
                            }}>
                              {post.title}
                            </h4>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeIn>
        );
      })()}
    </div>
  )
}
