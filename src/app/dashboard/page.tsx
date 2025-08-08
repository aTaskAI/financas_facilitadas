'use client';

import { useState } from 'react';
import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { MonthlySpendingChart } from '@/components/charts/monthly-spending-chart';
import { FinancialDataProvider } from '@/contexts/financial-data-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, PiggyBank } from 'lucide-react';
import Link from 'next/link';

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function DashboardPageContent() {
  const { expenseData } = useFinancialData();
  const [year, setYear] = useState(new Date().getFullYear());
  const { logout } = useAuth();
  
  const currentPersonData = expenseData.subTabs[expenseData.currentSubTabId]?.data[year];

  const cashFlowData = meses.map((monthName, monthIndex) => {
    const monthData = currentPersonData?.[monthIndex];
    const receitas = monthData?.receitas?.reduce((acc, item) => acc + item.valor, 0) || 0;
    const essenciais = monthData?.essenciais?.reduce((acc, item) => acc + item.valor, 0) || 0;
    const naoEssenciais = monthData?.naoEssenciais?.reduce((acc, item) => acc + item.valor, 0) || 0;
    const totalDespesas = essenciais + naoEssenciais;
    const saldo = receitas - totalDespesas;

    return {
      mes: monthName,
      receitas,
      essenciais,
      naoEssenciais,
      totalDespesas,
      saldo,
    };
  });

  const chartData = cashFlowData.map(d => ({ name: d.mes, total: d.totalDespesas }));

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
       <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-10 w-10 text-primary" />
             <Link href="/"><h1 className="text-3xl font-bold font-headline text-slate-800">
              Finanças Simplificadas
            </h1></Link>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => <SelectItem key={i} value={String(new Date().getFullYear() - 5 + i)}>{new Date().getFullYear() - 5 + i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
      <Tabs defaultValue="cash-flow">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cash-flow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="chart">Gráfico Anual</TabsTrigger>
        </TabsList>
        <TabsContent value="cash-flow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Anual - {year}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Mês</TableHead>
                    <TableHead className="text-green-600 font-bold">Receitas</TableHead>
                    <TableHead className="text-red-600 font-bold">Desp. Essenciais</TableHead>
                    <TableHead className="text-orange-600 font-bold">Desp. Não Essenciais</TableHead>
                    <TableHead className="text-red-800 font-bold">Total Despesas</TableHead>
                    <TableHead className="font-bold">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowData.map((data) => (
                    <TableRow key={data.mes}>
                      <TableCell className="font-medium">{data.mes}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(data.receitas)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(data.essenciais)}</TableCell>
                      <TableCell className="text-orange-500">{formatCurrency(data.naoEssenciais)}</TableCell>
                      <TableCell className="text-red-800">{formatCurrency(data.totalDespesas)}</TableCell>
                      <TableCell className={`font-bold ${data.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(data.saldo)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart" className="mt-6">
            <MonthlySpendingChart data={chartData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function DashboardPage() {
    const { user, loading } = useAuth();
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
            <DashboardPageContent />
        </FinancialDataProvider>
    )
}
