import type { DayModes } from './types';

export const DAY_MODES: DayModes = {
  'Deep Work': {
    taskLimits: { total: 4, must: 2 },
    blockDurationRange: [90, 120],
    breakInterval: 120, // minutes
    breakDuration: 20, // minutes
    buffers: { prep: 30, transition: 30 },
  },
  'Execution': {
    taskLimits: { total: 12, must: 6 },
    blockDurationRange: [25, 45],
    breakInterval: 60, // minutes
    breakDuration: 10, // minutes
    buffers: { prep: 15, transition: 15 },
  },
  'Balanced': {
    taskLimits: { total: 7, must: 3 },
    blockDurationRange: [60, 90],
    breakInterval: 90, // minutes
    breakDuration: 15, // minutes
    buffers: { prep: 20, transition: 20 },
  },
  'Chill': {
    taskLimits: { total: 3, must: 1 },
    blockDurationRange: [45, 60],
    breakInterval: 120, // minutes
    breakDuration: 30, // minutes
    buffers: { prep: 30, transition: 30 },
  },
};
