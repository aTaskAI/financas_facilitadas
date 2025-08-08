'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Area, AreaChart, Bar, ComposedChart } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MonthlySpendingChartProps {
  data: {
    name: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }[];
}

export function MonthlySpendingChart({ data }: MonthlySpendingChartProps) {
  const hasData = data && data.some(d => d.receitas > 0 || d.despesas > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira Anual</CardTitle>
          <CardDescription>Receitas, despesas e saldo ao longo do ano.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Sem dados para exibir no gráfico.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
       <CardHeader>
          <CardTitle>Evolução Financeira Anual</CardTitle>
          <CardDescription>Receitas, despesas e saldo ao longo do ano.</CardDescription>
        </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
           <ComposedChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(Number(value))}`} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Bar dataKey="saldo" name="Saldo" fill="hsl(var(--primary))" barSize={20} />
            <Line type="monotone" dataKey="receitas" name="Receitas" stroke="hsl(var(--accent))" strokeWidth={2} />
            <Line type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(var(--destructive))" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
