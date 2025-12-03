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

  // 1. Place fixed events. They are immovable.
  let schedule: TimeBlock[] = events.map(event => {
    const start = parseTime(event.start, today);
    const end = parseTime(event.end, today);
    return {
      id: event.id,
      title: event.title,
      start: start,
      end: end,
      type: 'event',
      status: 'pending',
    };
  }).sort((a, b) => a.start.getTime() - b.start.getTime());

  // Create blocks for prep and transition buffers around fixed events
  const eventBuffers: TimeBlock[] = [];
  events.forEach(event => {
    const start = parseTime(event.start, today);
    const end = parseTime(event.end, today);
    
    if (modeRules.buffers.prep > 0) {
      eventBuffers.push({
        id: `prep-${event.id}`,
        title: 'Buffer',
        start: add(start, { minutes: -modeRules.buffers.prep }),
        end: start,
        type: 'buffer',
      });
    }
    if (modeRules.buffers.transition > 0) {
      eventBuffers.push({
        id: `transition-${event.id}`,
        title: 'Buffer',
        start: end,
        end: add(end, { minutes: modeRules.buffers.transition }),
        type: 'buffer',
      });
    }
  });

  // Merge event buffers into the main schedule, avoiding overlaps.
  eventBuffers.forEach(buffer => {
      if (!schedule.some(existingBlock => overlaps(buffer, existingBlock))) {
          schedule.push(buffer);
      }
  });
  schedule.sort((a, b) => a.start.getTime() - b.start.getTime());


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
  const workBlocks = schedule.filter(b => b.type === 'task');
  const breakBlocks: TimeBlock[] = [];

  if (workBlocks.length > 0) {
      let workSessionStart = workBlocks[0].start;

      for (let i = 0; i < workBlocks.length; i++) {
          const currentWorkBlock = workBlocks[i];
          const nextWorkBlock = workBlocks[i + 1];

          const currentSessionDuration = differenceInMinutes(currentWorkBlock.end, workSessionStart);
          
          if (currentSessionDuration >= modeRules.breakInterval) {
              const breakStart = currentWorkBlock.end;
              const breakEnd = add(breakStart, { minutes: modeRules.breakDuration });

              const potentialBreak = { start: breakStart, end: breakEnd };
              
              const overlapsWithAnything = schedule.some(b => overlaps(potentialBreak, b));

              if (!overlapsWithAnything) {
                  breakBlocks.push({
                      id: `break-${breakStart.getTime()}`,
                      title: 'Break',
                      start: breakStart,
                      end: breakEnd,
                      type: 'break',
                  });
                  workSessionStart = breakEnd;

                   if (nextWorkBlock) {
                      const gapToNext = differenceInMinutes(nextWorkBlock.start, breakEnd);
                      if (gapToNext > 0) {
                        workSessionStart = nextWorkBlock.start;
                      }
                   }
              } else {
                  workSessionStart = nextWorkBlock ? nextWorkBlock.start : currentWorkBlock.end;
              }
          }

          if (nextWorkBlock) {
            const gap = differenceInMinutes(nextWorkBlock.start, currentWorkBlock.end);
            if(gap > 5) { // If there's a significant gap, reset the session
                workSessionStart = nextWorkBlock.start;
            }
          }
      }
  }

  schedule.push(...breakBlocks);
  schedule.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // 5. Fill gaps with buffers
  const finalSchedule: TimeBlock[] = [];
  let lastEnd = parseTime(kickstartTime, today);

  schedule.forEach(block => {
    if (isAfter(block.start, lastEnd)) {
        const gap = differenceInMinutes(block.start, lastEnd);
        if (gap > 0) {
            finalSchedule.push({
                id: `buffer-${lastEnd.getTime()}`,
                title: 'Buffer',
                start: lastEnd,
                end: block.start,
                type: 'buffer',
            });
        }
    }
    finalSchedule.push(block);
    lastEnd = block.end;
  });


  return finalSchedule;
}
