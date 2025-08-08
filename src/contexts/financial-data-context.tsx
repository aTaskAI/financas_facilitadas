'use client';

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { SimulatorData, ExpenseData, CouplesData, Loan } from '@/types';
import { cloneDeep, isEqual } from 'lodash';

// --- Initial Data Structures ---
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
      nome: 'Eu',
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
  yearData: {},
};

const initialLoans: Loan[] = [];

interface AllFinancialData {
    simulatorData: SimulatorData;
    expenseData: ExpenseData;
    couplesData: CouplesData;
    loans: Loan[];
}

// --- Context Definition ---
interface FinancialDataContextType {
  simulatorData: SimulatorData;
  setSimulatorData: React.Dispatch<React.SetStateAction<SimulatorData>>;
  expenseData: ExpenseData;
  setExpenseData: React.Dispatch<React.SetStateAction<ExpenseData>>;
  couplesData: CouplesData;
  setCouplesData: React.Dispatch<React.SetStateAction<CouplesData>>;
  loans: Loan[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  isDataLoading: boolean;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

// --- Provider Component ---
export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [simulatorData, setSimulatorData] = useState<SimulatorData>(cloneDeep(initialSimulatorData));
  const [expenseData, setExpenseData] = useState<ExpenseData>(cloneDeep(initialExpenseData));
  const [couplesData, setCouplesData] = useState<CouplesData>(cloneDeep(initialCouplesData));
  const [loans, setLoans] = useState<Loan[]>(cloneDeep(initialLoans));
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [lastSavedState, setLastSavedState] = useState<AllFinancialData | null>(null);

  const getCombinedState = useCallback(() => {
    return { simulatorData, expenseData, couplesData, loans };
  }, [simulatorData, expenseData, couplesData, loans]);
  
  // Effect to load data from Firestore when user logs in
  useEffect(() => {
    if (!uid || !isFirebaseConfigured) {
        setSimulatorData(cloneDeep(initialSimulatorData));
        setExpenseData(cloneDeep(initialExpenseData));
        setCouplesData(cloneDeep(initialCouplesData));
        setLoans(cloneDeep(initialLoans));
        setIsDataLoading(false);
        return;
    }

    setIsDataLoading(true);
    const docRef = doc(db, 'users', uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const firestoreData = docSnap.data() as AllFinancialData;
            // Merge with initial data to ensure all keys are present
            const newState = {
                simulatorData: { ...cloneDeep(initialSimulatorData), ...firestoreData.simulatorData },
                expenseData: { ...cloneDeep(initialExpenseData), ...firestoreData.expenseData },
                couplesData: { ...cloneDeep(initialCouplesData), ...firestoreData.couplesData },
                loans: firestoreData.loans || [],
            };
            if (!isEqual(getCombinedState(), newState)) {
                setSimulatorData(newState.simulatorData);
                setExpenseData(newState.expenseData);
                setCouplesData(newState.couplesData);
                setLoans(newState.loans);
            }
            setLastSavedState(newState);
        } else {
            const initialState = {
                simulatorData: cloneDeep(initialSimulatorData),
                expenseData: cloneDeep(initialExpenseData),
                couplesData: cloneDeep(initialCouplesData),
                loans: cloneDeep(initialLoans)
            };
            setSimulatorData(initialState.simulatorData);
            setExpenseData(initialState.expenseData);
            setCouplesData(initialState.couplesData);
            setLoans(initialState.loans);
            setLastSavedState(initialState);
        }
        setIsDataLoading(false);
    }, (error) => {
        console.error("Error listening to Firestore:", error);
        setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [uid, getCombinedState]);

  // Effect to save data to Firestore when it changes
  useEffect(() => {
    const currentState = getCombinedState();
    if (!uid || !isFirebaseConfigured || isDataLoading || isEqual(currentState, lastSavedState)) {
        return;
    }

    const saveTimeout = setTimeout(async () => {
        try {
            const docRef = doc(db, 'users', uid);
            const dataToSave = JSON.parse(JSON.stringify(currentState));
            await setDoc(docRef, dataToSave, { merge: true });
            setLastSavedState(currentState);
        } catch (error) {
            console.error("Error saving data to Firestore:", error);
        }
    }, 1500); // Debounce saves to every 1.5 seconds

    return () => clearTimeout(saveTimeout);
  }, [getCombinedState, uid, isDataLoading, lastSavedState]);
  
  const value = {
    simulatorData,
    setSimulatorData,
    expenseData,
    setExpenseData,
    couplesData,
    setCouplesData,
    loans,
    setLoans,
    isDataLoading
  };

  if (isDataLoading && isFirebaseConfigured) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Carregando seus dados...</p>
        </div>
    );
  }

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
