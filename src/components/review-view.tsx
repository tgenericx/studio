"use client";
import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Repeat, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SuggestModeOutput } from '@/lib/types';
import { suggestMode } from '@/ai/flows/suggest-mode-flow';
import { useToast } from '@/hooks/use-toast';

export default function ReviewView({ onPlanNextDay }: { onPlanNextDay: () => void }) {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found");
  
  const { 
    schedule,
    whatWorked,
    setWhatWorked,
    whatDidnt,
    setWhatDidnt,
    dayRating,
    setDayRating,
    dayMode,
    setDayMode,
    resetForNextDay
  } = context;

  const { toast } = useToast();
  
  const [suggestion, setSuggestion] = useState<SuggestModeOutput | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  const stats = useMemo(() => {
    const tasks = schedule.filter(b => b.type === 'task' || b.type === 'event');
    const done = tasks.filter(b => b.status === 'completed');
    const totalTime = tasks.reduce((acc, task) => acc + ((task.end.getTime() - task.start.getTime()) / 60000), 0);
    const completionRate = tasks.length > 0 ? (done.length / tasks.length) * 100 : 0;
    
    return {
        doneCount: done.length,
        totalCount: tasks.length,
        completionRate: completionRate,
        focusTimeHours: totalTime / 60
    };
  }, [schedule]);

  const canComplete = whatWorked.length > 0 && whatDidnt.length > 0 && dayRating > 0;

  useEffect(() => {
    if (canComplete && !suggestion && !isGeneratingSuggestion) {
      setIsGeneratingSuggestion(true);
      suggestMode({
        completionRate: stats.completionRate,
        dayMode: dayMode,
        dayRating: dayRating,
        whatWorked: whatWorked,
        whatDidnt: whatDidnt,
      }).then(result => {
        setSuggestion(result);
      }).catch(err => {
        console.error(err);
        toast({ title: 'Could not generate suggestion.', variant: 'destructive' });
      }).finally(() => {
        setIsGeneratingSuggestion(false);
      });
    }
  }, [canComplete, stats.completionRate, dayMode, dayRating, whatWorked, whatDidnt, suggestion, isGeneratingSuggestion, toast]);


  const handleComplete = () => {
    resetForNextDay();
    onPlanNextDay();
  };

  const handleUseSuggestion = () => {
    if (suggestion) {
      setDayMode(suggestion.suggestedMode);
    }
    handleComplete();
  }

  return (
    <div className="p-4 space-y-5 pb-24">
        <header className="text-center">
            <h1 className="text-2xl font-bold font-headline">Day Complete! 🎉</h1>
            <p className="text-muted-foreground">Time to reflect and plan for an even better tomorrow.</p>
        </header>

        <Card>
            <CardHeader><CardTitle>Today's Stats</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                 <div className="p-2">
                    <p className="font-bold text-2xl">{stats.doneCount}/{stats.totalCount}</p>
                    <p className="text-xs text-muted-foreground">Tasks Done</p>
                </div>
                 <div className="p-2">
                    <p className="font-bold text-2xl">{stats.focusTimeHours.toFixed(1)}h</p>
                    <p className="text-xs text-muted-foreground">Focus Time</p>
                </div>
                 <div className="p-2">
                    <p className="font-bold text-2xl text-primary">{stats.completionRate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle className="text-lg">Before you go... (Required)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label htmlFor="what-worked" className="font-medium">What worked today?</label>
                    <Textarea 
                        id="what-worked"
                        value={whatWorked}
                        onChange={(e) => setWhatWorked(e.target.value)}
                        placeholder="The morning deep work block was super productive."
                        className="mt-2"
                    />
                </div>
                 <div>
                    <label htmlFor="what-didnt" className="font-medium">What got in the way?</label>
                    <Textarea 
                        id="what-didnt"
                        value={whatDidnt}
                        onChange={(e) => setWhatDidnt(e.target.value)}
                        placeholder="Got distracted by emails after lunch."
                        className="mt-2"
                    />
                </div>
                <div>
                    <label className="font-medium">Rate your day</label>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                                key={star}
                                className={cn(
                                    "w-8 h-8 cursor-pointer transition-colors",
                                    star <= dayRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
                                )}
                                onClick={() => setDayRating(star)}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>

        {(isGeneratingSuggestion || suggestion) && (
             <Card className="bg-primary/10 border-primary">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Wand2 className="mr-2" />
                      {isGeneratingSuggestion ? 'Analyzing your day...' : `Tomorrow's Suggestion: ${suggestion?.suggestedMode}`}
                      </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isGeneratingSuggestion ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <p className="text-muted-foreground">{suggestion?.reason}</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={handleUseSuggestion}>Use {suggestion?.suggestedMode} Mode</Button>
                            <Button variant="outline" onClick={handleComplete}>Pick Manually</Button>
                        </div>
                      </>
                    )}
                </CardContent>
            </Card>
        )}

        <div style={{ paddingBottom: `env(safe-area-inset-bottom)` }} className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border mx-auto max-w-[600px]">
            <Button onClick={handleComplete} disabled={!canComplete || isGeneratingSuggestion} className="w-full h-16 text-lg font-bold shadow-lg">
                <Repeat className="mr-2" /> Complete & Plan Tomorrow
            </Button>
        </div>
    </div>
  );
}
