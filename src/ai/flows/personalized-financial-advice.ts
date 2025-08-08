'use server';

/**
 * @fileOverview This file implements a Genkit flow for providing personalized financial advice based on user's financial data.
 *
 * @remarks
 * - `getPersonalizedFinancialAdvice`: A function that takes user's financial data and returns personalized advice.
 * - `PersonalizedFinancialAdviceInput`: The input type for the `getPersonalizedFinancialAdvice` function.
 * - `PersonalizedFinancialAdviceOutput`: The return type for the `getPersonalizedFinancialAdvice` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFinancialAdviceInputSchema = z.object({
  income: z.number().describe('Total monthly income.'),
  expenses: z.number().describe('Total monthly expenses.'),
  debts: z.number().describe('Total outstanding debt.'),
  savingRate: z.number().describe('Current monthly saving rate as a percentage.'),
  financialGoals: z.string().describe('User-defined financial goals.'),
  spendingPatterns: z.string().describe('Description of user spending patterns.'),
});

export type PersonalizedFinancialAdviceInput = z.infer<typeof PersonalizedFinancialAdviceInputSchema>;

const PersonalizedFinancialAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized financial advice based on the provided data, formatted in HTML with headings, lists, and bold text for better readability.'),
});

export type PersonalizedFinancialAdviceOutput = z.infer<typeof PersonalizedFinancialAdviceOutputSchema>;

export async function getPersonalizedFinancialAdvice(input: PersonalizedFinancialAdviceInput): Promise<PersonalizedFinancialAdviceOutput> {
  return personalizedFinancialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFinancialAdvicePrompt',
  input: {schema: PersonalizedFinancialAdviceInputSchema},
  output: {schema: PersonalizedFinancialAdviceOutputSchema},
  prompt: `You are a financial advisor providing personalized advice.

  Based on the user's financial situation, provide advice on how to better manage their finances to improve their financial health and achieve their financial goals. Consider the following:

  Income: {{income}}
  Expenses: {{expenses}}
  Debts: {{debts}}
  Saving Rate: {{savingRate}}%
  Financial Goals: {{financialGoals}}
  Spending Patterns: {{spendingPatterns}}

  Focus on actionable steps the user can take to reduce expenses, increase income, manage debts, and improve their saving rate.

  IMPORTANT: Format your response in HTML. Use headings (e.g., <h3>), lists (<ul>, <li>), and bold tags (<b>) to structure the advice for better readability.
`,
});

const personalizedFinancialAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedFinancialAdviceFlow',
    inputSchema: PersonalizedFinancialAdviceInputSchema,
    outputSchema: PersonalizedFinancialAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
