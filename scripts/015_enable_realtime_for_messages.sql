-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Ensure RLS policies allow SELECT for real-time subscriptions
-- (The existing policies should already allow this, but let's verify)

-- Grant necessary permissions for realtime
GRANT SELECT ON public.messages TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
