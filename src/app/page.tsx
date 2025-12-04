"use client";

import { useState, useContext } from "react";
import { AppContext } from "@/contexts/app-provider";
import DaySetup from "@/components/day-setup";
import TimelineView from "@/components/timeline-view";
import type { TimeBlock } from "@/lib/types";

export default function Home() {
  const [view, setView] = useState<"setup" | "timeline">("setup");
  const { schedule, setSchedule, selectedDate } = useContext(AppContext);

  const handleGenerateSchedule = (newSchedule: TimeBlock[]) => {
    setSchedule(newSchedule);
    setView("timeline");
  };

  const handleBackToSetup = () => {
    setView("setup");
  };

  return (
    <main className="mx-auto max-w-[600px] bg-background min-h-svh shadow-lg">
      {view === "setup" ? (
        <DaySetup onGenerateSchedule={handleGenerateSchedule} />
      ) : (
        <TimelineView schedule={schedule} onBack={handleBackToSetup} />
      )}
    </main>
  );
}
