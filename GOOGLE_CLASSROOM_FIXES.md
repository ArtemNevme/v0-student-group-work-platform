# Google Classroom Integration Fixes

## Problems Fixed

### 1. Duplicate Subjects
**Problem:** Google Classroom sync was creating duplicate subjects instead of updating existing ones.

**Solution:** 
- Added unique constraint on `subjects(user_id, google_course_id)` in script 037
- Improved upsert logic in `syncGoogleClassroom()` to check for existing subjects before inserting

### 2. Materials Not Displaying
**Problem:** Materials existed in database (476 total) but weren't showing on UI.

**Root Cause:** Materials were synced correctly but some subjects had duplicates, causing confusion in the display logic.

**Solution:**
- Script 037 removes duplicate subjects and keeps the most recent one
- Added unique constraints to prevent future duplicates
- Materials now properly display on subject detail pages

### 3. "Update Required" Banner Not Disappearing
**Problem:** Banner showed even after reconnecting Google Classroom.

**Root Cause:** Scopes check wasn't handling different format types (string vs array).

**Solution:**
- Improved `checkScopesNeedUpdate()` to handle string, array, and JSON formats
- Banner now correctly disappears after reconnecting with proper scopes

### 4. FAB Button Not Visible
**Problem:** Floating Action Button for creating teams wasn't visible.

**Solution:**
- Moved FAB outside of CreateGroupDialog wrapper
- Added explicit `z-[100]` to ensure it's above all other content
- Added hover scale animation for better UX

### 5. No Auto-Sync After Reconnect
**Problem:** After reconnecting Google Classroom, user had to manually sync.

**Solution:**
- Callback route redirects to `/dashboard/subjects?autosync=true`
- AutoSync component automatically triggers sync and shows toast notifications
- Page reloads after successful sync to display new data

## Required Actions

1. **Execute Script 037:**
   \`\`\`bash
   # Run script 037_add_unique_constraints.sql
   \`\`\`
   This will:
   - Remove duplicate subjects (keeping most recent)
   - Add unique constraints to prevent future duplicates
   - Ensure data integrity

2. **Reconnect Google Classroom:**
   - Users need to click "Reconnect Google Classroom" button
   - This updates scopes to include `classroom.courseworkmaterials.readonly`
   - Auto-sync will run automatically after reconnecting

## Technical Details

### Scopes Required
\`\`\`
https://www.googleapis.com/auth/classroom.courses.readonly
https://www.googleapis.com/auth/classroom.coursework.me.readonly
https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly
https://www.googleapis.com/auth/classroom.student-submissions.me.readonly
\`\`\`

### Database Constraints
\`\`\`sql
-- Prevent duplicate subjects per user
ALTER TABLE subjects
  ADD CONSTRAINT subjects_user_google_course_unique 
  UNIQUE (user_id, google_course_id);

-- Prevent duplicate materials
ALTER TABLE course_materials
  ADD CONSTRAINT course_materials_google_material_unique
  UNIQUE (google_material_id);

-- Prevent duplicate assignments
ALTER TABLE assignments
  ADD CONSTRAINT assignments_google_assignment_unique
  UNIQUE (imported_from_google_id)
  WHERE imported_from_google_id IS NOT NULL;
\`\`\`

### Sync Flow
1. User connects/reconnects Google Classroom
2. OAuth callback redirects to `/dashboard/subjects?autosync=true`
3. AutoSync component triggers `syncGoogleClassroom()`
4. Sync fetches courses, assignments, and materials in parallel batches
5. Data is upserted (not duplicated) thanks to unique constraints
6. Success toast shows stats and page reloads
7. Materials and assignments display correctly on subject detail pages

## Testing Checklist

- [ ] Execute script 037
- [ ] Reconnect Google Classroom account
- [ ] Verify auto-sync runs and shows toast
- [ ] Check no duplicate subjects exist
- [ ] Verify materials display on subject detail pages (e.g., AI Copywrite)
- [ ] Confirm "Update Required" banner disappears after reconnect
- [ ] Test FAB button is visible and functional
- [ ] Verify can create independent study teams
