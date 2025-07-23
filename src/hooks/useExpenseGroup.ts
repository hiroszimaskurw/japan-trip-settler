import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ExpenseGroup {
  id: string;
  name: string;
  description: string;
  currency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  share_code: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  name: string;
  color: string;
  user_id: string | null;
  created_at: string;
}

export interface GroupExpense {
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

export function useExpenseGroup(groupId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<ExpenseGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Tworzenie nowej grupy
  const createGroup = async (name: string, description: string = '') => {
    if (!user) throw new Error('Musisz być zalogowany');

    const { data, error } = await supabase
      .from('expense_groups')
      .insert({
        name,
        description,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Dołączanie do grupy przez kod
  const joinGroupByCode = async (shareCode: string, memberName: string, memberColor: string = '#FF6B6B') => {
    // Znajdź grupę po kodzie
    const { data: groupData, error: groupError } = await supabase
      .from('expense_groups')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    if (groupError) throw new Error('Nie znaleziono grupy o podanym kodzie');

    // Dodaj członka do grupy
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        name: memberName,
        color: memberColor,
        user_id: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return { group: groupData, member: data };
  };

  // Dodawanie członka do grupy
  const addMember = async (name: string, color: string = '#FF6B6B') => {
    if (!group) throw new Error('Brak aktywnej grupy');

    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        name,
        color,
        user_id: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    setMembers(prev => [...prev, data]);
    return data;
  };

  // Dodawanie wydatku
  const addExpense = async (
    description: string,
    amount: number,
    paidBy: string,
    splitBetween: string[],
    category: string = '',
    date: string = new Date().toISOString()
  ) => {
    if (!group) throw new Error('Brak aktywnej grupy');

    // Dodaj wydatek
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: group.id,
        description,
        amount,
        paid_by: paidBy,
        category,
        date,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Dodaj podziały
    const sharePerPerson = amount / splitBetween.length;
    const splits = splitBetween.map(memberId => ({
      expense_id: expenseData.id,
      member_id: memberId,
      amount: sharePerPerson,
    }));

    const { data: splitsData, error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splits)
      .select();

    if (splitsError) throw splitsError;

    const newExpense: GroupExpense = {
      ...expenseData,
      splits: splitsData,
    };

    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  };

  // Usuwanie wydatku
  const deleteExpense = async (expenseId: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  };

  // Ładowanie danych grupy
  const loadGroup = async (id: string) => {
    setLoading(true);
    try {
      // Załaduj grupę
      const { data: groupData, error: groupError } = await supabase
        .from('expense_groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Załaduj członków
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', id)
        .order('created_at');

      if (membersError) throw membersError;
      setMembers(membersData);

      // Załaduj wydatki z podziałami
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_splits (*)
        `)
        .eq('group_id', id)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;
      
      const expensesWithSplits = expensesData.map(expense => ({
        ...expense,
        splits: expense.expense_splits || [],
      }));
      
      setExpenses(expensesWithSplits);
    } catch (error) {
      console.error('Błąd ładowania grupy:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się załadować danych grupy',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Ładuj grupę gdy zmieni się ID
  useEffect(() => {
    if (groupId) {
      loadGroup(groupId);
    } else {
      setLoading(false);
    }
  }, [groupId]);

  return {
    group,
    members,
    expenses,
    loading,
    createGroup,
    joinGroupByCode,
    addMember,
    addExpense,
    deleteExpense,
    loadGroup,
  };
}