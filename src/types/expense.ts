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

// Nowe typy dla Supabase
export interface DatabaseExpense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  category: string;
  date: string;
  created_by: string | null;
  created_at: string;
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
  created_at: string;
}

// Funkcje konwersji
export function convertDatabaseExpenseToExpense(dbExpense: DatabaseExpense): Expense {
  return {
    id: dbExpense.id,
    description: dbExpense.description,
    amount: dbExpense.amount,
    paidBy: dbExpense.paid_by,
    splitBetween: dbExpense.splits.map(split => split.member_id),
    date: dbExpense.date,
    category: dbExpense.category,
  };
}