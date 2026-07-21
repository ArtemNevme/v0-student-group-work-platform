-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friends
CREATE POLICY "Users can view their own friendships"
  ON public.friends FOR SELECT
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON public.friends FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update friendships they're part of"
  ON public.friends FOR UPDATE
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can delete their own friendships"
  ON public.friends FOR DELETE
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);
