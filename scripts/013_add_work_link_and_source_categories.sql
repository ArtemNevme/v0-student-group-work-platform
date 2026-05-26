-- Add work_link field to assignments table
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS work_link text;

-- Add category field to assignment_links for source types
ALTER TABLE public.assignment_links
ADD COLUMN IF NOT EXISTS category text CHECK (category IN ('news', 'book', 'scientific', 'video', 'other', 'ai_recommended'));

-- Add comment to explain the category field
COMMENT ON COLUMN public.assignment_links.category IS 'Type of source: news, book, scientific, video, other, or ai_recommended for AI-generated recommendations';
