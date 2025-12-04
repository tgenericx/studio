'use server';
/**
 * @fileOverview An AI flow for breaking down a large task into smaller, actionable sub-tasks.
 *
 * - breakdownTask - A function that takes a high-level goal and returns a list of sub-tasks.
 * - BreakdownTaskInput - The input type for the breakdownTask function.
 * - BreakdownTaskOutput - The return type for the breakdownTask function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const BreakdownTaskInputSchema = z.object({
  goal: z.string().describe('The high-level goal to be broken down.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;

const SubTaskSchema = z.object({
    title: z.string().describe('The title of the sub-task.'),
    duration: z.enum(['15', '30', '45', '60', '90', '120']).describe('The estimated duration of the task in minutes. Must be one of the following values: 15, 30, 45, 60, 90, 120.'),
});

export const BreakdownTaskOutputSchema = z.object({
  tasks: z.array(SubTaskSchema).describe('An array of sub-tasks generated from the main goal.'),
});
export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;


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
