'use client';

import { useState } from 'react';
import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { MonthlySpendingChart } from '@/components/charts/monthly-spending-chart';

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function DashboardTab() {
  const { expenseData } = useFinancialData();
  const [year, setYear] = useState(new Date().getFullYear());
  
  const currentPersonData = expenseData.subTabs[expenseData.currentSubTabId]?.data[year];

  const handleYearChange = (value: string) => {
    setYear(Number(value));
  };

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
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={String(year)} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(10)].map((_, i) => <SelectItem key={i} value={String(new Date().getFullYear() - 5 + i)}>{new Date().getFullYear() - 5 + i}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
        
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
