'use client';

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CashFlowChartProps {
  data: {
    name: string;
    receitaTotal: number;
    despesasTotais: number;
    fluxoCaixaLivre: number;
  }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const hasData = data && data.some(d => d.receitaTotal > 0 || d.despesasTotais > 0 || d.fluxoCaixaLivre !== 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Fluxo de Caixa Anual</CardTitle>
        <CardDescription>Receitas, despesas e fluxo de caixa livre ao longo do ano.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        {!hasData ? (
           <div className="h-full flex items-center justify-center">
             <p className="text-muted-foreground">Sem dados para exibir no gráfico.</p>
           </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
                 <linearGradient id="colorFluxo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>
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
            <Area type="monotone" dataKey="receitaTotal" name="Receita Total" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorReceita)" />
            <Area type="monotone" dataKey="despesasTotais" name="Despesas Totais" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorDespesa)" />
            <Area type="monotone" dataKey="fluxoCaixaLivre" name="Fluxo de Caixa Livre" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorFluxo)" />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
