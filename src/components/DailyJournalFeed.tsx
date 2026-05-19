"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FadeIn from "./FadeIn";
import { motion, AnimatePresence } from "framer-motion";

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

const INDONESIAN_HOLIDAYS: Record<string, string[]> = {
  "01-01": ["New Year's Day"],
  "02-08": ["Isra Mi'raj"],
  "02-09": ["Lunar New Year (Joint Holiday)"],
  "02-10": ["Lunar New Year"],
  "03-11": ["Nyepi (Day of Silence)"],
  "03-12": ["Nyepi (Joint Holiday)"],
  "03-29": ["Good Friday"],
  "03-31": ["Easter Sunday"],
  "04-08": ["Eid al-Fitr (Joint Holiday)"],
  "04-09": ["Eid al-Fitr (Joint Holiday)"],
  "04-10": ["Eid al-Fitr"],
  "04-11": ["Eid al-Fitr"],
  "04-12": ["Eid al-Fitr (Joint Holiday)"],
  "04-15": ["Eid al-Fitr (Joint Holiday)"],
  "05-01": ["Labor Day"],
  "05-09": ["Ascension Day"],
  "05-10": ["Ascension Day (Joint Holiday)"],
  "05-23": ["Waisak Day"],
  "05-24": ["Waisak Day (Joint Holiday)"],
  "06-01": ["Pancasila Day"],
  "06-17": ["Eid al-Adha"],
  "06-18": ["Eid al-Adha (Joint Holiday)"],
  "07-07": ["Islamic New Year"],
  "08-17": ["Independence Day"],
  "09-16": ["Prophet Muhammad's Birthday"],
  "12-25": ["Christmas Day"],
  "12-26": ["Christmas (Joint Holiday)"]
};

const getBirthdayTheme = (date: Date) => {
  const month = date.getMonth();
  const day = date.getDate();
  
  const females: string[] = [];
  const males: string[] = [];
  
  // Female Birthdays
  if (month === 4 && day === 19) females.push("Naveena");
  if (month === 7 && day === 31) females.push("Vera");
  if (month === 0 && day === 15) females.push("Dhiffa");
  if (month === 9 && day === 5) females.push("Aluna");
  
  // Male Birthdays
  if (month === 7 && day === 3) males.push("Ivan");
  
  const isFemale = females.length > 0;
  const isMale = males.length > 0;
  
  if (isFemale && isMale) {
    const allNames = [
      ...females,
      ...males.map(n => n === "Ivan" ? "Ivan" : n)
    ].join(" & ");
    
    return {
      type: "both",
      primary: "#a855f7", // Purple
      bgLight: "#FAF5FF",
      bgDark: "#1E112A",
      bgUnselected: "rgba(168, 85, 247, 0.1)",
      borderUnselected: "1px solid rgba(168, 85, 247, 0.2)",
      emoji: "🎂💜",
      text: `${allNames}'s Birthday! ✨💖`
    };
  } else if (isFemale) {
    const names = females.join(" & ");
    return {
      type: "female",
      primary: "#ff5c9d", // Pink
      bgLight: "#FFF5F7",
      bgDark: "#1A0F11",
      bgUnselected: "rgba(255, 192, 203, 0.18)",
      borderUnselected: "1px solid rgba(255, 105, 180, 0.3)",
      emoji: "🎂",
      text: `${names}'s Birthday! ✨💖`
    };
  } else if (isMale) {
    const namesText = males.map(n => n === "Ivan" ? "Ivan Affriandi" : n).join(" & ");
    return {
      type: "male",
      primary: "#007aff", // Blue
      bgLight: "#F0F6FF",
      bgDark: "#0B1528",
      bgUnselected: "rgba(0, 122, 255, 0.12)",
      borderUnselected: "1px solid rgba(0, 122, 255, 0.22)",
      emoji: "🎂",
      text: `${namesText}'s Birthday! ✨💙`
    };
  }
  return null;
};

