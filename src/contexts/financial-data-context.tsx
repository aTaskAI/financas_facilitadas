'use client';

import { createContext, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SimulatorData, ExpenseData, CouplesData, Loan } from '@/types';
import { useAuth } from '@/hooks/use-auth';

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
      data: {
        [new Date().getFullYear()]: {
          receitas: Array(12).fill([]).map(() => []),
          essenciais: Array(12).fill([]).map(() => []),
          naoEssenciais: Array(12).fill([]).map(() => []),
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
  const { user, userData } = useAuth();
  const uid = user?.uid || 'guest';

  const [simulatorData, setSimulatorData] = useLocalStorage<SimulatorData>(`fin-sim-data_${uid}`, initialSimulatorData);
  const [expenseData, setExpenseData] = useLocalStorage<ExpenseData>(`fin-expense-data_${uid}`, initialExpenseData);
  const [couplesData, setCouplesData] = useLocalStorage<CouplesData>(`fin-couples-data_${uid}`, initialCouplesData);
  const [loans, setLoans] = useLocalStorage<Loan[]>(`fin-loans-data_${uid}`, []);

  useEffect(() => {
    if (userData) {
      const updateData = (isInitial: boolean) => {
        setSimulatorData(prev => ({
          ...prev,
          nomeA: userData.nome || prev.nomeA,
          rendaA: userData.renda || prev.rendaA,
          nomeB: userData.nomeConjuge || prev.nomeB,
          rendaB: userData.rendaConjuge || prev.rendaB,
        }));
        
        setCouplesData(prev => {
            const newYearData = { ...prev.yearData };
            if (!newYearData[prev.year]) {
                newYearData[prev.year] = {};
            }
            const currentMonthData = newYearData[prev.year][prev.month] || {};
            newYearData[prev.year][prev.month] = {
                ...currentMonthData,
                nomeA: userData.nome || currentMonthData.nomeA,
                rendaA: userData.renda || currentMonthData.rendaA,
                nomeB: userData.nomeConjuge || currentMonthData.nomeB,
                rendaB: userData.rendaConjuge || currentMonthData.rendaB,
            };
            return { ...prev, yearData: newYearData };
        });

        setExpenseData(prev => {
            const defaultTab = prev.subTabs['default'];
            return {
                ...prev,
                subTabs: {
                    ...prev.subTabs,
                    'default': {
                        ...defaultTab,
                        nome: userData.nome || defaultTab.nome,
                    }
                }
            }
        });
      };
      
      const item = window.localStorage.getItem(`fin-sim-data_${uid}`);
      updateData(!item);

    }
  }, [userData, uid, setCouplesData, setExpenseData, setSimulatorData]);


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
