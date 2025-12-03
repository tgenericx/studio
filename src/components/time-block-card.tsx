"use client";

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { TimeBlock } from '@/lib/types';

interface TimeBlockCardProps {
  block: TimeBlock;
  onToggleStatus: (id: string) => void;
}

const TimeBlockCard: React.FC<TimeBlockCardProps> = ({ block, onToggleStatus }) => {
  const { start, end, type, title, id, status } = block;

  const positionStyles = useMemo(() => {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const durationHours = endHour - startHour;
    
    // 1 hour = 6rem (24 * 4)
    const top = startHour * 6; // 6rem per hour
    let height = durationHours * 6;
    
    // Minimum height of 72px which is 4.5rem
    if (height < 4.5) {
        height = 4.5;
    }

    return {
      top: `${top}rem`,
      height: `${height}rem`,
    };
  }, [start, end]);

  const accentColorClass = useMemo(() => {
    switch (type) {
        case 'task':
            return block.priority === 'must' ? 'bg-must-do' : 'bg-optional';
        case 'event':
            return 'bg-event';
        case 'break':
            return 'bg-gray-300';
        case 'buffer':
            return 'bg-gray-200';
        default:
            return 'bg-gray-400';
    }
  }, [type, block.priority]);

  const durationMinutes = useMemo(() => Math.round((end.getTime() - start.getTime()) / 60000), [start, end]);

  const isInteractive = type === 'task' || type === 'event';
  
  return (
    <div
      className="absolute w-full pr-4"
      style={positionStyles}
      onClick={() => isInteractive && onToggleStatus(id)}
    >
        <div className={cn(
            "h-full rounded-lg p-4 flex items-start space-x-3 relative overflow-hidden",
            isInteractive ? 'cursor-pointer bg-card shadow-sm' : 'bg-gray-100',
            status === 'completed' && 'opacity-60'
        )}>
            <div className={cn("w-1.5 h-full absolute left-0 top-0", accentColorClass)}></div>
            
            {isInteractive && (
                <Checkbox
                    id={`task-${id}`}
                    checked={status === 'completed'}
                    onCheckedChange={() => onToggleStatus(id)}
                    className="w-6 h-6 mt-0.5 flex-shrink-0"
                    aria-label={`Mark ${title} as complete`}
                />
            )}

            <div className="flex-grow min-w-0">
                <p className={cn("font-bold truncate", status === 'completed' && 'line-through text-muted-foreground')}>
                    {title}
                </p>
                <p className="text-sm text-muted-foreground">
                    {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                </p>
            </div>
            
            <Badge variant="secondary" className="flex-shrink-0">{durationMinutes}m</Badge>
        </div>
    </div>
  );
};

export default React.memo(TimeBlockCard);
