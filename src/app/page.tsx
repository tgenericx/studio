"use client";

import { useState, useContext, useEffect } from "react";
import { AppProvider, AppContext } from "@/contexts/app-provider";
import DaySetup from "@/components/day-setup";
import TimelineView from "@/components/timeline-view";
import type { TimeBlock } from "@/lib/types";
import { useUser } from "@/firebase";

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
  
  const HomeView = () => {
    const { user, loading } = useUser();
    const { selectedDate } = useContext(AppContext);
    
    useEffect(() => {
      // you can add logic here to handle user login state
    }, [user, loading, selectedDate]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-svh">
          <p>Loading...</p>
        </div>
      )
    }

    return (
      <main className="mx-auto max-w-[600px] bg-background min-h-svh shadow-lg">
        {view === "setup" ? (
          <DaySetup onGenerateSchedule={handleGenerateSchedule} />
        ) : (
          <TimelineView schedule={schedule} onBack={handleBackToSetup} />
        )}
      </main>
    )
  }

  return (
    <AppProvider>
      <HomeView />
    </AppProvider>
  );
}
