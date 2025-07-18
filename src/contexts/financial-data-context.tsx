'use client';

import { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SimulatorData, ExpenseData, CouplesData, Loan } from '@/types';

const initialSimulatorData: SimulatorData = {
  preco: 210000,
  entradaPct: 20,
  parcelas: 360,
  taxaAnual: 10,
  nomeA: 'Gabriel',
  rendaA: 4500,
  gastosA: 0,
  nomeB: 'Raiane',
  rendaB: 4000,
  gastosB: 0,
  amortizacao: 1000,
  parcelasPagas: {},
};

const initialExpenseData: ExpenseData = {
  subTabs: {
    'default': {
      nome: 'Gabriel',
      data: {
        [new Date().getFullYear()]: {
          receitas: Array(12).fill([]),
          essenciais: Array(12).fill([]),
          naoEssenciais: Array(12).fill([]),
        }
      }
    }
  },
  currentSubTabId: 'default',
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
};

const initialCouplesData: CouplesData = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  yearData: {
    [new Date().getFullYear()]: Array.from({ length: 12 }, () => ({
      rendaA: 4500,
      rendaB: 4000,
      poupancaA: 0,
      poupancaB: 0,
      contas: [],
      nomeA: 'Gabriel',
      nomeB: 'Raiane'
    }))
  },
};

interface FinancialDataContextType {
  simulatorData: SimulatorData;
  setSimulatorData: Dispatch<SetStateAction<SimulatorData>>;
  expenseData: ExpenseData;
  setExpenseData: Dispatch<SetStateAction<ExpenseData>>;
  couplesData: CouplesData;
  setCouplesData: Dispatch<SetStateAction<CouplesData>>;
  loans: Loan[];
  setLoans: Dispatch<SetStateAction<Loan[]>>;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const [simulatorData, setSimulatorData] = useLocalStorage<SimulatorData>('fin-sim-data', initialSimulatorData);
  const [expenseData, setExpenseData] = useLocalStorage<ExpenseData>('fin-expense-data', initialExpenseData);
  const [couplesData, setCouplesData] = useLocalStorage<CouplesData>('fin-couples-data', initialCouplesData);
  const [loans, setLoans] = useLocalStorage<Loan[]>('fin-loans-data', []);

  const value = {
    simulatorData,
    setSimulatorData,
    expenseData,
    setExpenseData,
    couplesData,
    setCouplesData,
    loans,
    setLoans
  };

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
}
