'use client';

import { createContext, useContext, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SimulatorData, ExpenseData, CouplesData, Loan } from '@/types';
import { isEqual } from 'lodash';


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

// Custom hook to provide a stable setter function that only updates if the value has changed.
function useStableLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useLocalStorage<T>(key, initialValue);

  const setValue = useCallback((value: SetStateAction<T>) => {
    setStoredValue(currentValue => {
      const newValue = value instanceof Function ? value(currentValue) : value;
      if (!isEqual(currentValue, newValue)) {
        return newValue;
      }
      return currentValue;
    });
  }, [setStoredValue]);

  return [storedValue, setValue];
}


export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const uid = 'guest';

  const [simulatorData, setSimulatorData] = useStableLocalStorage<SimulatorData>(`fin-sim-data_${uid}`, initialSimulatorData);
  const [expenseData, setExpenseData] = useStableLocalStorage<ExpenseData>(`fin-expense-data_${uid}`, initialExpenseData);
  const [couplesData, setCouplesData] = useStableLocalStorage<CouplesData>(`fin-couples-data_${uid}`, initialCouplesData);
  const [loans, setLoans] = useStableLocalStorage<Loan[]>(`fin-loans-data_${uid}`, []);


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
