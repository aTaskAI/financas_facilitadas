'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FinancialDataProvider } from '@/contexts/financial-data-context';
import { FinancingSimulator } from '@/components/tabs/financing-simulator';
import { ExpenseTracker } from '@/components/tabs/expense-tracker';
import { CouplesFinance } from '@/components/tabs/couples-finance';
import { LoansTracker } from '@/components/tabs/loans-tracker';
import { Landmark, Users, HandCoins, PiggyBank, LayoutDashboard, Menu } from 'lucide-react';
import { FinancialAdviceModal } from '@/components/ai/financial-advice-modal';
import { DashboardTab } from '@/components/tabs/dashboard-tab';
import { UserNav } from '@/components/user-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && navItems.some(item => item.value === hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab('dashboard');
      }
    };
    
    window.addEventListener('hashchange', handleHashChange, false);
    handleHashChange(); 

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`#${value}`, { scroll: false });
  };
  
  const handleMobileLinkClick = (value: string) => {
    handleTabChange(value);
    setIsSheetOpen(false);
  }

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
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col space-y-2 p-4">
              {navItems.map((item) => (
                 <Button
                    key={item.value}
                    variant={activeTab === item.value ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => handleMobileLinkClick(item.value)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full justify-center flex">
        <TabsList>
            {navItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </TabsTrigger>
            ))}
        </TabsList>
      </Tabs>
    );
  }

  return (
    <FinancialDataProvider>
      <div className="container mx-auto p-4 sm:p-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {isMobile && renderNav()}
            <div className="flex items-center gap-3">
              <PiggyBank className="h-10 w-10 text-primary" />
              <h1 className="text-xl sm:text-3xl font-bold font-headline text-primary">
                Prospera
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <FinancialAdviceModal />
            </div>
            <UserNav />
          </div>
        </header>

        {!isMobile && (
          <nav className="mb-8">
            {renderNav()}
          </nav>
        )}
        
        <main>
          <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}><DashboardTab /></div>
          <div style={{ display: activeTab === 'simulator' ? 'block' : 'none' }}><FinancingSimulator /></div>
          <div style={{ display: activeTab === 'expenses' ? 'block' : 'none' }}><ExpenseTracker /></div>
          <div style={{ display: activeTab === 'couple' ? 'block' : 'none' }}><CouplesFinance /></div>
          <div style={{ display: activeTab === 'loans' ? 'block' : 'none' }}><LoansTracker /></div>
        </main>
      </div>

       {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <FinancialAdviceModal />
        </div>
      )}
    </FinancialDataProvider>
  );
}
