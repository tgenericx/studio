import { Timestamp } from "firebase/firestore";
import { z } from 'zod';

export type DayMode = 'Deep Work' | 'Execution' | 'Balanced' | 'Chill';

export type Duration = 15 | 30 | 45 | 60 | 90 | 120;

export interface Task {
  id: string;
  title: string;
  duration: Duration;
  priority: 'must' | 'optional';
  status: 'pending' | 'completed';
}

export interface FixedEvent {
  id: string;
  title: string;
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

export interface DaySetup {
  date: Date;
  dayMode: DayMode;
  kickstartTime: string; // "HH:mm"
  tasks: Task[];
  events: FixedEvent[];
}

export interface TimeBlock {
  id: string;
  type: 'task' | 'event' | 'break' | 'buffer';
  title: string;
  start: Date;
  end: Date;
  status?: 'pending' | 'completed';
  priority?: 'must' | 'optional';
}

export interface FirestoreTimeBlock {
    id: string;
    type: 'task' | 'event' | 'break' | 'buffer';
    title: string;
    start: Timestamp;
    end: Timestamp;
    status?: 'pending' | 'completed';
    priority?: 'must' | 'optional';
}

export interface ModeRules {
  taskLimits: {
    total: number;
    must: number;
  };
  blockDurationRange: [number, number];
  breakInterval: number; // in minutes
  breakDuration: number; // in minutes
  buffers: {
    prep: number;
    transition: number;
  };
}

export type DayModes = Record<DayMode, ModeRules>;

// AI Task Breakdown Types
export const BreakdownTaskInputSchema = z.object({
  goal: z.string().describe('The high-level goal to be broken down.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;

export const SubTaskSchema = z.object({
    title: z.string().describe('The title of the sub-task.'),
    duration: z.enum(['15', '30', '45', '60', '90', '120']).describe('The estimated duration of the task in minutes. Must be one of the following values: 15, 30, 45, 60, 90, 120.'),
});
export type SubTask = z.infer<typeof SubTaskSchema>;

export const BreakdownTaskOutputSchema = z.object({
  tasks: z.array(SubTaskSchema).describe('An array of sub-tasks generated from the main goal.'),
});
export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;
