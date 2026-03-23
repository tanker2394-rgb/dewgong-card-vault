-- Delete all existing cards (fresh start for per-user tracking)
DELETE FROM public.cards;

-- Add user_id column linked to Supabase auth
ALTER TABLE public.cards
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON public.cards (user_id);

-- Drop the old open policy
DROP POLICY IF EXISTS "Allow all" ON public.cards;

-- New per-user RLS policies
CREATE POLICY "Users can view own cards" ON public.cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.cards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.cards
  FOR DELETE USING (auth.uid() = user_id);