export default function DailyJournalFeed({ posts, moments = [] }: { posts: any[], moments?: any[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedTheme = getBirthdayTheme(selectedDate);

  // Holiday and Sunday indicators computed globally
  const selectedKey = `${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedHoliday = INDONESIAN_HOLIDAYS[selectedKey]?.[0];
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
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const stripContainerRef = useRef<HTMLDivElement>(null);

  // Guards for smooth scroll-snapping interaction
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticScroll = useRef(false);

  // Low-latency hardware-accelerated 3D barrel roll updater
  const updatePillAnimations = () => {
    if (!stripContainerRef.current) return;
    const container = stripContainerRef.current;
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
  };

  // Orchestrates scrolling a target date pill perfectly to the horizontal viewport center
  const selectAndCenterDate = (date: Date) => {
    setSelectedDate(date);

    // Wait briefly for React rendering so the correct month DOM pills are fully available
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!stripContainerRef.current) return;
        const container = stripContainerRef.current;
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
          
          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScroll.current = false;
            updatePillAnimations(); // Sync styles once scrolling concludes
          }, 450);
        }
      }, 50);
    });
  };

  // Mount/Initial centering animation alignment and client-device timezone sync
  useEffect(() => {
    const clientToday = new Date();
    setCalendarViewDate(new Date(clientToday));
    selectAndCenterDate(clientToday);
  }, []);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
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
  const handleStripScroll = () => {
    // Keep 3D animations updated in real-time on every single scroll frame
    updatePillAnimations();

    // If scrolling was triggered programmatically (e.g. clicking a date),
    // skip center tracking to avoid fighting the smooth scroll animation.
    if (isProgrammaticScroll.current) return;
    if (!stripContainerRef.current) return;

    const container = stripContainerRef.current;
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
      const targetDate = stripDates[closestIndex];
      if (targetDate && targetDate.toDateString() !== selectedDate.toDateString()) {
        setSelectedDate(targetDate); // Updates active journal feed instantly, no scrollTo called!
      }
    }
  };

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
      const cellTheme = getBirthdayTheme(date);
      
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
                  ? cellTheme.bgUnselected 
                  : (hasPost ? "rgba(180, 122, 62, 0.08)" : "transparent")),
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
                  ? cellTheme.borderUnselected 
                  : (hasPost && !isSelected ? "1px solid rgba(180, 122, 62, 0.45)" : "none")),
            transition: "all 0.2s ease",
            position: "relative"
          }}
        >
          {/* Bold, gorgeous hand-drawn scrapbook check-off cross 'X' overlay! */}
          {hasPost && !cellTheme && (
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 1
            }}>
              <svg width="100%" height="100%" viewBox="0 0 32 32" style={{ position: "absolute", opacity: isSelected ? 0.35 : 0.6, color: isSelected ? "var(--bg-color)" : "#B47A3E" }}>
                <line x1="8" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="24" y1="8" x2="8" y2="24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          )}

          <span style={{ position: "relative", zIndex: 2 }}>
            {cellTheme ? "🎂" : i}
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
        maxWidth: "680px", 
        margin: "0 auto", 
        padding: "1.5rem 1.25rem", 
        fontFamily: "var(--font-sans)",
        color: "var(--text-primary)"
      }}
    >
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
        }
        .moments-grid a:nth-child(9) {
          display: none !important;
        }

        /* High-Density Mobile Overrides */
        @media (max-width: 768px) {
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
          .moments-grid a:nth-child(9) {
            display: block !important;
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
          .custom-calendar-popup div {
            font-size: 0.85rem !important;
          }
          .calendar-day-label {
            font-size: 0.6rem !important;
          }
          .calendar-day-cell {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
      <FadeIn delay={0.1}>
        {/* HEADER: DAY & CUSTOM DATE PICKER */}
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
                  backgroundColor: selectedTheme ? selectedTheme.bgUnselected : "rgba(150,150,150,0.06)",
                  border: selectedTheme ? selectedTheme.borderUnselected : "none",
                  cursor: "pointer",
                  fontSize: "0.76rem", 
                  fontWeight: "600",
                  color: selectedTheme ? selectedTheme.primary : "var(--text-primary)",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-sans)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = selectedTheme 
                    ? `rgba(${selectedTheme.type === "both" ? "168, 85, 247" : selectedTheme.type === "male" ? "0, 122, 255" : "255, 92, 157"}, 0.2)` 
                    : "rgba(150,150,150,0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = selectedTheme 
                    ? selectedTheme.bgUnselected 
                    : "rgba(150,150,150,0.06)";
                }}
              >
                Today
              </button>
            )}

            {/* Custom Date Picker Button & Dropdown */}
            <div style={{ position: "relative" }} ref={calendarRef}>
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
                  backgroundColor: selectedTheme 
                    ? selectedTheme.bgUnselected 
                    : (isCalendarOpen ? "rgba(150,150,150,0.12)" : "rgba(150,150,150,0.05)"),
                  border: selectedTheme ? selectedTheme.borderUnselected : "none",
                  outline: "none",
                  borderRadius: "16px",
                  transition: "background-color 0.2s ease"
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
            {isCalendarOpen && (
              <div 
                className="custom-calendar-popup"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "240px", 
                  backgroundColor: "var(--bg-color)",
                  border: selectedTheme ? `1px solid ${selectedTheme.primary}40` : "1px solid rgba(150,150,150,0.15)",
                  borderRadius: "20px",
                  boxShadow: selectedTheme ? `0 8px 30px ${selectedTheme.primary}0a` : "0 8px 30px rgba(0,0,0,0.08)",
                  padding: "1rem", 
                  zIndex: 100,
                }}
              >
                {/* Calendar Header: Month Year + Chevrons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                  <button onClick={() => changeMonth(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", padding: "2px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <div style={{ fontWeight: "750", fontSize: "0.90rem", fontFamily: "var(--font-sans)", letterSpacing: "0.01em", color: "var(--text-primary)" }}>
                    {calendarViewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                  <button onClick={() => changeMonth(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", padding: "2px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>

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
              </div>
            )}
          </div>
        </div>
      </div>

        {/* HORIZONTAL DATE SELECTOR STRIP (FULL MONTH, SCROLL-SNAPPING 3D BARREL-ROLL WHEEL) */}
        <div 
          ref={stripContainerRef}
          onScroll={handleStripScroll}
          className="no-scrollbar date-strip-container"
          style={{ 
            display: "flex", 
            gap: "0.22rem",
            alignItems: "center",
            marginBottom: "0.85rem",
            borderBottom: "1px solid rgba(150, 150, 150, 0.12)",
            padding: "0 0 1.1rem 0",
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
            const pillTheme = getBirthdayTheme(d);
            
            const isSunday = d.getDay() === 0;
            const dKey = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const isHoliday = !!INDONESIAN_HOLIDAYS[dKey];
            
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
              ? "rgba(255, 59, 48, 0.12)" 
              : (isHoliday 
                  ? "rgba(255, 114, 111, 0.08)" 
                  : (pillTheme 
                      ? pillTheme.bgUnselected 
                      : (hasPost 
                          ? "rgba(180, 122, 62, 0.06)" 
                          : (selectedTheme ? selectedTheme.bgUnselected : "rgba(150, 150, 150, 0.04)"))));
            
            const borderSelected = `1.5px solid ${activeColor}`;
            
            const borderUnselected = isSunday 
              ? "1px solid rgba(255, 59, 48, 0.3)" 
              : (isHoliday 
                  ? "1px solid rgba(255, 114, 111, 0.15)" 
                  : (pillTheme 
                      ? pillTheme.borderUnselected 
                      : (hasPost 
                          ? "1px solid rgba(180, 122, 62, 0.45)" 
                          : (selectedTheme ? selectedTheme.borderUnselected : "1px solid rgba(150, 150, 150, 0.08)"))));
            
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
                  boxShadow: isSelected 
                    ? `0 6px 16px rgba(${isSelected && activeColor.startsWith("#") ? "0,0,0" : "0,0,0"}, 0.14)` 
                    : "none",
                  transition: "background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              >
                {/* Hanging ribbon bookmark for dates with posts */}
                {hasPost && !pillTheme && (
                  <div 
                    title="Contains journal entries"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "11px",
                      width: "8px",
                      height: "15px",
                      backgroundColor: isSelected ? "var(--bg-color)" : "#B47A3E",
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
                {pillTheme ? (
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
                      fontWeight: isSelected ? "750" : "500",
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
                    opacity: isSelected ? 1 : (isSunday || isHoliday || isToday ? 1 : 0.55)
                  }}
                >
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              </div>
            )
          })}
        </div>

        {/* HOLIDAY INDICATOR FOR SELECTED DATE ONLY */}
        <div style={{ padding: "0 0.25rem 0.75rem 0.25rem", minHeight: "1.8rem", overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="popLayout" custom={scrollDirection}>
            <motion.div
              key={selectedDate.toDateString() + (selectedHoliday || selectedTheme?.text || "none")}
              custom={scrollDirection}
              variants={{
                initial: (direction: "forward" | "backward") => ({
                  x: direction === "forward" ? 22 : -22,
                  opacity: 0,
                  filter: "blur(2px)"
                }),
                animate: {
                  x: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: {
                    type: "spring",
                    stiffness: 350,
                    damping: 24
                  }
                },
                exit: (direction: "forward" | "backward") => ({
                  x: direction === "forward" ? -22 : 22,
                  opacity: 0,
                  filter: "blur(2px)",
                  transition: {
                    duration: 0.16,
                    ease: "easeInOut"
                  }
                })
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: "100%" }}
            >
              {selectedTheme ? (
                <div style={{ 
                  fontSize: "0.78rem", 
                  color: selectedTheme.primary, 
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: "600"
                }}>
                  <span style={{ fontSize: "0.9rem" }}>{selectedTheme.emoji}</span>
                  <span style={{ letterSpacing: "0.01em" }}>{selectedTheme.text}</span>
                </div>
              ) : selectedHoliday ? (
                <div style={{ 
                  fontSize: "0.75rem", 
                  color: themeColor, 
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-sans)"
                }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: themeColor }} />
                  <span style={{ fontWeight: "500", letterSpacing: "0.01em" }}>{selectedHoliday}</span>
                </div>
              ) : (
                <div style={{ 
                  fontSize: "0.70rem", 
                  color: "var(--text-secondary)", 
                  fontFamily: "var(--font-sans)",
                  opacity: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "var(--text-secondary)", opacity: 0.25 }} />
                  <span>No events for this date.</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* JOURNAL HEADER & FEED CONTENT */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ 
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
                          margin: "0 0 0.3rem 0",
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-sans)",
                          letterSpacing: "-0.01em",
                          lineHeight: "1.3"
                        }}>
                          {post.title && post.title.length > 45 
                            ? post.title.split(' ').slice(0, 4).join(' ') + '...' 
                            : post.title}
                        </h3>
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
      <FadeIn delay={0.2}>
        <div id="moments" style={{ 
          marginTop: "0.85rem", 
          paddingTop: "0.6rem", 
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
            {moments.slice(0, 9).map((moment, idx) => (
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
    </div>
  )
}
