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
import { Landmark, Users, HandCoins, PiggyBank, LayoutDashboard, Menu } from 'lucide-react';
import { FinancialAdviceModal } from '@/components/ai/financial-advice-modal';
import { DashboardTab } from '@/components/tabs/dashboard-tab';
import { UserNav } from '@/components/user-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'simulator', label: 'Financiamento', icon: Landmark },
  { value: 'expenses', label: 'Meus Gastos', icon: HandCoins },
  { value: 'couple', label: 'Controle do Casal', icon: Users },
  { value: 'loans', label: 'Empréstimos', icon: Landmark },
];

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSheetOpen, setIsSheetOpen] = useState(false);


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
    if (isMobile) {
      return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col space-y-2 pt-8">
              {navItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeTab === item.value ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab(item.value);
                    setIsSheetOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
       <TabsList className="grid w-full max-w-4xl grid-cols-5">
        {navItems.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    );
  }

  return (
    <FinancialDataProvider>
      <div className="container mx-auto p-4 sm:p-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             {isMobile && renderNav()}
            <PiggyBank className="h-10 w-10 text-primary" />
            <h1 className="text-xl sm:text-3xl font-bold font-headline text-slate-800">
              Finanças Simplificadas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <FinancialAdviceModal />
            <UserNav />
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         {!isMobile && (
           <div className="flex justify-center">
             {renderNav()}
           </div>
          )}
          
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
