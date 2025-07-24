-- Drop all existing RLS policies since we disabled RLS
DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.expense_groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.expense_groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.expense_groups;
DROP POLICY IF EXISTS "Users can view their groups and shared groups" ON public.expense_groups;

DROP POLICY IF EXISTS "Group members can manage splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Users can view splits in their groups" ON public.expense_splits;

DROP POLICY IF EXISTS "Expense creators and group owners can delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "Expense creators and group owners can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Group members can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view expenses in their groups" ON public.expenses;

DROP POLICY IF EXISTS "Group creators can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;