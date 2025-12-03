"use client";

import { useState } from "react";
import { AppProvider } from "@/contexts/app-provider";
import DaySetup from "@/components/day-setup";
import TimelineView from "@/components/timeline-view";
import type { TimeBlock } from "@/lib/types";

export default function Home() {
  const [view, setView] = useState<"setup" | "timeline">("setup");
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);

  const handleGenerateSchedule = (newSchedule: TimeBlock[]) => {
    setSchedule(newSchedule);
    setView("timeline");
  };

  const handleBackToSetup = () => {
    setView("setup");
  };

  return (
    <AppProvider>
      <main className="mx-auto max-w-[600px] bg-background min-h-svh shadow-lg">
        {view === "setup" ? (
          <DaySetup onGenerateSchedule={handleGenerateSchedule} />
        ) : (
          <TimelineView schedule={schedule} onBack={handleBackToSetup} />
        )}
      </main>
    </AppProvider>
  );
}