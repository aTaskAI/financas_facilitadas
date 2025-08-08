'use client';

import { useState } from 'react';
import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, BarChart, PieChart } from 'lucide-react';
import { MonthlySpendingChart } from '@/components/charts/monthly-spending-chart';
import { SpendingDonutChart } from '@/components/charts/spending-donut-chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function DashboardTab() {
  const { expenseData } = useFinancialData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const currentPersonData = expenseData.subTabs[expenseData.currentSubTabId]?.data[year];
  
  const currentMonthData = currentPersonData?.[month] || { receitas: [], essenciais: [], naoEssenciais: [] };
  const receitas = currentMonthData.receitas.reduce((acc, item) => acc + item.valor, 0);
  const essenciais = currentMonthData.essenciais.reduce((acc, item) => acc + item.valor, 0);
  const naoEssenciais = currentMonthData.naoEssenciais.reduce((acc, item) => acc + item.valor, 0);
  const totalDespesas = essenciais + naoEssenciais;
  const saldo = receitas - totalDespesas;

  const getPreviousMonthData = () => {
    const prevMonthDate = new Date(currentDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();
    const prevPersonData = expenseData.subTabs[expenseData.currentSubTabId]?.data[prevYear];
    return prevPersonData?.[prevMonth] || { receitas: [], essenciais: [], naoEssenciais: [] };
  }

  const prevMonthRawData = getPreviousMonthData();
  const prevMonthReceitas = prevMonthRawData.receitas.reduce((acc, item) => acc + item.valor, 0);
  const prevMonthDespesas = (prevMonthRawData.essenciais.reduce((acc, item) => acc + item.valor, 0)) + (prevMonthRawData.naoEssenciais.reduce((acc, item) => acc + item.valor, 0));
  const prevMonthSaldo = prevMonthReceitas - prevMonthDespesas;
  
  const saldoChange = prevMonthSaldo !== 0 ? ((saldo - prevMonthSaldo) / Math.abs(prevMonthSaldo)) * 100 : saldo > 0 ? 100 : 0;
  
  const allMonthsData = meses.map((_, monthIndex) => {
    const monthData = currentPersonData?.[monthIndex] || { receitas: [], essenciais: [], naoEssenciais: [] };
    const receitas = monthData.receitas.reduce((acc, item) => acc + item.valor, 0);
    const essenciais = monthData.essenciais.reduce((acc, item) => acc + item.valor, 0);
    const naoEssenciais = monthData.naoEssenciais.reduce((acc, item) => acc + item.valor, 0);
    return {
      name: meses[monthIndex].substring(0, 3),
      receitas,
      despesas: essenciais + naoEssenciais,
      saldo: receitas - (essenciais + naoEssenciais)
    };
  });

  const donutChartData = [
    ...currentMonthData.essenciais.map(d => ({ name: d.nome, value: d.valor, fill: 'hsl(var(--destructive))' })),
    ...currentMonthData.naoEssenciais.map(d => ({ name: d.nome, value: d.valor, fill: 'hsl(var(--accent))' }))
  ].filter(d => d.value > 0);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <button onClick={() => handleMonthChange('prev')} className="p-2 rounded-md hover:bg-muted"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-xl font-bold w-28 text-center">{meses[month]}</h2>
            <button onClick={() => handleMonthChange('next')} className="p-2 rounded-md hover:bg-muted"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
        
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resultado do Período</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(saldo)}</div>
                    <p className={`text-xs ${saldoChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {saldoChange >= 0 ? '+' : ''}{saldoChange.toFixed(2)}% em relação ao mês anterior
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(receitas)}</div>
                    <p className="text-xs text-muted-foreground">Total de receitas no mês</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saídas</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-red-600">{formatCurrency(totalDespesas)}</div>
                    <p className="text-xs text-muted-foreground">Total de despesas no mês</p>
                </CardContent>
            </Card>
        </div>
        
        <Tabs defaultValue="evolution">
            <TabsList>
                <TabsTrigger value="evolution"><BarChart className="mr-2" /> Evolução no Ano</TabsTrigger>
                <TabsTrigger value="category"><PieChart className="mr-2" /> Despesas por Categoria</TabsTrigger>
            </TabsList>
            <TabsContent value="evolution">
                <MonthlySpendingChart data={allMonthsData} />
            </TabsContent>
            <TabsContent value="category">
                <SpendingDonutChart data={donutChartData} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
