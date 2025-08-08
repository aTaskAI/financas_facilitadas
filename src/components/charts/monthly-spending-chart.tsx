'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MonthlySpendingChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export function MonthlySpendingChart({ data }: MonthlySpendingChartProps) {
  const hasData = data && data.some(d => d.total > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Gastos Anual</CardTitle>
          <CardDescription>Evolução das suas despesas totais mês a mês.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Sem dados de despesas para exibir no gráfico.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
       <CardHeader>
          <CardTitle>Gráfico de Gastos Anual</CardTitle>
          <CardDescription>Evolução das suas despesas totais mês a mês.</CardDescription>
        </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
              itemStyle={{ color: 'hsl(var(--primary))' }}
              formatter={(value: number) => [formatCurrency(value), "Despesa Total"]}
            />
            <Legend />
            <Line type="monotone" dataKey="total" name="Despesa Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
