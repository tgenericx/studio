"use client";

import { createContext, useState, ReactNode } from "react";
import type { DayMode, Task, FixedEvent } from "@/lib/types";

interface AppContextType {
  dayMode: DayMode;
  setDayMode: (mode: DayMode) => void;
  kickstartTime: string;
  setKickstartTime: (time: string) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  events: FixedEvent[];
  setEvents: (events: FixedEvent[]) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const AppContext = createContext<AppContextType>({
  dayMode: "Balanced",
  setDayMode: () => {},
  kickstartTime: "09:00",
  setKickstartTime: () => {},
  tasks: [],
  setTasks: () => {},
  events: [],
  setEvents: () => {},
  selectedDate: new Date(),
  setSelectedDate: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [dayMode, setDayMode] = useState<DayMode>("Balanced");
  const [kickstartTime, setKickstartTime] = useState("09:00");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<FixedEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <AppContext.Provider
      value={{
        dayMode,
        setDayMode,
        kickstartTime,
        setKickstartTime,
        tasks,
        setTasks,
        events,
        setEvents,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
