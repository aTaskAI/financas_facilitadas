'use client';

import { FinancialDataProvider } from '@/contexts/financial-data-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancingSimulator } from '@/components/tabs/financing-simulator';
import { ExpenseTracker } from '@/components/tabs/expense-tracker';
import { CouplesFinance } from '@/components/tabs/couples-finance';
import { LoansTracker } from '@/components/tabs/loans-tracker';
import { Landmark, Users, HandCoins, PiggyBank, BrainCircuit } from 'lucide-react';
import { FinancialAdviceModal } from '@/components/ai/financial-advice-modal';

export default function Home() {
  return (
    <FinancialDataProvider>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <PiggyBank className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-slate-800">
              Finanças Simplificadas
            </h1>
          </div>
          <FinancialAdviceModal />
        </header>

        <Tabs defaultValue="simulator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-12">
            <TabsTrigger value="simulator" className="py-2.5">
              <Landmark className="h-4 w-4 mr-2" />
              Financiamento
            </TabsTrigger>
            <TabsTrigger value="expenses" className="py-2.5">
              <HandCoins className="h-4 w-4 mr-2" />
              Meus Gastos
            </TabsTrigger>
            <TabsTrigger value="couple" className="py-2.5">
              <Users className="h-4 w-4 mr-2" />
              Controle do Casal
            </TabsTrigger>
            <TabsTrigger value="loans" className="py-2.5">
              <Landmark className="h-4 w-4 mr-2" />
              Empréstimos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="simulator" className="mt-6">
            <FinancingSimulator />
          </TabsContent>
          <TabsContent value="expenses" className="mt-6">
            <ExpenseTracker />
          </TabsContent>
          <TabsContent value="couple" className="mt-6">
            <CouplesFinance />
          </TabsContent>
          <TabsContent value="loans" className="mt-6">
            <LoansTracker />
          </TabsContent>
        </Tabs>
      </div>
    </FinancialDataProvider>
  );
}
