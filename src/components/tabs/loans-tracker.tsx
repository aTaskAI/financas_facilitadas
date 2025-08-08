'use client';
import { useFinancialData } from '@/contexts/financial-data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function LoansTracker() {
  const { loans, setLoans } = useFinancialData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({ nome: '', valorTotal: 0, parcelas: 1 });

  const addLoan = () => {
    if (!newLoan.nome || newLoan.valorTotal <= 0 || newLoan.parcelas <= 0) return;
    const pagamentos = Array.from({ length: newLoan.parcelas }, (_, i) => ({
      numero: i + 1,
      valor: newLoan.valorTotal / newLoan.parcelas,
      pago: false,
    }));
    setLoans(prev => [...prev, { id: Date.now(), ...newLoan, pagamentos }]);
    setIsDialogOpen(false);
    setNewLoan({ nome: '', valorTotal: 0, parcelas: 1 });
  };

  const removeLoan = (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este empréstimo?')) {
      setLoans(prev => prev.filter(l => l.id !== id));
    }
  };

  const togglePayment = (loanId: number, paymentIndex: number) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const newPayments = [...loan.pagamentos];
        newPayments[paymentIndex].pago = !newPayments[paymentIndex].pago;
        return { ...loan, pagamentos: newPayments };
      }
      return loan;
    }));
  };

  const totalDividas = loans.reduce((acc, loan) => acc + loan.valorTotal, 0);
  const totalPago = loans.reduce((acc, loan) => acc + loan.pagamentos.filter(p => p.pago).reduce((sum, p) => sum + p.valor, 0), 0);
  const totalRestante = totalDividas - totalPago;
  const progressoGeral = totalDividas > 0 ? (totalPago / totalDividas) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Empréstimos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 rounded-lg dark:bg-red-900/50"><h4 className="text-sm font-medium text-red-800 dark:text-red-200">Total em Dívidas</h4><p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDividas)}</p></div>
          <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900/50"><h4 className="text-sm font-medium text-green-800 dark:text-green-200">Total Já Pago</h4><p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPago)}</p></div>
          <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/50"><h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Restante</h4><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalRestante)}</p></div>
          <div className="p-4 bg-indigo-50 rounded-lg dark:bg-indigo-900/50"><h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Progresso Geral</h4><p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatPercentage(progressoGeral)}</p></div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Empréstimo</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Empréstimo</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label htmlFor="loanName">Nome do Empréstimo</Label><Input id="loanName" value={newLoan.nome} onChange={e => setNewLoan({...newLoan, nome: e.target.value})} /></div>
            <div><Label htmlFor="loanValue">Valor Total (R$)</Label><Input id="loanValue" type="number" value={newLoan.valorTotal} onChange={e => setNewLoan({...newLoan, valorTotal: Number(e.target.value)})} /></div>
            <div><Label htmlFor="loanInstallments">Número de Parcelas</Label><Input id="loanInstallments" type="number" value={newLoan.parcelas} onChange={e => setNewLoan({...newLoan, parcelas: Number(e.target.value)})} /></div>
          </div>
          <DialogFooter><Button onClick={addLoan}>Adicionar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="space-y-4">
        {loans.map(loan => {
          const valorPago = loan.pagamentos.filter(p => p.pago).reduce((sum, p) => sum + p.valor, 0);
          const progresso = loan.valorTotal > 0 ? (valorPago / loan.valorTotal) * 100 : 0;
          return (
            <Card key={loan.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{loan.nome}</CardTitle>
                  <CardDescription>
                    {formatCurrency(loan.valorTotal)} em {loan.parcelas}x
                  </CardDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => removeLoan(loan.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </CardHeader>
              <CardContent>
                <Progress value={progresso} className="mb-2" />
                <div className="text-sm text-muted-foreground">{formatCurrency(valorPago)} pagos de {formatCurrency(loan.valorTotal)}</div>
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                  {loan.pagamentos.map((p, i) => (
                    <div
                      key={p.numero}
                      onClick={() => togglePayment(loan.id, i)}
                      className={`text-center p-2 rounded-md cursor-pointer border ${p.pago ? 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700' : 'bg-slate-50 dark:bg-slate-800'}`}
                    >
                      <div className="text-xs text-muted-foreground">{p.numero}</div>
                      <div className="text-xs font-semibold">{formatCurrency(p.valor)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
