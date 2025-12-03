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
  date?: Date;
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
