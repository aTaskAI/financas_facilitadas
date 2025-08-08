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
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

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
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTab = navItems.some(item => item.value === hash);
      setActiveTab(validTab ? hash : 'dashboard');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial tab

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <FinancialDataProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2">
                 <PiggyBank className="h-8 w-8 text-primary" />
                  <h1 className="text-xl font-bold font-headline text-primary">
                    Prospera
                  </h1>
              </div>
            </SidebarHeader>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                   <SidebarMenuButton
                      href={`#${item.value}`}
                      isActive={activeTab === item.value}
                      onClick={() => isMobile && (document.querySelector('[data-radix-collection-item] button[data-state="open"]')?.click())}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                   </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
           <div className="container mx-auto p-4 sm:p-8">
            <header className="flex justify-between items-center mb-6">
               <SidebarTrigger asChild>
                  <Button variant="ghost" size="icon">
                      <Menu />
                  </Button>
               </SidebarTrigger>
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
            
            <main>
              <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}><DashboardTab /></div>
              <div style={{ display: activeTab === 'simulator' ? 'block' : 'none' }}><FinancingSimulator /></div>
              <div style={{ display: activeTab === 'expenses' ? 'block' : 'none' }}><ExpenseTracker /></div>
              <div style={{ display: activeTab === 'couple' ? 'block' : 'none' }}><CouplesFinance /></div>
              <div style={{ display: activeTab === 'loans' ? 'block' : 'none' }}><LoansTracker /></div>
            </main>
          </div>
        </SidebarInset>
       {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <FinancialAdviceModal />
        </div>
      )}
      </SidebarProvider>
    </FinancialDataProvider>
  );
}
