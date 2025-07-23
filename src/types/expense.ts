export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
  category?: string;
}

export interface Balance {
  personId: string;
  balance: number; // positive = is owed money, negative = owes money
  totalPaid: number;
  totalOwed: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}