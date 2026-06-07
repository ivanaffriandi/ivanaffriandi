"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PerformanceContextType {
  lowPerfMode: boolean;
  toggleLowPerfMode: () => void;
  isAndroid: boolean;
  isLowSpec: boolean;
  mounted: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const LOW_PERF_STORAGE_KEY = "ivan_low_perf_pref";

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [lowPerfMode, setLowPerfMode] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isLowSpec, setIsLowSpec] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect Android
    const android = /Android/i.test(navigator.userAgent);
    setIsAndroid(android);

    // Detect hardware limitations
    const nav = navigator as any;
    const hasLowRAM = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
    const hasLowCPU = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowSpec = hasLowRAM || hasLowCPU || prefersReducedMotion || android;
    setIsLowSpec(lowSpec);

    // Read stored preference
    const saved = localStorage.getItem(LOW_PERF_STORAGE_KEY);
    if (saved !== null) {
      setLowPerfMode(saved === "true");
    } else {
      // Default to lowPerfMode true if Android or low spec
      setLowPerfMode(lowSpec);
    }
    
    setMounted(true);
  }, []);

  const toggleLowPerfMode = () => {
    const newVal = !lowPerfMode;
    setLowPerfMode(newVal);
    localStorage.setItem(LOW_PERF_STORAGE_KEY, String(newVal));
    
    // Dispatch custom event if other code needs to react instantly
    window.dispatchEvent(new CustomEvent("ivan-perf-change", { detail: newVal }));
  };

  useEffect(() => {
    const handlePerfChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (customEvent.detail !== undefined) {
        setLowPerfMode(customEvent.detail);
      }
    };
    window.addEventListener("ivan-perf-change", handlePerfChange);
    return () => {
      window.removeEventListener("ivan-perf-change", handlePerfChange);
    };
  }, []);

  // Sync body and document classes client-side to dynamically apply CSS overrides
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;
    if (lowPerfMode) {
      document.body.classList.add("low-perf-mode");
      document.documentElement.classList.add("low-perf-mode");
    } else {
      document.body.classList.remove("low-perf-mode");
      document.documentElement.classList.remove("low-perf-mode");
    }
  }, [lowPerfMode, mounted]);

  return (
    <PerformanceContext.Provider value={{ lowPerfMode, toggleLowPerfMode, isAndroid, isLowSpec, mounted }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within a PerformanceProvider");
  }
  return context;
}
