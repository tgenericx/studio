"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import type { DayMode, Task, FixedEvent, TimeBlock } from "@/lib/types";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, doc, writeBatch, Timestamp, setDoc, addDoc, deleteDoc, getDocs, onSnapshot } from "firebase/firestore";
import { format, startOfDay } from "date-fns";

interface AppContextType {
  dayMode: DayMode;
  setDayMode: (mode: DayMode) => void;
  kickstartTime: string;
  setKickstartTime: (time: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
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

  // Memoize refs
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
           setDayModeState("Balanced");
           setKickstartTimeState("09:00");
        }
      });
      return () => unsub();
    } else {
        setDayModeState("Balanced");
        setKickstartTimeState("09:00");
        setTasks([]);
        setEvents([]);
        setScheduleState([]);
    }
  }, [dayDocRef]);

  const { data: tasksData } = useCollection(tasksColRef);
  useEffect(() => {
    setTasks(tasksData as Task[] || []);
  }, [tasksData]);

  const { data: eventsData } = useCollection(eventsColRef);
  useEffect(() => {
    setEvents(eventsData as FixedEvent[] || []);
  }, [eventsData]);
  
  const { data: scheduleData } = useCollection(scheduleColRef);
  useEffect(() => {
    if (scheduleData) {
      const parsedSchedule = scheduleData.map((block: any) => ({
        ...block,
        start: block.start.toDate(),
        end: block.end.toDate(),
      })).sort((a, b) => a.start.getTime() - b.start.getTime()) as TimeBlock[];
      setScheduleState(parsedSchedule);
    } else {
      setScheduleState([]);
    }
  }, [scheduleData]);

  // Write data to firestore
  const setDayMode = async (mode: DayMode) => {
    setDayModeState(mode);
    if (dayDocRef) {
      await setDoc(dayDocRef, { dayMode: mode }, { merge: true });
    }
  };

  const setKickstartTime = async (time: string) => {
    setKickstartTimeState(time);
    if (dayDocRef) {
      await setDoc(dayDocRef, { kickstartTime: time }, { merge: true });
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'status'>) => {
    if (tasksColRef) {
      await addDoc(tasksColRef, { ...task, status: 'pending'});
    }
  };

  const removeTask = async (id: string) => {
    if (tasksColRef) {
      await deleteDoc(doc(tasksColRef, id));
    }
  };

  const addEvent = async (eventData: Omit<FixedEvent, 'id'>) => {
    if (eventsColRef) {
      await addDoc(eventsColRef, eventData);
    }
  };
  
  const removeEvent = async (id: string) => {
    if (eventsColRef) {
      await deleteDoc(doc(eventsColRef, id));
    }
  };

  const setSchedule = async (newSchedule: TimeBlock[]) => {
    if (firestore && scheduleColRef) {
      const batch = writeBatch(firestore);
      const oldScheduleSnap = await getDocs(scheduleColRef);
      oldScheduleSnap.forEach(doc => batch.delete(doc.ref));

      newSchedule.forEach(block => {
        // Firebase works with document IDs, but the block itself doesn't need to know its doc ID
        // so we create a new ref for each block.
        const docRef = doc(collection(firestore, scheduleColRef.path));
        const blockForStore = {
          ...block,
          id: block.id, // Keep original ID for client-side logic
          start: Timestamp.fromDate(block.start),
          end: Timestamp.fromDate(block.end),
        }
        batch.set(docRef, blockForStore);
      });
      await batch.commit();
    }
    // The state will be updated by the onSnapshot listener, so no need to set it here.
  }
  
  const updateBlockStatus = async (id: string, status: 'pending' | 'completed') => {
      if(scheduleColRef) {
        const querySnapshot = await getDocs(scheduleColRef);
        querySnapshot.forEach(async (document) => {
          if (document.data().id === id) {
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
