"use client";

import { useMemo, useContext } from "react";
import { AppContext } from "@/contexts/app-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Edit2, Rocket, Trash2 } from "lucide-react";
import { format, getHours, startOfDay, addHours, differenceInMinutes } from "date-fns";
import TimeBlockCard from "./time-block-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Duration, type Task } from "@/lib/types";
import { generateSchedule } from "@/lib/scheduler";

const DURATION_CHIPS: { label: string; minutes: Duration }[] = [
    { label: "15m", minutes: 15 },
    { label: "30m", minutes: 30 },
    { label: "45m", minutes: 45 },
    { label: "1h", minutes: 60 },
    { label: "90m", minutes: 90 },
    { label: "2h", minutes: 120 },
];


export default function PreviewView({ onStartDay, onBack }: { onStartDay: () => void, onBack: () => void }) {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found");
  
  const { 
    schedule,
    setSchedule,
    selectedDate,
    dayMode,
    kickstartTime,
    tasks,
    setTasks,
    events,
    updateTask,
    removeTask,
  } = context;

  const validation = useMemo(() => {
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    const availableTime = differenceInMinutes(endOfDay, new Date(selectedDate).setHours(parseInt(kickstartTime.split(':')[0]), parseInt(kickstartTime.split(':')[1])));
    
    const totalTime = schedule.reduce((sum, block) => {
        if (block.type !== 'task' && block.type !== 'event') return sum;
        return sum + differenceInMinutes(block.end, block.start);
    }, 0);

    const isOverbooked = totalTime > availableTime;

    const formatHours = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    if (isOverbooked) {
      return {
        valid: false,
        message: `You have ${formatHours(totalTime)} of tasks but only ${formatHours(availableTime)} available.`,
        suggestion: 'Consider removing optional tasks or shortening durations.',
      };
    }

    return { valid: true };
  }, [schedule, kickstartTime, selectedDate]);

  const handleTaskUpdate = (taskId: string, newDuration: Duration) => {
      const updatedTasks = tasks.map(t => t.id === taskId ? {...t, duration: newDuration} : t);
      setTasks(updatedTasks);
      const newSchedule = generateSchedule({ date: selectedDate, dayMode, kickstartTime, tasks: updatedTasks, events });
      setSchedule(newSchedule);
  }
  
  const handleRemoveTask = (taskId: string) => {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);
      const newSchedule = generateSchedule({ date: selectedDate, dayMode, kickstartTime, tasks: updatedTasks, events });
      setSchedule(newSchedule);
  }
  
  const hourMarkers = useMemo(() => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
        hours.push(format(addHours(startOfDay(new Date()), i), 'ha').toLowerCase());
    }
    return hours;
  }, []);

  const editableTasks = schedule.filter(b => b.type === 'task');

  return (
    <div className="flex flex-col h-svh">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 border-b">
        <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack} className="w-11 h-11">
                <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold font-headline text-center">Preview Your Day</h1>
            <div className="w-11" />
        </div>
      </header>

      <div className="flex-grow overflow-auto p-4 space-y-4">
        {!validation.valid && (
            <Alert variant="destructive">
                <AlertTitle>{validation.message}</AlertTitle>
                <AlertDescription>{validation.suggestion}</AlertDescription>
            </Alert>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Editable Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {editableTasks.map(block => {
                    const task = tasks.find(t => t.id === block.id);
                    if (!task) return null;
                    return (
                        <div key={block.id} className="flex items-center justify-between p-2 rounded-md bg-card border">
                             <p className="font-medium flex-grow">{task.title}</p>
                             <Select
                                defaultValue={String(task.duration)}
                                onValueChange={(value) => handleTaskUpdate(task.id, Number(value) as Duration)}
                             >
                                <SelectTrigger className="w-[100px] mx-2">
                                    <SelectValue placeholder="Duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DURATION_CHIPS.map(d => <SelectItem key={d.minutes} value={String(d.minutes)}>{d.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {task.priority === 'optional' && (
                               <Button variant="ghost" size="icon" onClick={() => handleRemoveTask(task.id)}>
                                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                               </Button>
                            )}
                        </div>
                    )
                })}
                 {editableTasks.length === 0 && <p className="text-muted-foreground text-center py-4">No tasks to preview.</p>}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Schedule Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative h-[calc(24*3rem)]"> {/* Reduced height for preview */}
                    <div className="grid grid-cols-[48px_1fr] h-full">
                         {/* Hour Markers */}
                        <div className="relative">
                            {hourMarkers.map((hour, i) => (
                                <div key={i} className="h-12 flex justify-center relative -top-2">
                                    <span className="text-xs text-muted-foreground">{hour}</span>
                                </div>
                            ))}
                        </div>

                        {/* Timeline Blocks */}
                        <div className="relative border-l">
                            {schedule.map(block => (
                            <div key={block.id} style={{
                                position: 'absolute',
                                top: `${(block.start.getHours() + block.start.getMinutes()/60) * 3}rem`,
                                height: `${differenceInMinutes(block.end, block.start)/60 * 3}rem`,
                                width: 'calc(100% - 0.5rem)',
                                right: '0'
                            }}>
                               <div className="bg-muted p-2 rounded-md h-full text-xs overflow-hidden">
                                   <p className="font-bold truncate">{block.title}</p>
                                   <p className="text-muted-foreground">{format(block.start, 'HH:mm')} - {format(block.end, 'HH:mm')}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
      
       <div style={{ paddingBottom: `env(safe-area-inset-bottom)` }} className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <Button onClick={onStartDay} className="w-full h-16 text-lg font-bold shadow-lg">
          <Rocket className="mr-2 h-5 w-5" /> Start My Day
        </Button>
      </div>
    </div>
  );
}
