"use client";

import { createContext, useState, ReactNode } from "react";
import type { DayMode, Task, FixedEvent, TimeBlock } from "@/lib/types";
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
  const [dayMode, setDayMode] = useState<DayMode>("Balanced");
  const [kickstartTime, setKickstartTime] = useState("09:00");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<FixedEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);

  const addTask = (task: Omit<Task, 'id' | 'status'>) => {
    setTasks(prev => [...prev, { ...task, id: `task-${Date.now()}`, status: 'pending' }]);
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addEvent = (eventData: Omit<FixedEvent, 'id'>) => {
    setEvents(prev => [...prev, { ...eventData, id: `event-${Date.now()}` }]);
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };
  
  const updateBlockStatus = (id: string, status: 'pending' | 'completed') => {
    setSchedule(prev => prev.map(block => 
      block.id === id ? { ...block, status } : block
    ));
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
