import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Person, Expense } from '@/types/expense';
import { useToast } from './use-toast';

const GROUP_ID = '550e8400-e29b-41d4-a716-446655440000';

export function useJapanTripData() {
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', GROUP_ID)
        .order('created_at');

      if (membersError) throw membersError;

      const peopleData = membersData.map(member => ({
        id: member.id,
        name: member.name,
        color: member.color,
      }));
      setPeople(peopleData);

      // Load expenses with splits
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_splits (
            member_id,
            amount
          )
        `)
        .eq('group_id', GROUP_ID)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      const expensesFormatted = expensesData.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: Number(expense.amount),
        paidBy: expense.paid_by,
        splitBetween: expense.expense_splits?.map(split => split.member_id) || [],
        category: expense.category || '',
        date: expense.date || new Date().toISOString(),
      }));

      setExpenses(expensesFormatted);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się załadować danych',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      // Add expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id: GROUP_ID,
          description: expense.description,
          amount: expense.amount,
          paid_by: expense.paidBy,
          category: expense.category,
          date: expense.date,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Add expense splits
      const sharePerPerson = expense.amount / expense.splitBetween.length;
      const splits = expense.splitBetween.map(memberId => ({
        expense_id: expenseData.id,
        member_id: memberId,
        amount: sharePerPerson,
      }));

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splits);

      if (splitsError) throw splitsError;

      // Update local state
      const newExpense: Expense = {
        id: expenseData.id,
        description: expense.description,
        amount: expense.amount,
        paidBy: expense.paidBy,
        splitBetween: expense.splitBetween,
        category: expense.category,
        date: expense.date,
      };

      setExpenses(prev => [newExpense, ...prev]);

      toast({
        title: "Wydatek dodany!",
        description: `${expense.description} - ${expense.amount.toLocaleString('pl-PL')} ¥`,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się dodać wydatku',
        variant: 'destructive',
      });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenses(prev => prev.filter(exp => exp.id !== id));

      toast({
        title: "Wydatek usunięty",
        description: "Wydatek został pomyślnie usunięty",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć wydatku',
        variant: 'destructive',
      });
    }
  };

  return {
    people,
    expenses,
    loading,
    addExpense,
    deleteExpense,
    refreshData: loadData,
  };
}