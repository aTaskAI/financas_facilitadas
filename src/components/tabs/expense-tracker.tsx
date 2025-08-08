'use client';

import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, UserPlus, HandCoins, PiggyBank, ReceiptText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SpendingChart } from '../charts/spending-chart';
import { useState } from 'react';
import { cloneDeep } from 'lodash';


type Categoria = 'receitas' | 'essenciais' | 'naoEssenciais';

export function ExpenseTracker() {
  const { expenseData, setExpenseData } = useFinancialData();
  const { subTabs, currentSubTabId, year, month } = expenseData;
  const currentSubTab = subTabs[currentSubTabId] || { nome: '', data: {} };
  
  // Garantir que a estrutura de dados exista para o mês e ano atuais
  const getSafeMonthData = () => {
    const yearData = currentSubTab.data?.[year];
    const monthData = yearData?.[month];

    if (monthData) {
        return monthData;
    }

    return { receitas: [], essenciais: [], naoEssenciais: [] };
  }

  const currentMonthData = getSafeMonthData();

  const [draggedItem, setDraggedItem] = useState<{ id: number, categoria: Categoria } | null>(null);

  const handleSubTabChange = (id: string) => {
    setExpenseData(prev => ({ ...prev, currentSubTabId: id }));
  };

  const addSubTab = () => {
    const nome = prompt('Nome da nova pessoa:');
    if (nome) {
      const id = `person_${Date.now()}`;
      setExpenseData(prev => ({
        ...prev,
        subTabs: {
          ...prev.subTabs,
          [id]: { nome, data: {} },
        },
        currentSubTabId: id,
      }));
    }
  };
  
  const updateMonthData = (categoria: Categoria, data: any[]) => {
     setExpenseData(prev => {
        const newState = cloneDeep(prev);
        const subTabToUpdate = newState.subTabs[newState.currentSubTabId];

        if (!subTabToUpdate.data[newState.year]) {
            subTabToUpdate.data[newState.year] = {};
        }
        
        if(!subTabToUpdate.data[newState.year][newState.month]) {
            subTabToUpdate.data[newState.year][newState.month] = {
                receitas: [],
                essenciais: [],
                naoEssenciais: [],
            };
        }
        
        subTabToUpdate.data[newState.year][newState.month][categoria] = data;
        return newState;
    });
  }

  const handleItemChange = (categoria: Categoria, id: number, field: 'nome' | 'valor', value: string | number) => {
    const newItems = currentMonthData[categoria].map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateMonthData(categoria, newItems);
  };

  const addItem = (categoria: Categoria) => {
    const nome = prompt(`Nome da nova ${categoria === 'receitas' ? 'receita' : 'despesa'}:`);
    if (nome) {
      const newItem = { id: Date.now(), nome, valor: 0 };
      const newItems = [...currentMonthData[categoria], newItem];
      updateMonthData(categoria, newItems);
    }
  };
  
  const removeItem = (categoria: Categoria, id: number) => {
    const newItems = currentMonthData[categoria].filter(item => item.id !== id);
    updateMonthData(categoria, newItems);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number, categoria: Categoria) => {
    setDraggedItem({ id, categoria });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetCategoria: Categoria) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { id, categoria: sourceCategoria } = draggedItem;
    if (sourceCategoria === targetCategoria) return;

    setExpenseData(prev => {
      const newState = cloneDeep(prev);
      const dataForMonth = newState.subTabs[newState.currentSubTabId].data[newState.year]?.[newState.month];

      if(!dataForMonth) return prev;

      const sourceItems = dataForMonth[sourceCategoria];
      const itemToMove = sourceItems.find(item => item.id === id);

      if (!itemToMove) return prev; 

      dataForMonth[sourceCategoria] = sourceItems.filter(item => item.id !== id);
      dataForMonth[targetCategoria].push(itemToMove);
      
      return newState;
    });

    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const totalReceitas = currentMonthData.receitas.reduce((acc, item) => acc + item.valor, 0);
  const totalDespesas = [...currentMonthData.essenciais, ...currentMonthData.naoEssenciais].reduce((acc, item) => acc + item.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  
  const chartData = [...currentMonthData.essenciais, ...currentMonthData.naoEssenciais].map(item => ({ name: item.nome, total: item.valor }));

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const renderList = (categoria: Categoria, title: string, icon: React.ReactNode) => (
    <Card className="flex flex-col">
       <div className="flex-grow" onDrop={(e) => handleDrop(e, categoria)} onDragOver={handleDragOver}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow">
                {currentMonthData[categoria].map(item => (
                <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item.id, categoria)} className="flex gap-2 items-center p-2 rounded-md hover:bg-slate-100 cursor-move animate-fade-in-down">
                    <Input value={item.nome} onChange={e => handleItemChange(categoria, item.id, 'nome', e.target.value)} placeholder="Descrição" />
                    <Input type="number" value={item.valor} onChange={e => handleItemChange(categoria, item.id, 'valor', Number(e.target.value))} className="w-32" placeholder="Valor" />
                    <Button variant="ghost" size="icon" onClick={() => removeItem(categoria, item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
                ))}
            </CardContent>
       </div>
      <div className="p-4 pt-0 mt-auto">
        <Button onClick={() => addItem(categoria)} className="w-full mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar</Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-wrap gap-4 items-center">
          <Select value={currentSubTabId} onValueChange={handleSubTabChange}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Pessoa" /></SelectTrigger>
            <SelectContent>
              {Object.keys(subTabs).map(id => <SelectItem key={id} value={id}>{subTabs[id].nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={addSubTab}><UserPlus className="mr-2 h-4 w-4" /> Nova Pessoa</Button>
          <div className="flex-grow" />
          <Select value={String(month)} onValueChange={(val) => setExpenseData(p => ({...p, month: Number(val)}))}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Mês" /></SelectTrigger>
            <SelectContent>
              {meses.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(val) => setExpenseData(p => ({...p, year: Number(val)}))}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Ano" /></SelectTrigger>
            <SelectContent>
              {[...Array(10)].map((_, i) => <SelectItem key={i} value={String(new Date().getFullYear() - 5 + i)}>{new Date().getFullYear() - 5 + i}</SelectItem>)}
            </SelectContent>
          </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50"><CardHeader><CardTitle>Receitas</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-green-700">{formatCurrency(totalReceitas)}</CardContent></Card>
        <Card className="bg-red-50"><CardHeader><CardTitle>Despesas</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-red-700">{formatCurrency(totalDespesas)}</CardContent></Card>
        <Card className={saldo >= 0 ? 'bg-blue-50' : 'bg-orange-50'}><CardHeader><CardTitle>Saldo</CardTitle></CardHeader><CardContent className={`text-3xl font-bold ${saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatCurrency(saldo)}</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderList('receitas', 'Receitas', <HandCoins className="text-green-500" />)}
        {renderList('essenciais', 'Despesas Essenciais', <ReceiptText className="text-red-500" />)}
        {renderList('naoEssenciais', 'Despesas Não Essenciais', <PiggyBank className="text-orange-500" />)}
      </div>

      <SpendingChart data={chartData} />
    </div>
  );
}
