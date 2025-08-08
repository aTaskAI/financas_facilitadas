'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFinancialData } from '@/contexts/financial-data-context';
import { getPersonalizedFinancialAdvice, PersonalizedFinancialAdviceInput } from '@/ai/flows/personalized-financial-advice';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

export function FinancialAdviceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [financialGoals, setFinancialGoals] = useState('');
  const [spendingPatterns, setSpendingPatterns] = useState('');
  const [errors, setErrors] = useState<{ financialGoals?: string, spendingPatterns?: string }>({});

  const {
    simulatorData,
    expenseData,
    loans,
    couplesData
  } = useFinancialData();
  
  const validate = () => {
    const newErrors: { financialGoals?: string, spendingPatterns?: string } = {};
    if (financialGoals.length < 10) {
      newErrors.financialGoals = 'Por favor, descreva seus objetivos com mais detalhes (mínimo 10 caracteres).';
    }
    if (spendingPatterns.length < 10) {
      newErrors.spendingPatterns = 'Por favor, descreva seus padrões de gastos com mais detalhes (mínimo 10 caracteres).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setAdvice(null);
    try {
      const year = expenseData.year;
      const month = expenseData.month;
      
      let totalMonthlyIncome = 0;
      let totalMonthlyExpenses = 0;
      
      for (const subTabId in expenseData.subTabs) {
        const subTab = expenseData.subTabs[subTabId];
        const monthData = subTab.data?.[year]?.[month];
        if (monthData) {
          totalMonthlyIncome += monthData.receitas.reduce((acc, r) => acc + r.valor, 0);
          totalMonthlyExpenses += monthData.essenciais.reduce((acc, e) => acc + e.valor, 0);
          totalMonthlyExpenses += monthData.naoEssenciais.reduce((acc, e) => acc + e.valor, 0);
        }
      }

      const coupleMonthData = couplesData.yearData?.[year]?.[month];
      if (coupleMonthData) {
        totalMonthlyIncome += coupleMonthData.rendaA || 0;
        totalMonthlyIncome += coupleMonthData.rendaB || 0;
        totalMonthlyExpenses += coupleMonthData.contas.reduce((acc, c) => acc + c.valor, 0);
        totalMonthlyExpenses += coupleMonthData.poupancaA || 0;
        totalMonthlyExpenses += coupleMonthData.poupancaB || 0;
      }
      
      const financingDebt = simulatorData.valorFinanciado > 0 
          ? simulatorData.valorFinanciado - (simulatorData.parcelasPagas ? Object.keys(simulatorData.parcelasPagas).length * (simulatorData.valorFinanciado / simulatorData.parcelas) : 0)
          : 0;

      const loansDebt = loans.reduce((acc, loan) => {
        const paidAmount = loan.pagamentos.filter(p => p.pago).reduce((sum, p) => sum + p.valor, 0);
        return acc + (loan.valorTotal - paidAmount);
      }, 0);

      const totalDebts = financingDebt + loansDebt;
      const savingRate = totalMonthlyIncome > 0 ? ((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome) * 100 : 0;
      
      const input: PersonalizedFinancialAdviceInput = {
        income: totalMonthlyIncome,
        expenses: totalMonthlyExpenses,
        debts: totalDebts,
        savingRate: parseFloat(savingRate.toFixed(2)),
        financialGoals: financialGoals,
        spendingPatterns: spendingPatterns,
      };
      
      const result = await getPersonalizedFinancialAdvice(input);
      setAdvice(result.advice);
    } catch (error) {
      console.error('Error getting financial advice:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível obter a consultoria. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setAdvice(null);
      setFinancialGoals('');
      setSpendingPatterns('');
      setErrors({});
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <BrainCircuit className="mr-2 h-4 w-4" />
          Consultoria com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Consultoria Financeira com IA</DialogTitle>
          <DialogDescription>
            Receba dicas personalizadas para melhorar sua saúde financeira. Preencha os campos abaixo para que a IA possa entender seu contexto.
          </DialogDescription>
        </DialogHeader>
        {!advice && (
           <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="financialGoals">Metas Financeiras</Label>
              <Textarea 
                id="financialGoals" 
                placeholder="Ex: Quitar o financiamento em 10 anos, fazer uma viagem internacional, aposentar aos 50 anos..." 
                className="mt-1"
                value={financialGoals}
                onChange={e => setFinancialGoals(e.target.value)}
              />
              {errors.financialGoals && <p className="text-red-500 text-sm mt-1">{errors.financialGoals}</p>}
            </div>
            <div>
              <Label htmlFor="spendingPatterns">Padrões de Gastos</Label>
              <Textarea 
                id="spendingPatterns" 
                placeholder="Ex: Gasto muito com delivery nos finais de semana, costumo comprar roupas por impulso, etc." 
                className="mt-1"
                value={spendingPatterns}
                onChange={e => setSpendingPatterns(e.target.value)}
              />
              {errors.spendingPatterns && <p className="text-red-500 text-sm mt-1">{errors.spendingPatterns}</p>}
            </div>
             <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Obter Consultoria
              </Button>
            </DialogFooter>
          </form>
        )}
        {isLoading && !advice && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Analisando suas finanças...</p>
          </div>
        )}
        {advice && (
          <>
            <ScrollArea className="max-h-[400px] p-4 bg-slate-50 rounded-md border dark:bg-slate-900">
                <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: advice }}></div>
            </ScrollArea>
             <DialogFooter>
              <Button onClick={() => { setAdvice(null); }}>Gerar Nova Consultoria</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
