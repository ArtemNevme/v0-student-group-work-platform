-- Canonical collaboration access policies.
--
-- Previous emergency RLS scripts deliberately used `USING (true)` to work
-- around recursion. They make every authenticated user a tenant-wide admin.
-- This migration replaces those policies with non-recursive SECURITY DEFINER
-- helpers and restrictive policies. Apply it once, after migration 041.

CREATE OR REPLACE FUNCTION public.check_group_membership(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_group_admin(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_user_id AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_assignment_access(p_assignment_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.assignments assignment_row
    WHERE assignment_row.id = p_assignment_id
      AND (
        assignment_row.created_by = p_user_id
        OR (
          assignment_row.group_id IS NOT NULL
          AND public.check_group_membership(assignment_row.group_id, p_user_id)
        )
      )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_task_access(p_task_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignment_id uuid;
BEGIN
  SELECT assignment_id INTO v_assignment_id FROM public.tasks WHERE id = p_task_id;
  RETURN v_assignment_id IS NOT NULL AND public.check_assignment_access(v_assignment_id, p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_task_assignee(p_task_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.tasks task_row
    JOIN public.assignments assignment_row ON assignment_row.id = task_row.assignment_id
    WHERE task_row.id = p_task_id
      AND (
        (assignment_row.group_id IS NOT NULL AND public.check_group_membership(assignment_row.group_id, p_user_id))
        OR (assignment_row.group_id IS NULL AND assignment_row.created_by = p_user_id)
      )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_group_membership(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_group_admin(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_assignment_access(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_task_access(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_task_assignee(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_group_membership(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_assignment_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_task_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_task_assignee(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.consume_ai_quota()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.ai_usage (user_id, date, messages_count, tokens_used)
  VALUES (auth.uid(), current_date, 1, 0)
  ON CONFLICT (user_id, date) DO UPDATE
    SET messages_count = public.ai_usage.messages_count + 1,
        updated_at = now()
    WHERE public.ai_usage.messages_count < 25
  RETURNING true INTO v_allowed;

  RETURN coalesce(v_allowed, false);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_quota() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota() TO authenticated;

CREATE OR REPLACE FUNCTION public.can_notify_user(p_recipient_id uuid, p_sender_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN p_recipient_id = p_sender_id
    OR EXISTS (
      SELECT 1 FROM public.friends
      WHERE status = 'accepted'
        AND (
          (user_id = p_sender_id AND friend_id = p_recipient_id)
          OR (user_id = p_recipient_id AND friend_id = p_sender_id)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.group_members sender_membership
      JOIN public.group_members recipient_membership
        ON recipient_membership.group_id = sender_membership.group_id
      WHERE sender_membership.user_id = p_sender_id
        AND recipient_membership.user_id = p_recipient_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.invitations
      JOIN public.profiles ON profiles.email = invitations.invited_email
      WHERE invitations.invited_by = p_sender_id
        AND invitations.status = 'pending'
        AND invitations.expires_at > now()
        AND profiles.id = p_recipient_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.can_notify_user(p_user_id, auth.uid()) THEN
    RAISE EXCEPTION 'not authorized to create this notification';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, left(p_title, 160), left(p_message, 1000), p_link)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

REVOKE ALL ON FUNCTION public.can_notify_user(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) TO authenticated;

DO $$
DECLARE
  target_table text;
  policy_record record;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'groups', 'group_members', 'invitations', 'assignments', 'tasks',
    'task_assignments', 'assignment_files', 'assignment_links', 'messages', 'notifications',
    'message_reactions', 'user_presence', 'pinned_messages', 'friends'
  ]
  LOOP
    FOR policy_record IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = target_table
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, target_table);
    END LOOP;
  END LOOP;
END;
$$;

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Migration 023 called this column `current_group_id`, while the later safe
-- migration used `group_id`. Keep one canonical column before defining RLS.
ALTER TABLE public.user_presence
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_presence' AND column_name = 'current_group_id'
  ) THEN
    UPDATE public.user_presence SET group_id = current_group_id WHERE group_id IS NULL;
  END IF;
END;
$$;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('message', 'mention', 'task', 'deadline', 'invitation', 'achievement', 'friend_request', 'group_added'));

CREATE POLICY "groups_select_member_or_owner" ON public.groups
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.check_group_membership(id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.invitations
      WHERE invitations.group_id = groups.id
        AND lower(invitations.invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
CREATE POLICY "groups_insert_creator" ON public.groups
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "groups_update_admin" ON public.groups
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.check_group_admin(id, auth.uid()))
  WITH CHECK (created_by = auth.uid() OR public.check_group_admin(id, auth.uid()));
CREATE POLICY "groups_delete_owner" ON public.groups
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "group_members_select_members" ON public.group_members
  FOR SELECT TO authenticated
  USING (public.check_group_membership(group_id, auth.uid()));
CREATE POLICY "group_members_insert_admin_or_invitee" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    public.check_group_admin(group_id, auth.uid())
    OR (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.groups
        WHERE groups.id = group_id AND groups.created_by = auth.uid()
      )
    )
    OR (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.invitations
        WHERE invitations.group_id = group_members.group_id
          AND invitations.status = 'pending'
          AND invitations.expires_at > now()
          AND lower(invitations.invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    )
  );
CREATE POLICY "group_members_update_admin" ON public.group_members
  FOR UPDATE TO authenticated
  USING (public.check_group_admin(group_id, auth.uid()))
  WITH CHECK (public.check_group_admin(group_id, auth.uid()));
CREATE POLICY "group_members_delete_self_or_admin" ON public.group_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.check_group_admin(group_id, auth.uid()));

CREATE POLICY "invitations_select_admin_or_invitee" ON public.invitations
  FOR SELECT TO authenticated
  USING (
    public.check_group_admin(group_id, auth.uid())
    OR lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
CREATE POLICY "invitations_insert_admin" ON public.invitations
  FOR INSERT TO authenticated
  WITH CHECK (invited_by = auth.uid() AND public.check_group_admin(group_id, auth.uid()));
CREATE POLICY "invitations_update_admin_or_invitee" ON public.invitations
  FOR UPDATE TO authenticated
  USING (
    public.check_group_admin(group_id, auth.uid())
    OR lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  WITH CHECK (
    public.check_group_admin(group_id, auth.uid())
    OR (
      lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND status = 'accepted'
    )
  );
CREATE POLICY "invitations_delete_admin" ON public.invitations
  FOR DELETE TO authenticated
  USING (public.check_group_admin(group_id, auth.uid()));

CREATE POLICY "assignments_select_access" ON public.assignments
  FOR SELECT TO authenticated
  USING (public.check_assignment_access(id, auth.uid()));
CREATE POLICY "assignments_insert_owner_and_member" ON public.assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (group_id IS NULL OR public.check_group_membership(group_id, auth.uid()))
  );
CREATE POLICY "assignments_update_access" ON public.assignments
  FOR UPDATE TO authenticated
  USING (public.check_assignment_access(id, auth.uid()))
  WITH CHECK (group_id IS NULL OR public.check_group_membership(group_id, auth.uid()));
CREATE POLICY "assignments_delete_owner" ON public.assignments
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "tasks_select_access" ON public.tasks
  FOR SELECT TO authenticated
  USING (public.check_assignment_access(assignment_id, auth.uid()));
CREATE POLICY "tasks_insert_access" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (public.check_assignment_access(assignment_id, auth.uid()));
CREATE POLICY "tasks_update_access" ON public.tasks
  FOR UPDATE TO authenticated
  USING (public.check_assignment_access(assignment_id, auth.uid()))
  WITH CHECK (public.check_assignment_access(assignment_id, auth.uid()));
CREATE POLICY "tasks_delete_access" ON public.tasks
  FOR DELETE TO authenticated
  USING (public.check_assignment_access(assignment_id, auth.uid()));

CREATE POLICY "task_assignments_select_access" ON public.task_assignments
  FOR SELECT TO authenticated
  USING (public.check_task_access(task_id, auth.uid()));
CREATE POLICY "task_assignments_insert_access" ON public.task_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.check_task_access(task_id, auth.uid())
    AND public.check_task_assignee(task_id, user_id)
  );
CREATE POLICY "task_assignments_update_self_or_admin" ON public.task_assignments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND public.check_task_access(task_id, auth.uid())
    AND public.check_task_assignee(task_id, user_id)
  );
CREATE POLICY "task_assignments_delete_access" ON public.task_assignments
  FOR DELETE TO authenticated
  USING (public.check_task_access(task_id, auth.uid()));

CREATE POLICY "assignment_files_select_access" ON public.assignment_files
  FOR SELECT TO authenticated
  USING (public.check_assignment_access(assignment_id, auth.uid()));
CREATE POLICY "assignment_files_insert_owner_and_access" ON public.assignment_files
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND public.check_assignment_access(assignment_id, auth.uid()));
CREATE POLICY "assignment_files_delete_owner" ON public.assignment_files
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() AND public.check_assignment_access(assignment_id, auth.uid()));

CREATE POLICY "assignment_links_select_access" ON public.assignment_links
  FOR SELECT TO authenticated
  USING (public.check_assignment_access(assignment_id, auth.uid()));
CREATE POLICY "assignment_links_insert_owner_and_access" ON public.assignment_links
  FOR INSERT TO authenticated
  WITH CHECK (added_by = auth.uid() AND public.check_assignment_access(assignment_id, auth.uid()));
CREATE POLICY "assignment_links_update_owner" ON public.assignment_links
  FOR UPDATE TO authenticated
  USING (added_by = auth.uid() AND public.check_assignment_access(assignment_id, auth.uid()))
  WITH CHECK (added_by = auth.uid() AND public.check_assignment_access(assignment_id, auth.uid()));
CREATE POLICY "assignment_links_delete_owner" ON public.assignment_links
  FOR DELETE TO authenticated
  USING (added_by = auth.uid() AND public.check_assignment_access(assignment_id, auth.uid()));

CREATE POLICY "messages_select_members" ON public.messages
  FOR SELECT TO authenticated
  USING (public.check_group_membership(group_id, auth.uid()));
CREATE POLICY "messages_insert_own_member" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.check_group_membership(group_id, auth.uid()));
CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.check_group_membership(group_id, auth.uid()));
CREATE POLICY "messages_delete_own" ON public.messages
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "message_reactions_select_members" ON public.message_reactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_reactions.message_id
        AND public.check_group_membership(messages.group_id, auth.uid())
    )
  );
CREATE POLICY "message_reactions_insert_members" ON public.message_reactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_reactions.message_id
        AND public.check_group_membership(messages.group_id, auth.uid())
    )
  );
CREATE POLICY "message_reactions_delete_own" ON public.message_reactions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_presence_select_members" ON public.user_presence
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.check_group_membership(group_id, auth.uid()));
CREATE POLICY "user_presence_insert_own" ON public.user_presence
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (group_id IS NULL OR public.check_group_membership(group_id, auth.uid())));
CREATE POLICY "user_presence_update_own" ON public.user_presence
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND (group_id IS NULL OR public.check_group_membership(group_id, auth.uid())));
CREATE POLICY "user_presence_delete_own" ON public.user_presence
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "pinned_messages_select_members" ON public.pinned_messages
  FOR SELECT TO authenticated
  USING (public.check_group_membership(group_id, auth.uid()));
CREATE POLICY "pinned_messages_insert_admin" ON public.pinned_messages
  FOR INSERT TO authenticated
  WITH CHECK (public.check_group_admin(group_id, auth.uid()));
CREATE POLICY "pinned_messages_delete_admin" ON public.pinned_messages
  FOR DELETE TO authenticated
  USING (public.check_group_admin(group_id, auth.uid()));

CREATE POLICY "friends_select_participants" ON public.friends
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());
CREATE POLICY "friends_insert_sender" ON public.friends
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND friend_id <> auth.uid());
CREATE POLICY "friends_update_participants" ON public.friends
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR friend_id = auth.uid());
CREATE POLICY "friends_delete_participants" ON public.friends
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- The old function is callable through PostgREST by default and accepts an
-- arbitrary user id. It must not remain a public quota-mutating RPC.
REVOKE ALL ON FUNCTION public.increment_ai_usage(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_ai_usage(uuid, integer) FROM authenticated;
