import { useState, useEffect } from 'react';
import { Person, Expense } from '@/types/expense';
import { useToast } from './use-toast';

// Hardcoded users for the Japan trip
const JAPAN_TRIP_USERS: Person[] = [
  { id: '1', name: 'Monika', color: '#FF6B6B' },
  { id: '2', name: 'Jędrzej', color: '#4ECDC4' },
  { id: '3', name: 'Karolina', color: '#45B7D1' },
  { id: '4', name: 'Filip', color: '#FFA07A' },
];

const STORAGE_KEY = 'japanTripExpenses';

export function useSharedData() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setExpenses(parsed);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to localStorage whenever expenses change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, loading]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    setExpenses(prev => [...prev, newExpense]);
    
    toast({
      title: "Wydatek dodany!",
      description: `${expense.description} - ${expense.amount.toLocaleString('pl-PL')} ¥`,
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    
    toast({
      title: "Wydatek usunięty",
      description: "Wydatek został pomyślnie usunięty",
      variant: "destructive",
    });
  };

  return {
    people: JAPAN_TRIP_USERS,
    expenses,
    loading,
    addExpense,
    deleteExpense,
  };
}