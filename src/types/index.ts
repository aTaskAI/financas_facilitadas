export interface SimulatorData {
  preco: number;
  entradaPct: number;
  parcelas: number;
  taxaAnual: number;
  nomeA: string;
  rendaA: number;
  gastosA: number;
  nomeB: string;
  rendaB: number;
  gastosB: number;
  amortizacao: number;
  parcelasPagas: { [key: number]: boolean };
}

export interface ExpenseItem {
  id: number;
  nome: string;
  valor: number;
}

export interface MonthData {
  receitas: ExpenseItem[];
  essenciais: ExpenseItem[];
  naoEssenciais: ExpenseItem[];
}

export interface YearData {
  [month: number]: MonthData;
}

export interface PersonData {
  [year: number]: YearData;
}

export interface SubTab {
  nome: string;
  data: {
    [year: number]: {
      receitas: { [month: number]: ExpenseItem[] };
      essenciais: { [month: number]: ExpenseItem[] };
      naoEssenciais: { [month: number]: ExpenseItem[] };
    };
  };
}

export interface ExpenseData {
  subTabs: {
    [id: string]: SubTab;
  };
  currentSubTabId: string;
  year: number;
  month: number;
}

export interface CoupleAccount {
  id: number;
  descricao: string;
  valor: number;
}

export interface CoupleMonthData {
  rendaA: number;
  rendaB: number;
  poupancaA: number;
  poupancaB: number;
  contas: CoupleAccount[];
  nomeA: string;
  nomeB: string;
}

export interface CouplesData {
  year: number;
  month: number;
  yearData: {
    [year: number]: {
      [month: number]: CoupleMonthData;
    }
  };
}


export interface Payment {
  numero: number;
  valor: number;
  pago: boolean;
}

export interface Loan {
  id: number;
  nome: string;
  valorTotal: number;
  parcelas: number;
  pagamentos: Payment[];
}
