"use client";

import { createContext, useState, ReactNode } from "react";
import type { DayMode, Task, FixedEvent, TimeBlock } from "@/lib/types";
import type { View } from "@/app/page";
import { addDays } from "date-fns";

interface AppContextType {
  view: View;
  setView: (view: View) => void;
  dayMode: DayMode;
  setDayMode: (mode: DayMode) => void;
  kickstartTime: string;
  setKickstartTime: (time: string) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  events: FixedEvent[];
  addEvent: (event: Omit<FixedEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  schedule: TimeBlock[];
  setSchedule: (schedule: TimeBlock[]) => void;
  updateBlockStatus: (id: string, status: 'pending' | 'completed') => void;
  resetForNextDay: () => void;
  whatWorked: string;
  setWhatWorked: (text: string) => void;
  whatDidnt: string;
  setWhatDidnt: (text: string) => void;
  dayRating: number;
  setDayRating: (rating: number) => void;
}

export const AppContext = createContext<AppContextType | null>(null!);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [view, setView] = useState<View>("setup");
  const [dayMode, setDayMode] = useState<DayMode>("Balanced");
  const [kickstartTime, setKickstartTime] = useState("09:00");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<FixedEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);

  // Review state
  const [whatWorked, setWhatWorked] = useState("");
  const [whatDidnt, setWhatDidnt] = useState("");
  const [dayRating, setDayRating] = useState(0);

  const addTask = (task: Omit<Task, 'id' | 'status'>) => {
    setTasks(prev => [...prev, { ...task, id: `task-${Date.now()}`, status: 'pending' }]);
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  
  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedTask } : t));
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

  const resetForNextDay = () => {
    setTasks([]);
    setEvents([]);
    setSchedule([]);
    setWhatWorked("");
    setWhatDidnt("");
    setDayRating(0);
    setSelectedDate(prev => addDays(prev, 1));
  };


  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        dayMode,
        setDayMode,
        kickstartTime,
        setKickstartTime,
        tasks,
        setTasks,
        addTask,
        removeTask,
        updateTask,
        events,
        addEvent,
        removeEvent,
        selectedDate,
        setSelectedDate,
        schedule,
        setSchedule,
        updateBlockStatus,
        resetForNextDay,
        whatWorked,
        setWhatWorked,
        whatDidnt,
        setWhatDidnt,
        dayRating,
        setDayRating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
