'use client';

import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, User } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CouplesFinance() {
  const { couplesData, setCouplesData } = useFinancialData();
  const { year, month, yearData } = couplesData;
  const currentMonthData = yearData[year]?.[month] || { rendaA: 0, rendaB: 0, poupancaA: 0, poupancaB: 0, contas: [], nomeA: 'Pessoa A', nomeB: 'Pessoa B' };

  const handleDataChange = <K extends keyof typeof currentMonthData>(field: K, value: (typeof currentMonthData)[K]) => {
    setCouplesData(prev => ({
      ...prev,
      yearData: {
        ...prev.yearData,
        [year]: {
          ...prev.yearData[year],
          [month]: {
            ...currentMonthData,
            [field]: value
          }
        }
      }
    }));
  };

  const handleAccountChange = (id: number, field: 'descricao' | 'valor', value: string | number) => {
    const newContas = currentMonthData.contas.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    );
    handleDataChange('contas', newContas);
  };

  const addAccount = () => {
    const newAccount = { id: Date.now(), descricao: 'Nova Conta', valor: 0 };
    handleDataChange('contas', [...currentMonthData.contas, newAccount]);
  };

  const removeAccount = (id: number) => {
    const newContas = currentMonthData.contas.filter(c => c.id !== id);
    handleDataChange('contas', newContas);
  };

  const rendaTotal = (currentMonthData.rendaA || 0) + (currentMonthData.rendaB || 0);
  const totalContas = currentMonthData.contas.reduce((acc, c) => acc + (c.valor || 0), 0);
  const propA = rendaTotal > 0 ? ((currentMonthData.rendaA || 0) / rendaTotal) : 0.5;
  const propB = rendaTotal > 0 ? ((currentMonthData.rendaB || 0) / rendaTotal) : 0.5;
  const totalContasA = totalContas * propA;
  const totalContasB = totalContas * propB;
  const poupancaA = currentMonthData.poupancaA || 0;
  const poupancaB = currentMonthData.poupancaB || 0;
  const sobraA = (currentMonthData.rendaA || 0) - totalContasA - poupancaA;
  const sobraB = (currentMonthData.rendaB || 0) - totalContasB - poupancaB;

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração Mensal</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
            <Select value={String(month)} onValueChange={(val) => setCouplesData(p => ({...p, month: Number(val)}))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
             <Select value={String(year)} onValueChange={(val) => setCouplesData(p => ({...p, year: Number(val)}))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => <SelectItem key={i} value={String(new Date().getFullYear() - 5 + i)}>{new Date().getFullYear() - 5 + i}</SelectItem>)}
              </SelectContent>
            </Select>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User /> {currentMonthData.nomeA}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Nome" value={currentMonthData.nomeA} onChange={e => handleDataChange('nomeA', e.target.value)} />
            <Input type="number" placeholder="Renda" value={currentMonthData.rendaA} onChange={e => handleDataChange('rendaA', Number(e.target.value))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User /> {currentMonthData.nomeB}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Nome" value={currentMonthData.nomeB} onChange={e => handleDataChange('nomeB', e.target.value)} />
            <Input type="number" placeholder="Renda" value={currentMonthData.rendaB} onChange={e => handleDataChange('rendaB', Number(e.target.value))} />
          </CardContent>
        </Card>
         <Card>
          <CardHeader><CardTitle>Proporção da Renda</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(propA * 100)} / {formatPercentage(propB * 100)}</div>
            <p className="text-sm text-muted-foreground">{currentMonthData.nomeA} / {currentMonthData.nomeB}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Renda Total</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(rendaTotal)}</div>
            <p className="text-sm text-muted-foreground">Soma das duas rendas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contas Compartilhadas ({formatCurrency(totalContas)})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentMonthData.contas.map(conta => (
                <div key={conta.id} className="flex gap-2 items-center">
                  <Input value={conta.descricao} onChange={e => handleAccountChange(conta.id, 'descricao', e.target.value)} placeholder="Descrição" />
                  <Input type="number" value={conta.valor} onChange={e => handleAccountChange(conta.id, 'valor', Number(e.target.value))} className="w-32" placeholder="Valor" />
                  <Button variant="ghost" size="icon" onClick={() => removeAccount(conta.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <Button onClick={addAccount} className="mt-4 w-full"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Conta</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Resumo Individual</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-semibold text-green-800">{currentMonthData.nomeA}</h4>
              <div className="flex justify-between"><span>Contas:</span><span>{formatCurrency(totalContasA)}</span></div>
              <div className="flex justify-between"><span>Poupança:</span><span>{formatCurrency(poupancaA)}</span></div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Sobra:</span><span className={sobraA < 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(sobraA)}</span></div>
            </div>
             <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-800">{currentMonthData.nomeB}</h4>
              <div className="flex justify-between"><span>Contas:</span><span>{formatCurrency(totalContasB)}</span></div>
              <div className="flex justify-between"><span>Poupança:</span><span>{formatCurrency(poupancaB)}</span></div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Sobra:</span><span className={sobraB < 0 ? 'text-red-600' : 'text-blue-600'}>{formatCurrency(sobraB)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>{currentMonthData.nomeA} - Poupança</CardTitle></CardHeader>
          <CardContent>
            <Input type="number" value={poupancaA} onChange={e => handleDataChange('poupancaA', Number(e.target.value))} />
            <p className="text-center mt-2 font-bold text-lg text-green-600">{formatPercentage(currentMonthData.rendaA > 0 ? (poupancaA / currentMonthData.rendaA) * 100 : 0)} da renda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{currentMonthData.nomeB} - Poupança</CardTitle></CardHeader>
          <CardContent>
            <Input type="number" value={poupancaB} onChange={e => handleDataChange('poupancaB', Number(e.target.value))} />
            <p className="text-center mt-2 font-bold text-lg text-blue-600">{formatPercentage(currentMonthData.rendaB > 0 ? (poupancaB / currentMonthData.rendaB) * 100 : 0)} da renda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Meta de Poupança Conjunta</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center text-primary">{formatCurrency(poupancaA + poupancaB)}</p>
            <p className="text-sm text-muted-foreground text-center mt-1">Total economizado no mês</p>
          </CardContent>
        </Card>
       </div>
    </div>
  );
}
