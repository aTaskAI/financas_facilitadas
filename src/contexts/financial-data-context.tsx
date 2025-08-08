'use client';

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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
  setSimulatorData: (data: SimulatorData) => void;
  expenseData: ExpenseData;
  setExpenseData: (data: ExpenseData) => void;
  couplesData: CouplesData;
  setCouplesData: (data: CouplesData) => void;
  loans: Loan[];
  setLoans: (data: Loan[]) => void;
  isDataLoading: boolean;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

// --- Provider Component ---
export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [allData, setAllData] = useState<AllFinancialData>({
    simulatorData: cloneDeep(initialSimulatorData),
    expenseData: cloneDeep(initialExpenseData),
    couplesData: cloneDeep(initialCouplesData),
    loans: cloneDeep(initialLoans)
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Create a stable setData function with useCallback
  const setData = useCallback((newData: Partial<AllFinancialData>) => {
    setAllData(prevData => {
        const updatedData = { ...prevData, ...newData };
        // Simple deep comparison to avoid unnecessary state updates and saves
        if (!isEqual(prevData, updatedData)) {
            return updatedData;
        }
        return prevData;
    });
  }, []);

  // Effect to load data from Firestore when user logs in
  useEffect(() => {
    if (!uid || !isFirebaseConfigured) {
        // Reset to initial state if no user or firebase not configured
        setAllData({
            simulatorData: cloneDeep(initialSimulatorData),
            expenseData: cloneDeep(initialExpenseData),
            couplesData: cloneDeep(initialCouplesData),
            loans: cloneDeep(initialLoans)
        });
        setIsDataLoading(false);
        return;
    }

    setIsDataLoading(true);
    const docRef = doc(db, 'users', uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const firestoreData = docSnap.data() as AllFinancialData;
            // Merge with initial data to ensure all keys are present
             setAllData(prevData => {
                const updatedData = {
                    simulatorData: { ...initialSimulatorData, ...firestoreData.simulatorData },
                    expenseData: { ...initialExpenseData, ...firestoreData.expenseData },
                    couplesData: { ...initialCouplesData, ...firestoreData.couplesData },
                    loans: firestoreData.loans || [],
                };
                 // Only update state if data is different to prevent loops
                if (!isEqual(prevData, updatedData)) {
                    return updatedData;
                }
                return prevData;
            });
        } else {
            // No document yet, use initial data
             setAllData({
                simulatorData: cloneDeep(initialSimulatorData),
                expenseData: cloneDeep(initialExpenseData),
                couplesData: cloneDeep(initialCouplesData),
                loans: cloneDeep(initialLoans)
            });
        }
        setIsDataLoading(false);
    }, (error) => {
        console.error("Error listening to Firestore:", error);
        setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  // Effect to save data to Firestore when it changes
  useEffect(() => {
    if (!uid || !isFirebaseConfigured || isDataLoading || isSaving) {
        return;
    }

    const saveData = async () => {
        setIsSaving(true);
        try {
            const docRef = doc(db, 'users', uid);
            // We need to convert custom objects to plain objects for Firestore
            const dataToSave = JSON.parse(JSON.stringify(allData));
            await setDoc(docRef, dataToSave, { merge: true });
        } catch (error) {
            console.error("Error saving data to Firestore:", error);
        } finally {
             // Use a short timeout to prevent rapid-fire saves
            setTimeout(() => setIsSaving(false), 500);
        }
    };
    
    saveData();
  }, [allData, uid, isDataLoading, isSaving]);
  
  const value = {
    simulatorData: allData.simulatorData,
    setSimulatorData: (data: SimulatorData) => setData({ simulatorData: data }),
    expenseData: allData.expenseData,
    setExpenseData: (data: ExpenseData) => setData({ expenseData: data }),
    couplesData: allData.couplesData,
    setCouplesData: (data: CouplesData) => setData({ couplesData: data }),
    loans: allData.loans,
    setLoans: (data: Loan[]) => setData({ loans: data }),
    isDataLoading
  };

  if (isDataLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Carregando dados do usuário...</p>
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
