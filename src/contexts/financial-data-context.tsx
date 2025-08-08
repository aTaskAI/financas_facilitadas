'use client';

import { createContext, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SimulatorData, ExpenseData, CouplesData, Loan } from '@/types';
import { isEqual } from 'lodash';
import { useAuth } from './auth-context';


const initialSimulatorData: SimulatorData = {
  preco: 210000,
  entradaPct: 20,
  parcelas: 360,
  taxaAnual: 10,
  nomeA: 'Pessoa A',
  rendaA: 5000,
  gastosA: 0,
  nomeB: 'Pessoa B',
  rendaB: 4000,
  gastosB: 0,
  amortizacao: 1000,
  parcelasPagas: {},
};

const initialExpenseData: ExpenseData = {
  subTabs: {
    'default': {
      nome: 'Pessoa A',
      data: {}
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
      rendaA: 5000,
      rendaB: 4000,
      poupancaA: 0,
      poupancaB: 0,
      contas: [],
      nomeA: 'Pessoa A',
      nomeB: 'Pessoa B'
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
  const { user } = useAuth();
  const uid = user?.uid || 'guest';

  const [simulatorData, setSimulatorData] = useLocalStorage<SimulatorData>(`fin-sim-data_${uid}`, initialSimulatorData);
  const [expenseData, setExpenseData] = useLocalStorage<ExpenseData>(`fin-expense-data_${uid}`, initialExpenseData);
  const [couplesData, setCouplesData] = useLocalStorage<CouplesData>(`fin-couples-data_${uid}`, initialCouplesData);
  const [loans, setLoans] = useLocalStorage<Loan[]>(`fin-loans-data_${uid}`, []);

  // Reset data when user changes
  useEffect(() => {
    // This effect will run when the `uid` changes, effectively resetting the data
    // for the new user by re-initializing the useLocalStorage hooks.
    // We can add explicit reset logic here if needed, but useLocalStorage handles this.
  }, [uid]);


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
