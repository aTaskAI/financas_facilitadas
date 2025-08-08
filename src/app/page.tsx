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
import { Landmark, Users, HandCoins, PiggyBank, LogOut, LayoutDashboard } from 'lucide-react';
import { FinancialAdviceModal } from '@/components/ai/financial-advice-modal';
import { Button } from '@/components/ui/button';
import { DashboardTab } from '@/components/tabs/dashboard-tab';

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
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-slate-800">
              Finanças Simplificadas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <FinancialAdviceModal />
            <Button variant="outline" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto sm:h-12">
            <TabsTrigger value="dashboard" className="py-2.5">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
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
