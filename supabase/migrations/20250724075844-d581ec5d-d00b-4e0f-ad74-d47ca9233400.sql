-- Create a shared expense group for Japan trip and hardcoded members
INSERT INTO public.expense_groups (id, name, description, currency, share_code) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Rozliczenia Japońskie', 'Wyjazd do Japonii', 'JPY', 'japan2024')
ON CONFLICT (id) DO NOTHING;

-- Insert hardcoded members for the Japan trip
INSERT INTO public.group_members (id, group_id, name, color) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Monika', '#FF6B6B'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Jędrzej', '#4ECDC4'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Karolina', '#45B7D1'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Filip', '#FFA07A')
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for public access (since we're using password protection)
ALTER TABLE public.expense_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits DISABLE ROW LEVEL SECURITY;