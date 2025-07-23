/*
  # Tworzenie tabel dla kalkulatora rozliczeń

  1. Nowe tabele
    - `expense_groups` - grupy rozliczeń (np. "Wyjazd do Japonii")
    - `group_members` - członkowie grup z kolorami
    - `expenses` - wydatki w grupach
    - `expense_splits` - podział wydatków między członków

  2. Bezpieczeństwo
    - Włączenie RLS na wszystkich tabelach
    - Polityki dostępu dla właścicieli grup i członków
*/

-- Tabela grup rozliczeń
CREATE TABLE IF NOT EXISTS expense_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Nowa grupa',
  description text DEFAULT '',
  currency text NOT NULL DEFAULT 'JPY',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  share_code text UNIQUE DEFAULT encode(gen_random_bytes(8), 'base64url')
);

-- Tabela członków grup
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES expense_groups(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#FF6B6B',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela wydatków
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES expense_groups(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  paid_by uuid REFERENCES group_members(id) ON DELETE CASCADE NOT NULL,
  category text DEFAULT '',
  date timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela podziału wydatków
CREATE TABLE IF NOT EXISTS expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES group_members(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(expense_id, member_id)
);

-- Włączenie RLS
ALTER TABLE expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

-- Polityki dla expense_groups
CREATE POLICY "Users can create groups"
  ON expense_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their groups and shared groups"
  ON expense_groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can update their groups"
  ON expense_groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can delete their groups"
  ON expense_groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Polityki dla group_members
CREATE POLICY "Users can view members of their groups"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM expense_groups 
      WHERE created_by = auth.uid() OR
      id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Group creators can manage members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM expense_groups 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM expense_groups 
      WHERE created_by = auth.uid()
    )
  );

-- Polityki dla expenses
CREATE POLICY "Users can view expenses in their groups"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM expense_groups 
      WHERE created_by = auth.uid() OR
      id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Group members can create expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id FROM expense_groups 
      WHERE created_by = auth.uid() OR
      id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Expense creators and group owners can update expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    group_id IN (SELECT id FROM expense_groups WHERE created_by = auth.uid())
  )
  WITH CHECK (
    created_by = auth.uid() OR
    group_id IN (SELECT id FROM expense_groups WHERE created_by = auth.uid())
  );

CREATE POLICY "Expense creators and group owners can delete expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    group_id IN (SELECT id FROM expense_groups WHERE created_by = auth.uid())
  );

-- Polityki dla expense_splits
CREATE POLICY "Users can view splits in their groups"
  ON expense_splits
  FOR SELECT
  TO authenticated
  USING (
    expense_id IN (
      SELECT id FROM expenses 
      WHERE group_id IN (
        SELECT id FROM expense_groups 
        WHERE created_by = auth.uid() OR
        id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Group members can manage splits"
  ON expense_splits
  FOR ALL
  TO authenticated
  USING (
    expense_id IN (
      SELECT id FROM expenses 
      WHERE group_id IN (
        SELECT id FROM expense_groups 
        WHERE created_by = auth.uid() OR
        id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    expense_id IN (
      SELECT id FROM expenses 
      WHERE group_id IN (
        SELECT id FROM expense_groups 
        WHERE created_by = auth.uid() OR
        id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
      )
    )
  );

-- Funkcje pomocnicze
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expense_groups_updated_at 
  BEFORE UPDATE ON expense_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_expense_groups_created_by ON expense_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_expense_groups_share_code ON expense_groups(share_code);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_member_id ON expense_splits(member_id);