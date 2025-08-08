'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


const navItems = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'simulator', label: 'Financiamento', icon: Landmark },
  { value: 'expenses', label: 'Meus Gastos', icon: HandCoins },
  { value: 'couple', label: 'Controle do Casal', icon: Users },
  { value: 'loans', label: 'Empréstimos', icon: Landmark },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');


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

  const renderNav = () => {
    const navContent = (
      <TabsList className={cn(!isMobile && "grid w-full max-w-4xl grid-cols-5", isMobile && "w-max")}>
        {navItems.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    );
    
    if (isMobile) {
      return (
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex justify-center">
           {navContent}
          </div>
        </ScrollArea>
      )
    }

    return (
       <div className="flex justify-center">
        {navContent}
       </div>
    );
  }

  return (
    <FinancialDataProvider>
      <div className="container mx-auto p-4 sm:p-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-10 w-10 text-primary" />
            <h1 className="text-xl sm:text-3xl font-bold font-headline text-primary">
              Prospera
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && <FinancialAdviceModal />}
            <UserNav />
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           {renderNav()}
           <Separator className="my-6"/>
          
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

       {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <FinancialAdviceModal />
        </div>
      )}
    </FinancialDataProvider>
  );
}
