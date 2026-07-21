-- Safe migration for enhanced messages (handles existing objects)

-- Add new columns to messages table (IF NOT EXISTS is not supported, so we use DO block)
DO $$ 
BEGIN
  -- Add reply_to_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'reply_to_id') THEN
    ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
  
  -- Add is_edited column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_edited') THEN
    ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT false;
  END IF;
  
  -- Add is_deleted column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_deleted') THEN
    ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT false;
  END IF;
  
  -- Add attachment_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachment_url') THEN
    ALTER TABLE messages ADD COLUMN attachment_url TEXT;
  END IF;
  
  -- Add attachment_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachment_type') THEN
    ALTER TABLE messages ADD COLUMN attachment_type TEXT;
  END IF;
END $$;

-- Create message_reactions table if not exists
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create user_presence table if not exists
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT now(),
  is_online BOOLEAN DEFAULT false
);

-- Create pinned_messages table if not exists
CREATE TABLE IF NOT EXISTS pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pinned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id)
);

-- Enable RLS on new tables (safe to run multiple times)
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first, then recreate
DROP POLICY IF EXISTS "Users can view reactions in their groups" ON message_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON message_reactions;
DROP POLICY IF EXISTS "Users can remove their reactions" ON message_reactions;
DROP POLICY IF EXISTS "Users can view presence in their groups" ON user_presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON user_presence;
DROP POLICY IF EXISTS "Users can insert their own presence" ON user_presence;
DROP POLICY IF EXISTS "Users can view pinned messages in their groups" ON pinned_messages;
DROP POLICY IF EXISTS "Admins can pin messages" ON pinned_messages;
DROP POLICY IF EXISTS "Admins can unpin messages" ON pinned_messages;

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions in their groups" ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN group_members gm ON gm.group_id = m.group_id
      WHERE m.id = message_reactions.message_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add reactions" ON message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_presence
CREATE POLICY "Users can view presence in their groups" ON user_presence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = user_presence.group_id AND gm.user_id = auth.uid()
    )
    OR user_presence.user_id = auth.uid()
  );

CREATE POLICY "Users can update their own presence" ON user_presence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presence" ON user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pinned_messages
CREATE POLICY "Users can view pinned messages in their groups" ON pinned_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = pinned_messages.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can pin messages" ON pinned_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = pinned_messages.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'
    )
  );

CREATE POLICY "Admins can unpin messages" ON pinned_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = pinned_messages.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'
    )
  );

-- Create indexes for better performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_group_id ON user_presence(group_id);
CREATE INDEX IF NOT EXISTS idx_pinned_messages_group_id ON pinned_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id);

-- Enable realtime for new tables (safe to run multiple times)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
