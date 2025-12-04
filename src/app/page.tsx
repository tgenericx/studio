"use client";

import { useState, useContext, useEffect } from "react";
import { AppContext } from "@/contexts/app-provider";
import DaySetup from "@/components/day-setup";
import PreviewView from "@/components/preview-view";
import TimelineView from "@/components/timeline-view";
import ReviewView from "@/components/review-view";
import type { TimeBlock } from "@/lib/types";

export type View = "setup" | "preview" | "timeline" | "review";

export default function Home() {
  const { view, setView, schedule, setSchedule } = useContext(AppContext);

  const handleGeneratePreview = (newSchedule: TimeBlock[]) => {
    setSchedule(newSchedule);
    setView("preview");
  };
  
  const handleStartDay = () => {
    setView("timeline");
  };

  const handleBackToSetup = () => {
    setView("setup");
  };
  
  const handleEndDay = () => {
    setView("review");
  };

  const handlePlanNextDay = () => {
    setView("setup");
  };

  return (
    <main className="mx-auto max-w-[600px] bg-background min-h-svh shadow-lg">
      {view === "setup" && <DaySetup onGeneratePreview={handleGeneratePreview} />}
      {view === "preview" && <PreviewView onStartDay={handleStartDay} onBack={handleBackToSetup} />}
      {view === "timeline" && <TimelineView onEndDay={handleEndDay} />}
      {view === "review" && <ReviewView onPlanNextDay={handlePlanNextDay} />}
    </main>
  );
}
