# StudySync - Database Schema

## Overview

PostgreSQL 15 database hosted on Supabase with Row Level Security (RLS) enabled on all tables.

## Schema Diagram

\`\`\`
profiles (users) ──┬──> subjects
                   │
                   ├──> groups ──> group_members
                   │       │
                   │       └──> messages ──> message_reactions
                   │                   └──> pinned_messages
                   │
                   ├──> assignments ──┬──> tasks ──> task_assignments
                   │                  │
                   │                  ├──> assignment_files
                   │                  │
                   │                  └──> assignment_links
                   │
                   ├──> friends
                   │
                   ├──> notifications
                   │
                   ├──> google_classroom_connections
                   │
                   ├──> student_submissions
                   │
                   ├──> ai_chat_messages
                   │
                   ├──> ai_usage
                   │
                   └──> user_achievements ──> achievements

subjects ──> course_materials
         └──> assignments
\`\`\`

## Tables

### Core Tables

#### profiles
User profiles and gamification data

\`\`\`sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  major text,
  year text,
  
  -- Gamification
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `profiles_pkey` on (id)
- `profiles_email_key` on (email)

**RLS Policies**:
- SELECT: Public (все могут видеть профили)
- UPDATE: Own profile only
- INSERT: Automatic via trigger on auth.users

---

#### subjects
Academic subjects/courses

\`\`\`sql
CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  
  -- Google Classroom integration
  google_course_id text UNIQUE,
  teacher_name text,
  section text,
  alternate_link text,
  enrollment_code text,
  course_state text,
  
  -- UI customization
  icon text, -- emoji or icon name
  color text,
  
  -- Sync status
  is_synced boolean DEFAULT false,
  last_synced_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `subjects_pkey` on (id)
- `subjects_user_id_idx` on (user_id)
- `subjects_google_course_id_key` on (google_course_id)

**RLS Policies**:
- SELECT: Own subjects only
- INSERT: Own subjects only
- UPDATE: Own subjects only
- DELETE: Own subjects only

---

#### groups
Study teams for collaboration

\`\`\`sql
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  
  invite_code text UNIQUE NOT NULL DEFAULT nanoid(),
  category text,
  
  member_count integer DEFAULT 1,
  max_members integer DEFAULT 10,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `groups_pkey` on (id)
- `groups_created_by_idx` on (created_by)
- `groups_subject_id_idx` on (subject_id)
- `groups_invite_code_key` on (invite_code)

**RLS Policies**:
- SELECT: Member of group
- INSERT: Authenticated users
- UPDATE: Admin of group
- DELETE: Creator only

---

#### group_members
Group membership

\`\`\`sql
CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  
  UNIQUE(group_id, user_id)
);
\`\`\`

**Indexes**:
- `group_members_pkey` on (id)
- `group_members_group_id_idx` on (group_id)
- `group_members_user_id_idx` on (user_id)
- `group_members_group_id_user_id_key` on (group_id, user_id)

**RLS Policies**:
- SELECT: Member of group
- INSERT: Invited or joined via code
- DELETE: Self or admin

---

#### assignments
Academic assignments/homework

\`\`\`sql
CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  deadline timestamptz,
  
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'turned_in', 'returned', 'reclaimed_by_student')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  estimated_hours integer,
  
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  group_id uuid REFERENCES groups(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Google Classroom integration
  imported_from_google_id text,
  google_classroom_link text,
  work_link text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `assignments_pkey` on (id)
- `assignments_created_by_idx` on (created_by)
- `assignments_group_id_idx` on (group_id)
- `assignments_subject_id_idx` on (subject_id)
- `assignments_deadline_idx` on (deadline)

**RLS Policies**:
- SELECT: Creator or group member
- INSERT: Authenticated users
- UPDATE: Creator or group admin
- DELETE: Creator only

---

#### tasks
Sub-tasks of assignments

\`\`\`sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  order_index integer DEFAULT 0,
  estimated_hours numeric,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `tasks_pkey` on (id)
- `tasks_assignment_id_idx` on (assignment_id)
- `tasks_assignment_id_order_index_idx` on (assignment_id, order_index)

**RLS Policies**:
- SELECT: Assignment access
- INSERT: Assignment creator or group admin
- UPDATE: Assignment creator or group admin
- DELETE: Assignment creator or group admin

---

#### task_assignments
Task assignment to group members

\`\`\`sql
CREATE TABLE task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(task_id, user_id)
);
\`\`\`

**Indexes**:
- `task_assignments_pkey` on (id)
- `task_assignments_task_id_idx` on (task_id)
- `task_assignments_user_id_idx` on (user_id)

**RLS Policies**:
- SELECT: Task access
- INSERT: Group admin
- UPDATE: Assignee or admin
- DELETE: Admin only

---

### Content Tables

#### course_materials
Learning materials from Google Classroom

\`\`\`sql
CREATE TABLE course_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  title text NOT NULL,
  description text,
  material_type text CHECK (material_type IN ('link', 'video', 'file', 'form', 'assignment')),
  
  -- Material content
  url text,
  drive_file_id text,
  drive_file_title text,
  youtube_video_id text,
  form_url text,
  
  -- Google Classroom reference
  google_material_id text UNIQUE,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `course_materials_pkey` on (id)
- `course_materials_subject_id_idx` on (subject_id)
- `course_materials_google_material_id_key` on (google_material_id)

**RLS Policies**:
- SELECT: Subject owner
- INSERT: Subject owner
- UPDATE: Subject owner
- DELETE: Subject owner

---

#### assignment_files
Files attached to assignments

\`\`\`sql
CREATE TABLE assignment_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `assignment_files_pkey` on (id)
- `assignment_files_assignment_id_idx` on (assignment_id)

**RLS Policies**:
- SELECT: Assignment access
- INSERT: Assignment creator or group member
- DELETE: Uploader or admin

---

#### assignment_links
Useful links for assignments

\`\`\`sql
CREATE TABLE assignment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('documentation', 'tutorial', 'research', 'tool', 'other')),
  added_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `assignment_links_pkey` on (id)
- `assignment_links_assignment_id_idx` on (assignment_id)

**RLS Policies**:
- SELECT: Assignment access
- INSERT: Assignment creator or group member
- UPDATE: Link creator or admin
- DELETE: Link creator or admin

---

### Communication Tables

#### messages
Group chat messages

\`\`\`sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  assignment_id uuid REFERENCES assignments(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  content text NOT NULL,
  attachment_url text,
  attachment_type text,
  
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  is_edited boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `messages_pkey` on (id)
- `messages_group_id_idx` on (group_id)
- `messages_created_at_idx` on (created_at)

**RLS Policies**:
- SELECT: Group member
- INSERT: Group member
- DELETE: Message author or admin

---

#### message_reactions
Emoji reactions to messages

\`\`\`sql
CREATE TABLE message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(message_id, user_id, emoji)
);
\`\`\`

**Indexes**:
- `message_reactions_pkey` on (id)
- `message_reactions_message_id_idx` on (message_id)

**RLS Policies**:
- SELECT: Group member
- INSERT: Group member
- DELETE: Reaction creator

---

#### pinned_messages
Pinned messages in groups

\`\`\`sql
CREATE TABLE pinned_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  pinned_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pinned_at timestamptz DEFAULT now(),
  
  UNIQUE(group_id, message_id)
);
\`\`\`

**Indexes**:
- `pinned_messages_pkey` on (id)
- `pinned_messages_group_id_idx` on (group_id)

**RLS Policies**:
- SELECT: Group member
- INSERT: Group admin
- DELETE: Group admin

---

### System Tables

#### notifications
User notifications

\`\`\`sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `notifications_pkey` on (id)
- `notifications_user_id_idx` on (user_id)
- `notifications_created_at_idx` on (created_at)

**RLS Policies**:
- SELECT: Own notifications
- INSERT: System or other users
- UPDATE: Own notifications
- DELETE: Own notifications

---

#### invitations
Group invitations

\`\`\`sql
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE NOT NULL DEFAULT nanoid(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `invitations_pkey` on (id)
- `invitations_group_id_idx` on (group_id)
- `invitations_invite_code_key` on (invite_code)

**RLS Policies**:
- SELECT: Group member or invitee
- INSERT: Group admin
- UPDATE: Invitee or admin
- DELETE: Admin only

---

#### friends
Friend relationships

\`\`\`sql
CREATE TABLE friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);
\`\`\`

**Indexes**:
- `friends_pkey` on (id)
- `friends_user_id_idx` on (user_id)
- `friends_friend_id_idx` on (friend_id)

**RLS Policies**:
- SELECT: Involved users
- INSERT: Own friendships
- UPDATE: Involved users
- DELETE: Own friendships

---

### Gamification Tables

#### achievements
Available achievements

\`\`\`sql
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  points_required integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `achievements_pkey` on (id)

**RLS Policies**:
- SELECT: Public

---

#### user_achievements
User-earned achievements

\`\`\`sql
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, achievement_id)
);
\`\`\`

**Indexes**:
- `user_achievements_pkey` on (id)
- `user_achievements_user_id_idx` on (user_id)

**RLS Policies**:
- SELECT: Public
- INSERT: System only

---

### Integration Tables

#### google_classroom_connections
Google Classroom OAuth connections

\`\`\`sql
CREATE TABLE google_classroom_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  scopes text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  is_valid boolean DEFAULT true,
  last_synced_at timestamptz,
  connected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `google_classroom_connections_pkey` on (id)
- `google_classroom_connections_user_id_key` on (user_id)

**RLS Policies**:
- SELECT: Own connection
- INSERT: Own connection
- UPDATE: Own connection
- DELETE: Own connection

---

#### student_submissions
Google Classroom submissions

\`\`\`sql
CREATE TABLE student_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assignment_id uuid REFERENCES assignments(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  
  google_submission_id text UNIQUE,
  google_coursework_id text,
  google_course_id text,
  
  state text CHECK (state IN ('NEW', 'CREATED', 'TURNED_IN', 'RETURNED', 'RECLAIMED_BY_STUDENT')),
  late boolean DEFAULT false,
  
  draft_grade numeric,
  assigned_grade numeric,
  max_points numeric,
  
  turned_in_at timestamptz,
  returned_at timestamptz,
  creation_time timestamptz,
  update_time timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `student_submissions_pkey` on (id)
- `student_submissions_user_id_idx` on (user_id)
- `student_submissions_google_submission_id_key` on (google_submission_id)

**RLS Policies**:
- SELECT: Own submissions
- INSERT: Own submissions
- UPDATE: Own submissions
- DELETE: Own submissions

---

### AI Tables

#### ai_chat_messages
AI assistant chat history

\`\`\`sql
CREATE TABLE ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  model text,
  tokens_used integer,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `ai_chat_messages_pkey` on (id)
- `ai_chat_messages_user_id_idx` on (user_id)
- `ai_chat_messages_created_at_idx` on (created_at)

**RLS Policies**:
- SELECT: Own messages
- INSERT: Own messages
- DELETE: Own messages

---

#### ai_usage
AI usage statistics

\`\`\`sql
CREATE TABLE ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  messages_count integer DEFAULT 0,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, date)
);
\`\`\`

**Indexes**:
- `ai_usage_pkey` on (id)
- `ai_usage_user_id_date_key` on (user_id, date)

**RLS Policies**:
- SELECT: Own usage
- INSERT: Own usage
- UPDATE: Own usage

---

#### user_presence
Realtime user presence

\`\`\`sql
CREATE TABLE user_presence (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  is_online boolean DEFAULT false,
  is_typing boolean DEFAULT false,
  last_seen timestamptz DEFAULT now()
);
\`\`\`

**Indexes**:
- `user_presence_pkey` on (user_id)
- `user_presence_group_id_idx` on (group_id)

**RLS Policies**:
- SELECT: Group member
- INSERT: Own presence
- UPDATE: Own presence

---

## Triggers

### 1. Create profile on user signup

\`\`\`sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`\`\`

### 2. Update group member count

\`\`\`sql
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups
    SET member_count = member_count + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups
    SET member_count = member_count - 1
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_group_member_change
  AFTER INSERT OR DELETE ON group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_member_count();
\`\`\`

### 3. Update updated_at timestamp

\`\`\`sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... repeat for other tables
\`\`\`

---

## Indexes Summary

**Performance critical indexes**:
- All foreign keys have indexes
- `created_at` indexes for chronological queries
- `deadline` index for upcoming deadlines
- Unique indexes on invite codes and google IDs
- Composite indexes on (group_id, user_id) and (assignment_id, order_index)

---

## RLS Summary

**Access patterns**:
- Own data: Users see only their own profiles, assignments, notifications
- Group data: Users see data in groups they're members of
- Public data: Achievements and public profiles are visible to all
- Admin data: Group admins have additional permissions

---

**Last updated**: December 3, 2024
