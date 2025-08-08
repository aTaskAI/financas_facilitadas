'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FinancialDataProvider } from '@/contexts/financial-data-context';
import { FinancingSimulator } from '@/components/tabs/financing-simulator';
import { ExpenseTracker } from '@/components/tabs/expense-tracker';
import { CouplesFinance } from '@/components/tabs/couples-finance';
import { LoansTracker } from '@/components/tabs/loans-tracker';
import { Landmark, Users, HandCoins, PiggyBank, LayoutDashboard } from 'lucide-react';
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
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                   <SidebarMenuButton
                      href={`#${item.value}`}
                      isActive={
                        typeof window !== 'undefined'
                          ? window.location.hash === `#${item.value}` || (window.location.hash === '' && item.value === 'dashboard')
                          : item.value === 'dashboard'
                      }
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
              <div className="flex items-center gap-3">
                 <div className="md:hidden">
                    <SidebarTrigger />
                 </div>
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
              {/* This is a simple router based on URL hash */}
              <div id="dashboard"><DashboardTab /></div>
              <div id="simulator"><FinancingSimulator /></div>
              <div id="expenses"><ExpenseTracker /></div>
              <div id="couple"><CouplesFinance /></div>
              <div id="loans"><LoansTracker /></div>
            </main>

            <style jsx>{`
              main > div {
                display: none;
              }
              main > div:target {
                display: block;
              }
              /* Show dashboard by default if no hash is present */
              main > div:not(:target) ~ div[id="dashboard"] {
                 display: block;
              }
              main > div:target ~ div[id="dashboard"] {
                 display: none;
              }
             
            `}</style>
             <script
              dangerouslySetInnerHTML={{
                __html: `
                  function handleHashChange() {
                    const hash = window.location.hash.substring(1);
                    const sections = document.querySelectorAll('main > div');
                    let sectionToShow = 'dashboard';
                    if (hash && document.getElementById(hash)) {
                      sectionToShow = hash;
                    }
                    
                    sections.forEach(section => {
                      if (section.id === sectionToShow) {
                        section.style.display = 'block';
                      } else {
                        section.style.display = 'none';
                      }
                    });
                  }
                  window.addEventListener('hashchange', handleHashChange, false);
                  
                  // Initial load
                  document.addEventListener('DOMContentLoaded', handleHashChange);
                  
                  // Fallback for initial load if DOMContentLoaded is tricky
                  handleHashChange();
              `,
              }}
            />

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
