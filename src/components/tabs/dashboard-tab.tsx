'use client';

import { useState } from 'react';
import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, BarChart, PieChart, AreaChart, Wallet } from 'lucide-react';
import { MonthlySpendingChart } from '@/components/charts/monthly-spending-chart';
import { SpendingDonutChart } from '@/components/charts/spending-donut-chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { CashFlowChart } from '../charts/cash-flow-chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function DashboardTab() {
  const { expenseData, loans, simulatorData } = useFinancialData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();
  
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

  const allExpenses = [...currentMonthData.essenciais, ...currentMonthData.naoEssenciais];
  const expensesByCategory = allExpenses.reduce((acc, expense) => {
    const category = expense.categoria || 'Outros';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.valor;
    return acc;
  }, {} as { [key: string]: number });

  const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const donutChartData = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    fill: chartColors[index % chartColors.length],
  })).filter(d => d.value > 0);


  const cashFlowChartData = meses.map((_, monthIndex) => {
    const monthData = currentPersonData?.[monthIndex] || { receitas: [], essenciais: [], naoEssenciais: [] };
    const receitaTotal = monthData.receitas.reduce((acc, item) => acc + item.valor, 0);
    const despesasTotais = monthData.essenciais.reduce((acc, i) => acc + i.valor, 0) + monthData.naoEssenciais.reduce((acc, i) => acc + i.valor, 0);
    const saldoOperacional = receitaTotal - despesasTotais;
    
    // Simplistic view of debt payments
    const financiamentoPago = simulatorData.parcelasPagas[monthIndex + 1] ? (simulatorData.valorFinanciado / simulatorData.parcelas) : 0;
    const emprestimosPagos = loans.reduce((acc, loan) => {
       const parcelaMensal = loan.valorTotal / loan.parcelas;
       const pagamentosNesteMes = loan.pagamentos.filter(p => p.pago && new Date(p.dataPagamento || 0).getMonth() === monthIndex && new Date(p.dataPagamento || 0).getFullYear() === year).length;
       return acc + (parcelaMensal * pagamentosNesteMes);
    }, 0);
    
    const pagamentoDividas = financiamentoPago + emprestimosPagos;
    const fluxoCaixaLivre = saldoOperacional - pagamentoDividas;

    return {
      name: meses[monthIndex].substring(0, 3),
      receitaTotal,
      despesasTotais,
      saldoOperacional,
      pagamentoDividas,
      fluxoCaixaLivre
    };
  });
  
  const annualTotalIncome = cashFlowChartData.reduce((acc, item) => acc + item.receitaTotal, 0);
  const annualTotalExpenses = cashFlowChartData.reduce((acc, item) => acc + item.despesasTotais, 0);
  const annualFreeCashFlow = cashFlowChartData.reduce((acc, item) => acc + item.fluxoCaixaLivre, 0);
  
  const chartCards = [
    {
      key: 'evolution',
      title: 'Evolução no Ano',
      icon: BarChart,
      content: <MonthlySpendingChart data={annualChartData} />
    },
    {
      key: 'category',
      title: 'Despesas por Categoria',
      icon: PieChart,
      content: <SpendingDonutChart data={donutChartData} />
    },
    {
      key: 'cashflow',
      title: 'Fluxo de Caixa',
      icon: AreaChart,
      content:  <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Receita Total Anual</CardTitle>
                              <TrendingUp className="h-4 w-4 text-emerald-500" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(annualTotalIncome)}</div>
                              <p className="text-xs text-muted-foreground">Total de entradas em {year}</p>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Despesas Totais Anual</CardTitle>
                              <TrendingDown className="h-4 w-4 text-red-500" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold text-red-600">{formatCurrency(annualTotalExpenses)}</div>
                              <p className="text-xs text-muted-foreground">Total de saídas em {year}</p>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Fluxo de Caixa Livre Anual</CardTitle>
                              <Wallet className="h-4 w-4 text-primary" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold text-primary">{formatCurrency(annualFreeCashFlow)}</div>
                              <p className="text-xs text-muted-foreground">Saldo final após todas as movimentações em {year}</p>
                          </CardContent>
                      </Card>
                  </div>
                  <CashFlowChart data={cashFlowChartData} />
                </div>
    }
  ];

  const renderCharts = () => {
    if (isMobile) {
      return (
         <Carousel className="w-full" opts={{ loop: false }}>
            <CarouselContent>
              {chartCards.map((chart) => (
                <CarouselItem key={chart.key}>
                  <div className="p-1">{chart.content}</div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-12" />
            <CarouselNext className="mr-12" />
          </Carousel>
      )
    }

    return (
       <Tabs defaultValue="evolution" className="w-full">
          <TabsList>
            {chartCards.map(chart => (
              <TabsTrigger key={chart.key} value={chart.key}>
                <chart.icon className="mr-2 h-4 w-4" /> {chart.title}
              </TabsTrigger>
            ))}
          </TabsList>
           {chartCards.map(chart => (
            <TabsContent key={chart.key} value={chart.key}>
              {chart.content}
            </TabsContent>
          ))}
      </Tabs>
    )
  }

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
        
       {renderCharts()}
    </div>
  );
}
