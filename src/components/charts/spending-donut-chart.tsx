'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SpendingDonutChartProps {
    data: {
        name: string;
        value: number;
        fill: string;
    }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't render label for small slices

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
            {`${formatPercentage(percent * 100)}`}
        </text>
    );
};

export function SpendingDonutChart({ data }: SpendingDonutChartProps) {
    const hasData = data && data.length > 0 && data.some(d => d.value > 0);
    const totalDespesas = data.reduce((acc, item) => acc + item.value, 0);

    if (!hasData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Despesas por Categoria</CardTitle>
                    <CardDescription>Distribuição das suas despesas no mês selecionado.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">Sem despesas para exibir no gráfico.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição das suas despesas no mês selecionado.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[400px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={'80%'}
                                innerRadius={'60%'}
                                fill="#8884d8"
                                dataKey="value"
                                paddingAngle={2}
                            >
                                {data.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                            <Legend 
                                iconType="circle"
                                formatter={(value, entry) => <span className="text-foreground">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalDespesas)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
