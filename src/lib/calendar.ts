import { db, hasFirebaseKeys } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

export interface CalendarEvent {
  id: string;
  dateKey: string; // "MM-DD" or "YYYY-MM-DD"
  name: string; // e.g. "Ivan's Birthday" or "Christmas Day"
  type: "ivan" | "female" | "male" | "both" | "idul_fitri" | "idul_adha" | "christmas" | "chinese_new_year" | "waisak" | "nyepi" | "general_holiday" | "isra_miraj" | "islamic_new_year" | "maulid_nabi" | "independence" | "arab_national" | "chinese_national";
  emoji: string; // e.g. "👑🎂", "🎄", "🌙", "🏮", "🇮🇩"
}

// Initial seed list for default birthdays and Indonesian holidays (2024-2030)
const DEFAULT_EVENTS: Omit<CalendarEvent, "id">[] = [
  // --- RECURRING BIRTHDAYS & SOLAR FIXED HOLIDAYS ---
  { dateKey: "08-03", name: "Ivan's Birthday", type: "ivan", emoji: "👑🎂" },
  { dateKey: "05-19", name: "Naveena's Birthday", type: "female", emoji: "🎂" },
  { dateKey: "08-31", name: "Vera's Birthday", type: "female", emoji: "🎂" },
  { dateKey: "01-15", name: "Dhiffa's Birthday", type: "female", emoji: "🎂" },
  { dateKey: "10-05", name: "Aluna's Birthday", type: "female", emoji: "🎂" },
  
  { dateKey: "01-01", name: "New Year's Day", type: "general_holiday", emoji: "🎉" },
  { dateKey: "05-01", name: "International Labor Day", type: "general_holiday", emoji: "🛠️" },
  { dateKey: "06-01", name: "Pancasila Day", type: "general_holiday", emoji: "🦅" },
  { dateKey: "08-17", name: "Independence Day", type: "independence", emoji: "🇮🇩" },
  { dateKey: "12-25", name: "Christmas Day", type: "christmas", emoji: "🎄" },

  // --- SHIFTING NATIONAL HOLIDAYS BY YEAR ---
  // Year 2024
  { dateKey: "2024-02-08", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { dateKey: "2024-02-10", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { dateKey: "2024-03-11", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { dateKey: "2024-03-29", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2024-03-31", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { dateKey: "2024-04-10", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2024-04-11", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2024-05-09", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2024-05-23", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { dateKey: "2024-06-17", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { dateKey: "2024-07-07", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { dateKey: "2024-09-16", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2025
  { dateKey: "2025-01-27", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { dateKey: "2025-01-29", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { dateKey: "2025-03-29", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { dateKey: "2025-04-18", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2025-04-20", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { dateKey: "2025-03-31", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2025-04-01", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2025-05-29", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2025-05-12", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { dateKey: "2025-06-06", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { dateKey: "2025-06-27", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { dateKey: "2025-09-05", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2026 (Current Year)
  { dateKey: "2026-01-16", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { dateKey: "2026-02-17", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { dateKey: "2026-03-19", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { dateKey: "2026-04-03", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2026-04-05", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { dateKey: "2026-03-20", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2026-03-21", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2026-05-14", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2026-05-31", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { dateKey: "2026-05-27", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { dateKey: "2026-06-16", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { dateKey: "2026-08-25", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2027
  { dateKey: "2027-01-05", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { dateKey: "2027-02-06", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { dateKey: "2027-03-08", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { dateKey: "2027-03-26", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2027-03-28", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { dateKey: "2027-03-09", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2027-03-10", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2027-05-06", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2027-05-20", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { dateKey: "2027-05-16", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { dateKey: "2027-06-06", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { dateKey: "2027-08-15", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2028
  { dateKey: "2028-01-24", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { dateKey: "2028-01-26", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { dateKey: "2028-03-26", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { dateKey: "2028-04-14", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2028-04-16", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { dateKey: "2028-02-26", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2028-02-27", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2028-05-25", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2028-05-08", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { dateKey: "2028-05-04", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { dateKey: "2028-05-25", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { dateKey: "2028-08-03", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2029
  { dateKey: "2029-01-13", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { dateKey: "2029-02-13", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { dateKey: "2029-03-15", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { dateKey: "2029-03-30", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2029-04-01", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { dateKey: "2029-02-14", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2029-02-15", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2029-05-10", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2029-05-27", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { dateKey: "2029-04-23", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { dateKey: "2029-05-14", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { dateKey: "2029-07-23", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" },

  // Year 2030
  { dateKey: "2030-01-02", name: "Isra Mi'raj", type: "isra_miraj", emoji: "🌙" },
  { dateKey: "2030-12-22", name: "Isra Mi'raj Holiday", type: "isra_miraj", emoji: "🌙" },
  { dateKey: "2030-02-03", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { dateKey: "2030-03-05", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { dateKey: "2030-04-19", name: "Good Friday", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2030-04-21", name: "Easter Sunday", type: "general_holiday", emoji: "🐣" },
  { dateKey: "2030-02-04", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2030-02-05", name: "Eid al-Fitr Holiday", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "2030-05-30", name: "Ascension Day of Jesus Christ", type: "general_holiday", emoji: "✝️" },
  { dateKey: "2030-05-16", name: "Vesak Day", type: "waisak", emoji: "🪷" },
  { dateKey: "2030-04-12", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { dateKey: "2030-05-03", name: "Islamic New Year", type: "islamic_new_year", emoji: "🌙" },
  { dateKey: "2030-07-12", name: "Prophet Muhammad's Birthday", type: "maulid_nabi", emoji: "🌙" }
];


const getLocalEvents = (): CalendarEvent[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("ivan_calendar_events");
  if (!stored) {
    // Seed initial defaults in localStorage if empty
    const seeded = DEFAULT_EVENTS.map((e, idx) => ({ id: `seed-${idx}`, ...e }));
    localStorage.setItem("ivan_calendar_events", JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(stored);
};

const saveLocalEvents = (events: CalendarEvent[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ivan_calendar_events", JSON.stringify(events));
};

// 1. Fetch All Events
export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
  let items: CalendarEvent[] = [];
  let fetchedSuccessful = false;

  if (hasFirebaseKeys) {
    try {
      const q = collection(db, "calendar");
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as CalendarEvent);
      });
      fetchedSuccessful = true;
    } catch (e: any) {
      console.error("Firebase calendar read error, fallback to localStorage:", e?.message || e);
    }
  }

  if (!fetchedSuccessful) {
    items = getLocalEvents();
  }

  // Merge default static seeded events so that any newly added birthdays or events
  // in the codebase are ALWAYS present and never lost due to stale local/remote data.
  // Proactively save/add them to Firestore/localStorage if missing!
  const merged: CalendarEvent[] = [...items];
  const missingDefaults = DEFAULT_EVENTS.filter(
    def => !items.some(item => item.dateKey === def.dateKey && item.name.toLowerCase() === def.name.toLowerCase())
  );

  if (missingDefaults.length > 0) {
    for (const e of missingDefaults) {
      if (hasFirebaseKeys && fetchedSuccessful) {
        try {
          const docRef = await addDoc(collection(db, "calendar"), e);
          merged.push({ id: docRef.id, ...e });
        } catch (err: any) {
          console.error("Failed to seed missing default event to Firebase:", err?.message || err);
          merged.push({ id: `seed-${Date.now()}-${Math.random()}`, ...e });
        }
      } else {
        merged.push({ id: `seed-${Date.now()}-${Math.random()}`, ...e });
      }
    }
    // Update local storage if we fall back to it
    if (!hasFirebaseKeys || !fetchedSuccessful) {
      saveLocalEvents(merged);
    }
  }

  return merged;
}

// 2. Add Event
export async function addCalendarEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  if (hasFirebaseKeys) {
    try {
      const docRef = await addDoc(collection(db, "calendar"), event);
      return { id: docRef.id, ...event };
    } catch (e: any) {
      console.error("Firebase calendar write error, fallback to localStorage:", e?.message || e);
    }
  }
  
  const local = getLocalEvents();
  const newEvent: CalendarEvent = { id: `local-${Date.now()}`, ...event };
  local.push(newEvent);
  saveLocalEvents(local);
  return newEvent;
}

// 3. Update Event
export async function updateCalendarEvent(id: string, updates: Partial<Omit<CalendarEvent, "id">>): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "calendar", id);
      await updateDoc(docRef, updates);
      return true;
    } catch (e: any) {
      console.error("Firebase calendar update error, fallback to localStorage:", e?.message || e);
    }
  }

  const local = getLocalEvents();
  const updated = local.map(e => e.id === id ? { ...e, ...updates } : e);
  saveLocalEvents(updated);
  return true;
}

// 4. Delete Event
export async function deleteCalendarEvent(id: string): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "calendar", id);
      await deleteDoc(docRef);
      return true;
    } catch (e: any) {
      console.error("Firebase calendar delete error, fallback to localStorage:", e?.message || e);
    }
  }

  const local = getLocalEvents();
  const filtered = local.filter(e => e.id !== id);
  saveLocalEvents(filtered);
  return true;
}
