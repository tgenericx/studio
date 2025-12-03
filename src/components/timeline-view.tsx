"use client";

import { useState, useMemo, useContext, useEffect } from "react";
import { AppContext } from "@/contexts/app-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import type { TimeBlock } from "@/lib/types";
import { format, getHours, startOfDay, addHours } from "date-fns";
import TimeBlockCard from "./time-block-card";

export default function TimelineView({ schedule: initialSchedule, onBack }: { schedule: TimeBlock[], onBack: () => void }) {
  const { schedule, updateBlockStatus, selectedDate } = useContext(AppContext);

  const toggleTaskStatus = (id: string) => {
    const block = schedule.find(b => b.id === id);
    if(block && (block.type === 'task' || block.type === 'event')) {
      const newStatus = block.status === 'completed' ? 'pending' : 'completed';
      updateBlockStatus(id, newStatus);
    }
  };
  
  const stats = useMemo(() => {
    const tasks = schedule.filter(b => b.type === 'task' || b.type === 'event');
    const done = tasks.filter(b => b.status === 'completed');
    const totalTime = tasks.reduce((acc, task) => acc + ((task.end.getTime() - task.start.getTime()) / 60000), 0);
    const timeCompleted = done.reduce((acc, task) => acc + ((task.end.getTime() - task.start.getTime()) / 60000), 0);
    return {
        doneCount: done.length,
        totalCount: tasks.length,
        progress: tasks.length > 0 ? (done.length / tasks.length) * 100 : 0,
        totalTime: Math.round(totalTime)
    };
  }, [schedule]);


  const hourMarkers = useMemo(() => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
        hours.push(format(addHours(startOfDay(new Date()), i), 'ha').toLowerCase());
    }
    return hours;
  }, []);

  return (
    <div className="flex flex-col h-svh">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack} className="w-11 h-11">
                <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-xl font-bold font-headline text-center">Your Day</h1>
              <p className="text-sm text-muted-foreground text-center">{format(selectedDate, "PPP")}</p>
            </div>
            <div className="w-11"/>
        </div>
        <Progress value={stats.progress} className="w-full h-1.5" />
        <div className="grid grid-cols-3 gap-2 text-center">
            <Card className="p-2">
                <p className="font-bold text-lg">{stats.doneCount}/{stats.totalCount}</p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
            </Card>
            <Card className="p-2">
                <p className="font-bold text-lg">{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m</p>
                <p className="text-xs text-muted-foreground">Total Time</p>
            </Card>
             <Card className="p-2">
                <p className="font-bold text-lg text-primary">{stats.progress.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
            </Card>
        </div>
      </header>

      <div className="flex-grow overflow-auto relative">
        <div className="grid grid-cols-[48px_1fr] h-full">
            {/* Hour Markers */}
            <div className="relative">
                {hourMarkers.map((hour, i) => (
                    <div key={i} className="h-24 flex justify-center relative -top-3">
                        <span className="text-xs text-muted-foreground">{hour}</span>
                    </div>
                ))}
            </div>

            {/* Timeline Blocks */}
            <div className="relative border-l">
                {schedule.map(block => (
                   <TimeBlockCard key={block.id} block={block} onToggleStatus={toggleTaskStatus} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
