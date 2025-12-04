"use client";

import { useContext, useState } from "react";
import { AppContext } from "@/contexts/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAY_MODES } from "@/lib/data";
import { BrainCircuit, Zap, Scale, Coffee, Plus, Trash2, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayMode, Task, FixedEvent, Duration, TimeBlock } from "@/lib/types";
import { generateSchedule } from "@/lib/scheduler";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const icons: Record<DayMode, React.ElementType> = {
  "Deep Work": BrainCircuit,
  Execution: Zap,
  Balanced: Scale,
  Chill: Coffee,
};

const DURATION_CHIPS: { label: string; minutes: Duration }[] = [
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
  { label: "90m", minutes: 90 },
  { label: "2h", minutes: 120 },
];

const TaskInput = ({
  type,
}: {
  type: "must-do" | "optional" | "event";
}) => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found");
  const { addTask, addEvent } = context;
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<Duration>(30);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const { toast } = useToast();

  const handleAddTask = () => {
    if (!title) {
        toast({ title: "Task title is required.", variant: 'destructive' });
        return;
    }
    addTask({ title, duration, priority: type === 'must-do' ? 'must' : 'optional' });
    setTitle("");
  };

  const handleAddEvent = () => {
    if (!title) {
        toast({ title: "Event title is required.", variant: 'destructive' });
        return;
    }
    addEvent({ title, start: startTime, end: endTime });
    setTitle("");
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder={type === 'event' ? "Event Title (e.g., Team Meeting)" : "Task Title (e.g., Draft proposal)"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-14 text-base"
        style={{ fontSize: '16px' }}
      />
      {type !== "event" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Duration:</p>
          <div className="flex flex-wrap gap-2">
            {DURATION_CHIPS.map((chip) => (
              <Button
                key={chip.minutes}
                variant={duration === chip.minutes ? "default" : "outline"}
                onClick={() => setDuration(chip.minutes)}
                className="h-9"
              >
                {chip.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      {type === "event" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted-foreground" htmlFor="start-time">Start</label>
            <Input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-14 text-base"
              style={{ fontSize: '16px' }}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground" htmlFor="end-time">End</label>
            <Input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="h-14 text-base"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>
      )}
      <Button onClick={type === 'event' ? handleAddEvent : handleAddTask} className="w-full h-12 text-base">
        <Plus className="mr-2 h-4 w-4" /> Add {type.replace('-', ' ')}
      </Button>
    </div>
  );
};

export default function DaySetup({ onGeneratePreview }: { onGeneratePreview: (schedule: TimeBlock[]) => void; }) {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found");

  const {
    dayMode,
    setDayMode,
    kickstartTime,
    setKickstartTime,
    tasks,
    removeTask,
    events,
    removeEvent,
    selectedDate,
    setSelectedDate,
  } = context;
  const { toast } = useToast();

  const mustDoTasks = tasks.filter((t) => t.priority === "must");
  const optionalTasks = tasks.filter((t) => t.priority === "optional");

  const handleGenerate = () => {
    try {
        const newSchedule = generateSchedule({ date: selectedDate, dayMode, kickstartTime, tasks, events });
        onGeneratePreview(newSchedule);
    } catch (error) {
        if (error instanceof Error) {
            toast({
                title: 'Scheduling Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    }
  };

  return (
    <div className="p-4 space-y-5 pb-24">
      <header className="text-center">
        <h1 className="text-2xl font-bold font-headline">Day Setup</h1>
        <p className="text-muted-foreground text-sm">Structure your day in 60 seconds.</p>
      </header>

      {/* Date Selector */}
      <section>
        <label htmlFor="date" className="text-lg font-bold">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal h-14 text-lg mt-2",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </section>
      
      {/* Mode Selector */}
      <section className="space-y-3">
        {Object.entries(DAY_MODES).map(([modeName, modeDetails]) => {
          const Icon = icons[modeName as DayMode];
          const isSelected = dayMode === modeName;
          return (
            <Card
              key={modeName}
              onClick={() => setDayMode(modeName as DayMode)}
              className={cn(
                "cursor-pointer transition-all duration-200",
                isSelected
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-card hover:border-muted-foreground/50",
                `border-l-6`
              )}
              style={{ borderLeftColor: isSelected ? `hsl(var(--${modeName.toLowerCase().replace(' ','-')}))` : 'transparent', borderLeftWidth: '6px' }}

            >
              <CardContent className="p-4 flex items-center space-x-4">
                <Icon className="w-8 h-8 flex-shrink-0" style={{color: `hsl(var(--${modeName.toLowerCase().replace(' ','-')}))`}} />
                <div className="flex-grow">
                  <h3 className="text-lg font-bold">{modeName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {modeDetails.taskLimits.total} tasks max • {modeDetails.blockDurationRange[0]}-{modeDetails.blockDurationRange[1]} min blocks
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Kickstart Time */}
      <section>
        <label htmlFor="kickstart-time" className="text-lg font-bold">Kickstart Time</label>
        <Input
          id="kickstart-time"
          type="time"
          value={kickstartTime}
          onChange={(e) => setKickstartTime(e.target.value)}
          className="w-full h-14 text-lg mt-2"
          style={{ fontSize: '18px' }}
        />
      </section>

      {/* Must-Dos */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center">
          Must-Dos
          <Badge variant="destructive" className="ml-2">{mustDoTasks.length}/{DAY_MODES[dayMode].taskLimits.must}</Badge>
        </h2>
        {mustDoTasks.map(task => (
            <Card key={task.id} className="border-l-4 border-red-500">
                <CardContent className="p-3 flex justify-between items-center">
                    <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.duration} mins</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </CardContent>
            </Card>
        ))}
        {mustDoTasks.length < DAY_MODES[dayMode].taskLimits.must && <TaskInput type="must-do" />}
      </section>

      {/* Optional Tasks */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center">
          Optional Tasks
          <Badge variant="secondary" className="ml-2">{optionalTasks.length}</Badge>
        </h2>
        {optionalTasks.map(task => (
            <Card key={task.id} className="border-l-4 border-blue-500">
                <CardContent className="p-3 flex justify-between items-center">
                     <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.duration} mins</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </CardContent>
            </Card>
        ))}
        {tasks.length < DAY_MODES[dayMode].taskLimits.total && <TaskInput type="optional" />}
      </section>

      {/* Fixed Events */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">Fixed Events</h2>
         {events.map(event => (
            <Card key={event.id} className="border-l-4 border-purple-500">
                <CardContent className="p-3 flex justify-between items-center">
                     <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.start} - {event.end}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeEvent(event.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </CardContent>
            </Card>
        ))}
        <TaskInput type="event" />
      </section>
      
      <div style={{ paddingBottom: `env(safe-area-inset-bottom)` }} className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border mx-auto max-w-[600px]">
        <Button onClick={handleGenerate} className="w-full h-16 text-lg font-bold shadow-lg">
          <Sparkles className="mr-2" /> Generate Preview
        </Button>
      </div>
    </div>
  );
}
