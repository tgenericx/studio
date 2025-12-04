'use server';
/**
 * @fileOverview An AI flow for suggesting the next day's mode based on a review of the current day.
 *
 * - suggestMode - A function that takes a user's daily review and suggests a mode for the next day.
 */

import { ai } from '@/ai/genkit';
import { SuggestModeInputSchema, SuggestModeOutputSchema } from '@/lib/types';
import type { SuggestModeInput, SuggestModeOutput } from '@/lib/types';

export async function suggestMode(input: SuggestModeInput): Promise<SuggestModeOutput> {
  return suggestModeFlow(input);
}

const suggestModePrompt = ai.definePrompt({
  name: 'suggestModePrompt',
  input: { schema: SuggestModeInputSchema },
  output: { schema: SuggestModeOutputSchema },
  prompt: `You are an encouraging and insightful productivity coach. A user has just finished their day and is providing a review.
Your goal is to suggest a "Day Mode" for them for tomorrow. The modes are:
- Deep Work: For days with a few, high-focus tasks.
- Execution: For days with many small, concrete tasks.
- Balanced: A mix of focus and smaller tasks.
- Chill: For light work days, recovery, or creative exploration.

Analyze the user's daily review:
- Today's Mode: {{{dayMode}}}
- Completion Rate: {{{completionRate}}}%
- Day Rating (1-5 stars): {{{dayRating}}}
- What Worked: {{{whatWorked}}}
- What Didn't Work: {{{whatDidnt}}}

Based on this, suggest a mode for tomorrow and provide a concise, one-sentence reason for your suggestion.

- If completion rate and rating are high, consider suggesting a more intense mode (e.g., Balanced -> Deep Work).
- If completion rate or rating are low, suggest a less intense mode (e.g., Deep Work -> Balanced, or Balanced -> Chill).
- If the user mentions feeling distracted or overwhelmed in "what didn't work", lean towards a less intense mode.
- If they mention success in a specific type of work (e.g., "my deep work block was great"), consider suggesting the same mode again.

Your reason should be positive and forward-looking.

Example:
Input: { completionRate: 90, dayRating: 5, dayMode: 'Balanced', whatWorked: 'Felt focused', whatDidnt: 'Too many meetings' }
Output: { suggestedMode: 'Deep Work', reason: 'You had a great, focused day! Let\'s build on that momentum with some deep work.' }
`,
});

const suggestModeFlow = ai.defineFlow(
  {
    name: 'suggestModeFlow',
    inputSchema: SuggestModeInputSchema,
    outputSchema: SuggestModeOutputSchema,
  },
  async (input) => {
    const { output } = await suggestModePrompt(input);
    if (!output) {
      // Fallback in case the AI fails
      return {
        suggestedMode: 'Balanced',
        reason: 'A balanced approach is always a good place to start.',
      };
    }
    return output;
  }
);
