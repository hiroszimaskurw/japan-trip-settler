-- Create a shared expense group for Japan trip and hardcoded members
INSERT INTO public.expense_groups (id, name, description, currency, share_code) 
VALUES ('japan-trip-2024', 'Rozliczenia Japońskie', 'Wyjazd do Japonii', 'JPY', 'japan2024')
ON CONFLICT (id) DO NOTHING;

-- Insert hardcoded members for the Japan trip
INSERT INTO public.group_members (id, group_id, name, color) VALUES 
('member-monika', 'japan-trip-2024', 'Monika', '#FF6B6B'),
('member-jedrzej', 'japan-trip-2024', 'Jędrzej', '#4ECDC4'),
('member-karolina', 'japan-trip-2024', 'Karolina', '#45B7D1'),
('member-filip', 'japan-trip-2024', 'Filip', '#FFA07A')
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for public access (since we're using password protection)
ALTER TABLE public.expense_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits DISABLE ROW LEVEL SECURITY;