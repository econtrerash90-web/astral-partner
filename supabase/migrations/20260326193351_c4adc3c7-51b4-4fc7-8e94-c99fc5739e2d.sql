
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS mood text DEFAULT null,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
