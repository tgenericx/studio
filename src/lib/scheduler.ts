import { add, parse, differenceInMinutes, isBefore, max, min, isAfter } from 'date-fns';
import type { DaySetup, TimeBlock, FixedEvent, Task } from './types';
import { DAY_MODES } from './data';

function parseTime(timeStr: string, date: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

function overlaps(blockA: { start: Date; end: Date }, blockB: { start: Date; end: Date }): boolean {
  return isBefore(blockA.start, blockB.end) && isAfter(blockA.end, blockB.start);
}

export function generateSchedule(setup: DaySetup): TimeBlock[] {
  const { dayMode, kickstartTime, tasks, events } = setup;
  const modeRules = DAY_MODES[dayMode];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate task limits
  const mustDoCount = tasks.filter(t => t.priority === 'must').length;
  if (mustDoCount > modeRules.taskLimits.must) {
    throw new Error(`Too many Must-Do tasks. Max is ${modeRules.taskLimits.must} for ${dayMode} mode.`);
  }
  if (tasks.length > modeRules.taskLimits.total) {
    throw new Error(`Too many total tasks. Max is ${modeRules.taskLimits.total} for ${dayMode} mode.`);
  }

  // 1. Place fixed events with buffers
  let schedule: TimeBlock[] = events.map(event => {
    const start = parseTime(event.start, today);
    const end = parseTime(event.end, today);
    return {
      id: event.id,
      title: event.title,
      start: add(start, { minutes: -modeRules.buffers.prep }),
      end: add(end, { minutes: modeRules.buffers.transition }),
      type: 'event',
      status: 'pending',
    };
  }).sort((a, b) => a.start.getTime() - b.start.getTime());

  // 2. Sort tasks: must-dos first
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.priority === 'must' && b.priority !== 'must') return -1;
    if (a.priority !== 'must' && b.priority === 'must') return 1;
    return 0;
  });

  // 3. Fill available time with tasks
  let cursor = parseTime(kickstartTime, today);
  for (const task of sortedTasks) {
    let slotFound = false;
    while (!slotFound) {
      const potentialStart = cursor;
      const potentialEnd = add(potentialStart, { minutes: task.duration });
      const potentialBlock = { start: potentialStart, end: potentialEnd };

      const overlappingBlock = schedule.find(b => overlaps(potentialBlock, b));

      if (!overlappingBlock) {
        schedule.push({
          id: task.id,
          title: task.title,
          start: potentialStart,
          end: potentialEnd,
          type: 'task',
          priority: task.priority,
          status: 'pending',
        });
        slotFound = true;
      } else {
        cursor = max([cursor, overlappingBlock.end]);
      }
    }
    schedule.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  // 4. Insert breaks
  const finalSchedule: TimeBlock[] = [];
  let timeOffset = 0; // minutes
  let workSessionDuration = 0;

  for (const block of schedule) {
    const isWorkBlock = block.type === 'task' || block.type === 'event';
    const blockDuration = differenceInMinutes(block.end, block.start);

    if (isWorkBlock) {
      if (workSessionDuration > 0 && (workSessionDuration + blockDuration) > modeRules.breakInterval) {
        const lastBlockEnd = finalSchedule.length > 0 ? finalSchedule[finalSchedule.length-1].end : parseTime(kickstartTime, today);
        const breakStart = add(lastBlockEnd, {minutes: timeOffset});

        finalSchedule.push({
          id: `break-${breakStart.getTime()}`,
          title: 'Break',
          start: breakStart,
          end: add(breakStart, { minutes: modeRules.breakDuration }),
          type: 'break',
        });
        timeOffset += modeRules.breakDuration;
        workSessionDuration = 0;
      }
    } else {
      workSessionDuration = 0;
    }
    
    const shiftedStart = add(block.start, { minutes: timeOffset });
    const shiftedEnd = add(block.end, { minutes: timeOffset });
    finalSchedule.push({ ...block, start: shiftedStart, end: shiftedEnd });
    
    if (isWorkBlock) {
      workSessionDuration += blockDuration;
    }
  }
  
  // 5. Fill gaps with buffers
  const scheduleWithBuffers: TimeBlock[] = [];
  let lastEnd = parseTime(kickstartTime, today);

  finalSchedule.forEach(block => {
    if (isAfter(block.start, lastEnd)) {
        const gap = differenceInMinutes(block.start, lastEnd);
        if (gap > 0) {
            scheduleWithBuffers.push({
                id: `buffer-${lastEnd.getTime()}`,
                title: 'Buffer',
                start: lastEnd,
                end: block.start,
                type: 'buffer',
            });
        }
    }
    scheduleWithBuffers.push(block);
    lastEnd = block.end;
  });


  return scheduleWithBuffers;
}
