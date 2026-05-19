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
  dateKey: string; // "MM-DD" e.g. "08-03" for Ivan's Birthday, "12-25" for Christmas
  name: string; // e.g. "Ivan's Birthday" or "Christmas Day"
  type: "ivan" | "female" | "male" | "both" | "idul_fitri" | "idul_adha" | "christmas" | "chinese_new_year" | "waisak" | "nyepi" | "general_holiday";
  emoji: string; // e.g. "👑🎂", "🎄", "🌙", "🏮", "🇮🇩"
}

// Initial seed list for default birthdays and Indonesian holidays
const DEFAULT_EVENTS: Omit<CalendarEvent, "id">[] = [
  { dateKey: "08-03", name: "Ivan's Birthday", type: "ivan", emoji: "👑🎂" },
  { dateKey: "05-19", name: "Naveena's Birthday", type: "female", emoji: "🎂" },
  { dateKey: "08-31", name: "Vera's Birthday", type: "female", emoji: "🎂" },
  { dateKey: "01-15", name: "Dhiffa's Birthday", type: "female", emoji: "🎂" },
  { dateKey: "10-05", name: "Aluna's Birthday", type: "female", emoji: "🎂" },
  { dateKey: "01-01", name: "New Year's Day", type: "general_holiday", emoji: "🎉" },
  { dateKey: "01-16", name: "Isra Mi'raj", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "02-17", name: "Lunar New Year", type: "chinese_new_year", emoji: "🏮" },
  { dateKey: "03-19", name: "Nyepi (Day of Silence)", type: "nyepi", emoji: "🧘" },
  { dateKey: "03-21", name: "Eid al-Fitr", type: "idul_fitri", emoji: "🌙" },
  { dateKey: "05-27", name: "Eid al-Adha", type: "idul_adha", emoji: "🌙" },
  { dateKey: "08-17", name: "Independence Day", type: "general_holiday", emoji: "🇮🇩" },
  { dateKey: "12-25", name: "Christmas Day", type: "christmas", emoji: "🎄" }
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
    } catch (e) {
      console.error("Firebase calendar read error, fallback to localStorage:", e);
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
        } catch (err) {
          console.error("Failed to seed missing default event to Firebase:", err);
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
    } catch (e) {
      console.error("Firebase calendar write error, fallback to localStorage:", e);
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
    } catch (e) {
      console.error("Firebase calendar update error, fallback to localStorage:", e);
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
    } catch (e) {
      console.error("Firebase calendar delete error, fallback to localStorage:", e);
    }
  }

  const local = getLocalEvents();
  const filtered = local.filter(e => e.id !== id);
  saveLocalEvents(filtered);
  return true;
}
