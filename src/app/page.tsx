'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FinancialDataProvider } from '@/contexts/financial-data-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancingSimulator } from '@/components/tabs/financing-simulator';
import { ExpenseTracker } from '@/components/tabs/expense-tracker';
import { CouplesFinance } from '@/components/tabs/couples-finance';
import { LoansTracker } from '@/components/tabs/loans-tracker';
import { Landmark, Users, HandCoins, PiggyBank, LayoutDashboard } from 'lucide-react';
import { FinancialAdviceModal } from '@/components/ai/financial-advice-modal';
import { DashboardTab } from '@/components/tabs/dashboard-tab';
import { UserNav } from '@/components/user-nav';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <FinancialDataProvider>
      <div className="container mx-auto p-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-slate-800">
              Finanças Simplificadas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <FinancialAdviceModal />
            <UserNav />
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="simulator">
              <Landmark className="h-4 w-4 mr-2" />
              Financiamento
            </TabsTrigger>
            <TabsTrigger value="expenses">
              <HandCoins className="h-4 w-4 mr-2" />
              Meus Gastos
            </TabsTrigger>
            <TabsTrigger value="couple">
              <Users className="h-4 w-4 mr-2" />
              Controle do Casal
            </TabsTrigger>
            <TabsTrigger value="loans">
              <Landmark className="h-4 w-4 mr-2" />
              Empréstimos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>
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
