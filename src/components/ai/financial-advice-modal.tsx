'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFinancialData } from '@/contexts/financial-data-context';
import { getPersonalizedFinancialAdvice, PersonalizedFinancialAdviceInput } from '@/ai/flows/personalized-financial-advice';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

const adviceSchema = z.object({
  financialGoals: z.string().min(10, 'Por favor, descreva seus objetivos com mais detalhes.'),
  spendingPatterns: z.string().min(10, 'Por favor, descreva seus padrões de gastos com mais detalhes.'),
});

export function FinancialAdviceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const { toast } = useToast();
  const {
    simulatorData,
    expenseData,
    loans,
    couplesData
  } = useFinancialData();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(adviceSchema),
    defaultValues: {
      financialGoals: '',
      spendingPatterns: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof adviceSchema>) => {
    setIsLoading(true);
    setAdvice(null);
    try {
      // Aggregate data from context
      const monthlyIncome = expenseData.subTabs[expenseData.currentSubTabId]?.data[expenseData.year]?.receitas[expenseData.month]
        .reduce((acc, r) => acc + r.valor, 0) || (couplesData.yearData[couplesData.year]?.[couplesData.month]?.rendaA || 0) + (couplesData.yearData[couplesData.year]?.[couplesData.month]?.rendaB || 0) || 0;

      const monthlyExpenses = (expenseData.subTabs[expenseData.currentSubTabId]?.data[expenseData.year]?.essenciais[expenseData.month]
        .reduce((acc, e) => acc + e.valor, 0) || 0) + 
        (expenseData.subTabs[expenseData.currentSubTabId]?.data[expenseData.year]?.naoEssenciais[expenseData.month]
        .reduce((acc, e) => acc + e.valor, 0) || 0);

      const totalDebts = (simulatorData.valorFinanciado || 0) + loans.reduce((acc, loan) => {
        const paidAmount = loan.pagamentos.filter(p => p.pago).reduce((sum, p) => sum + p.valor, 0);
        return acc + (loan.valorTotal - paidAmount);
      }, 0);

      const savingRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
      
      const input: PersonalizedFinancialAdviceInput = {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        debts: totalDebts,
        savingRate: parseFloat(savingRate.toFixed(2)),
        financialGoals: data.financialGoals,
        spendingPatterns: data.spendingPatterns,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="financialGoals">Metas Financeiras</Label>
              <Controller
                name="financialGoals"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} id="financialGoals" placeholder="Ex: Quitar o financiamento em 10 anos, fazer uma viagem internacional, aposentar aos 50 anos..." className="mt-1" />
                )}
              />
              {errors.financialGoals && <p className="text-red-500 text-sm mt-1">{errors.financialGoals.message}</p>}
            </div>
            <div>
              <Label htmlFor="spendingPatterns">Padrões de Gastos</Label>
               <Controller
                name="spendingPatterns"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} id="spendingPatterns" placeholder="Ex: Gasto muito com delivery nos finais de semana, costumo comprar roupas por impulso, etc." className="mt-1" />
                )}
              />
              {errors.spendingPatterns && <p className="text-red-500 text-sm mt-1">{errors.spendingPatterns.message}</p>}
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
            <ScrollArea className="max-h-[400px] p-4 bg-slate-50 rounded-md border">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }}></div>
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
