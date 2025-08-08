'use client';

import { useState } from 'react';
import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, BarChart, PieChart, AreaChart } from 'lucide-react';
import { MonthlySpendingChart } from '@/components/charts/monthly-spending-chart';
import { SpendingDonutChart } from '@/components/charts/spending-donut-chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function DashboardTab() {
  const { expenseData, loans, simulatorData } = useFinancialData();
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
  
  const annualChartData = meses.map((_, monthIndex) => {
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
    { name: 'Essenciais', value: essenciais, fill: 'hsl(var(--destructive))' },
    { name: 'Não Essenciais', value: naoEssenciais, fill: 'hsl(var(--accent))' }
  ].filter(d => d.value > 0);

  const cashFlowData = meses.map((_, monthIndex) => {
    const monthData = currentPersonData?.[monthIndex] || { receitas: [], essenciais: [], naoEssenciais: [] };
    const receitaTotal = monthData.receitas.reduce((acc, item) => acc + item.valor, 0);
    const despesasTotais = monthData.essenciais.reduce((acc, i) => acc + i.valor, 0) + monthData.naoEssenciais.reduce((acc, i) => acc + i.valor, 0);
    const saldoOperacional = receitaTotal - despesasTotais;
    
    // Simplistic view of debt payments - assumes financing and loans are paid monthly
    const financiamentoPago = (simulatorData.parcelasPagas[monthIndex + 1] ? (simulatorData.valorFinanciado / simulatorData.parcelas) : 0) + (simulatorData.amortizacao || 0);
    const emprestimosPagos = loans.reduce((acc, loan) => {
      return acc + loan.pagamentos.filter(p => p.pago).reduce((sum, p) => sum + p.valor, 0) / loan.parcelas; // Simplified average
    }, 0);
    
    const pagamentoDividas = financiamentoPago + emprestimosPagos;
    const fluxoCaixaLivre = saldoOperacional - pagamentoDividas;

    return {
      name: meses[monthIndex],
      receitaTotal,
      despesasTotais,
      saldoOperacional,
      pagamentoDividas,
      fluxoCaixaLivre
    };
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-lg font-semibold w-32 text-center">{meses[month]} de {year}</span>
            <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
        
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resultado do Período</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(saldo)}</div>
                    <p className={`text-xs ${saldoChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {saldoChange >= 0 ? '+' : ''}{saldoChange.toFixed(1)}% em relação ao mês anterior
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(receitas)}</div>
                    <p className="text-xs text-muted-foreground">Total de receitas no período</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saídas</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</div>
                    <p className="text-xs text-muted-foreground">Total de despesas no período</p>
                </CardContent>
            </Card>
        </div>
        
        <Tabs defaultValue="evolution" className="w-full">
            <TabsList>
                <TabsTrigger value="evolution"><BarChart className="mr-2 h-4 w-4" /> Evolução no Ano</TabsTrigger>
                <TabsTrigger value="category"><PieChart className="mr-2 h-4 w-4" /> Despesas por Categoria</TabsTrigger>
                <TabsTrigger value="cashflow"><AreaChart className="mr-2 h-4 w-4" /> Fluxo de Caixa</TabsTrigger>
            </TabsList>
            <TabsContent value="evolution">
                <MonthlySpendingChart data={annualChartData} />
            </TabsContent>
            <TabsContent value="category">
                <SpendingDonutChart data={donutChartData} />
            </TabsContent>
            <TabsContent value="cashflow">
               <Card>
                <CardHeader>
                    <CardTitle>Fluxo de Caixa Anual</CardTitle>
                    <CardDescription>Análise detalhada do seu fluxo de caixa mensal ao longo do ano de {year}.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Mês</TableHead>
                                <TableHead className="text-right">Receita Total</TableHead>
                                <TableHead className="text-right">Despesas Totais</TableHead>
                                <TableHead className="text-right">Saldo Operacional</TableHead>
                                <TableHead className="text-right">Pag. Dívidas</TableHead>
                                <TableHead className="text-right text-emerald-600 font-bold">Fluxo de Caixa Livre</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cashFlowData.map((item) => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right text-emerald-600">{formatCurrency(item.receitaTotal)}</TableCell>
                                    <TableCell className="text-right text-red-600">{formatCurrency(item.despesasTotais)}</TableCell>
                                    <TableCell className={`text-right font-medium ${item.saldoOperacional >= 0 ? 'text-foreground' : 'text-red-600'}`}>{formatCurrency(item.saldoOperacional)}</TableCell>
                                    <TableCell className="text-right text-orange-600">{formatCurrency(item.pagamentoDividas)}</TableCell>
                                    <TableCell className={`text-right font-bold ${item.fluxoCaixaLivre >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(item.fluxoCaixaLivre)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                   </ScrollArea>
                </CardContent>
               </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
