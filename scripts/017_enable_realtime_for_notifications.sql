-- Enable real-time for notifications table
-- This allows Supabase Realtime to listen for changes

-- Enable replication for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions for realtime
GRANT SELECT ON public.notifications TO authenticated;
GRANT INSERT ON public.notifications TO authenticated;
GRANT UPDATE ON public.notifications TO authenticated;

-- Verify the table is set up for realtime
-- Users should see their own notifications in real-time
