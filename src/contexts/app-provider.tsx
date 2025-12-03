"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import type { DayMode, Task, FixedEvent, TimeBlock } from "@/lib/types";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, doc, writeBatch, Timestamp, onSnapshot } from "firebase/firestore";
import { format, startOfDay } from "date-fns";

interface AppContextType {
  dayMode: DayMode;
  setDayMode: (mode: DayMode) => void;
  kickstartTime: string;
  setKickstartTime: (time: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  removeTask: (id: string) => void;
  events: FixedEvent[];
  addEvent: (event: Omit<FixedEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  schedule: TimeBlock[];
  setSchedule: (schedule: TimeBlock[]) => void;
  updateBlockStatus: (id: string, status: 'pending' | 'completed') => void;
}

export const AppContext = createContext<AppContextType>({
  dayMode: "Balanced",
  setDayMode: () => {},
  kickstartTime: "09:00",
  setKickstartTime: () => {},
  tasks: [],
  addTask: () => {},
  removeTask: () => {},
  events: [],
  addEvent: () => {},
  removeEvent: () => {},
  selectedDate: new Date(),
  setSelectedDate: () => {},
  schedule: [],
  setSchedule: () => {},
  updateBlockStatus: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [dayMode, setDayModeState] = useState<DayMode>("Balanced");
  const [kickstartTime, setKickstartTimeState] = useState("09:00");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<FixedEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedule, setScheduleState] = useState<TimeBlock[]>([]);

  const { user } = useUser();
  const firestore = useFirestore();

  const dateString = format(startOfDay(selectedDate), "yyyy-MM-dd");

  const dayDocRef = user && firestore ? doc(firestore, "users", user.uid, "days", dateString) : null;
  const tasksColRef = user && firestore ? collection(firestore, "users", user.uid, "days", dateString, "tasks") : null;
  const eventsColRef = user && firestore ? collection(firestore, "users", user.uid, "days", dateString, "events") : null;
  const scheduleColRef = user && firestore ? collection(firestore, "users", user.uid, "days", dateString, "schedule") : null;

  // Load data from firestore
  useEffect(() => {
    if (dayDocRef) {
      const unsub = onSnapshot(dayDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDayModeState(data.dayMode || "Balanced");
          setKickstartTimeState(data.kickstartTime || "09:00");
        } else {
           // Reset to default if no doc for this day
           setDayModeState("Balanced");
           setKickstartTimeState("09:00");
        }
      });
      return unsub;
    }
  }, [dayDocRef]);

  const { data: tasksData } = useCollection(tasksColRef);
  useEffect(() => {
    if (tasksData) {
      setTasks(tasksData as Task[]);
    } else {
      setTasks([]);
    }
  }, [tasksData]);

  const { data: eventsData } = useCollection(eventsColRef);
  useEffect(() => {
    if (eventsData) {
      setEvents(eventsData as FixedEvent[]);
    } else {
      setEvents([]);
    }
  }, [eventsData]);
  
  const { data: scheduleData } = useCollection(scheduleColRef);
  useEffect(() => {
    if (scheduleData) {
      const parsedSchedule = scheduleData.map((block: any) => ({
        ...block,
        start: block.start.toDate(),
        end: block.end.toDate(),
      })) as TimeBlock[];
      setScheduleState(parsedSchedule);
    } else {
      setScheduleState([]);
    }
  }, [scheduleData]);

  // Write data to firestore
  const setDayMode = async (mode: DayMode) => {
    setDayModeState(mode);
    if (dayDocRef) {
      await (await import('firebase/firestore')).setDoc(dayDocRef, { dayMode: mode }, { merge: true });
    }
  };

  const setKickstartTime = async (time: string) => {
    setKickstartTimeState(time);
    if (dayDocRef) {
      await (await import('firebase/firestore')).setDoc(dayDocRef, { kickstartTime: time }, { merge: true });
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    if (tasksColRef) {
      await (await import('firebase/firestore')).addDoc(tasksColRef, task);
    }
  };

  const removeTask = async (id: string) => {
    if (tasksColRef) {
      await (await import('firebase/firestore')).deleteDoc(doc(tasksColRef, id));
    }
  };

  const addEvent = async (event: Omit<FixedEvent, 'id'>) => {
    if (eventsColRef) {
      await (await import('firebase/firestore')).addDoc(eventsColRef, event);
    }
  };
  
  const removeEvent = async (id: string) => {
    if (eventsColRef) {
      await (await import('firebase/firestore')).deleteDoc(doc(eventsColRef, id));
    }
  };

  const setSchedule = async (newSchedule: TimeBlock[]) => {
    if (firestore && scheduleColRef) {
      const batch = writeBatch(firestore);
      // Delete old schedule
      const oldScheduleSnap = await (await import('firebase/firestore')).getDocs(scheduleColRef);
      oldScheduleSnap.forEach(doc => batch.delete(doc.ref));

      // Add new schedule
      newSchedule.forEach(block => {
        const docRef = doc(scheduleColRef);
        const blockForStore = {
          ...block,
          start: Timestamp.fromDate(block.start),
          end: Timestamp.fromDate(block.end),
        }
        batch.set(docRef, blockForStore);
      });
      await batch.commit();
    }
    setScheduleState(newSchedule);
  }
  
  const updateBlockStatus = async (id: string, status: 'pending' | 'completed') => {
      if(scheduleColRef) {
        // This is not efficient, but it's simple for now.
        // A better approach would be to find the document by block id.
        const querySnapshot = await (await import('firebase/firestore')).getDocs(scheduleColRef);
        querySnapshot.forEach(async (document) => {
          const block = document.data();
          if (block.id === id) {
            await (await import('firebase/firestore')).updateDoc(document.ref, { status });
          }
        });
      }
  };


  return (
    <AppContext.Provider
      value={{
        dayMode,
        setDayMode,
        kickstartTime,
        setKickstartTime,
        tasks,
        addTask,
        removeTask,
        events,
        addEvent,
        removeEvent,
        selectedDate,
        setSelectedDate,
        schedule,
        setSchedule,
        updateBlockStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
