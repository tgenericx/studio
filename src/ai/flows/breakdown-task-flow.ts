'use server';
/**
 * @fileOverview An AI flow for breaking down a large task into smaller, actionable sub-tasks.
 *
 * - breakdownTask - A function that takes a high-level goal and returns a list of sub-tasks.
 */

import { ai } from '@/ai/genkit';
import { BreakdownTaskInputSchema, BreakdownTaskOutputSchema } from '@/lib/types';
import type { BreakdownTaskInput, BreakdownTaskOutput } from '@/lib/types';

export async function breakdownTask(input: BreakdownTaskInput): Promise<BreakdownTaskOutput> {
  return breakdownTaskFlow(input);
}

const breakdownPrompt = ai.definePrompt({
    name: 'breakdownTaskPrompt',
    input: { schema: BreakdownTaskInputSchema },
    output: { schema: BreakdownTaskOutputSchema },
    prompt: `You are a world-class project manager. A user wants to break down a large goal into smaller, manageable tasks.

Goal: {{{goal}}}

Break this goal down into 2-5 smaller, actionable sub-tasks. For each task, provide a clear title and estimate its duration in minutes. The duration must be one of the following values: 15, 30, 45, 60, 90, or 120.

Return the tasks in the specified JSON format.`,
});


const breakdownTaskFlow = ai.defineFlow(
  {
    name: 'breakdownTaskFlow',
    inputSchema: BreakdownTaskInputSchema,
    outputSchema: BreakdownTaskOutputSchema,
  },
  async (input) => {
    const { output } = await breakdownPrompt(input);
    if (!output) {
      return { tasks: [] };
    }
    return output;
  }
);
