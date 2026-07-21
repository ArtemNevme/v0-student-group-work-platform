-- Финальная миграция: переносим все старые данные в новую структуру
-- Этот скрипт безопасно мигрирует assignments и groups к subjects

-- Шаг 1: Создаем "General" subject для каждого пользователя у которого есть orphaned assignments
INSERT INTO subjects (id, user_id, name, description, color, icon, created_at)
SELECT DISTINCT
  gen_random_uuid(),
  g.created_by as user_id,
  'General Assignments',
  'Assignments not linked to any specific subject',
  'gray',
  'book-open',
  NOW()
FROM assignments a
JOIN groups g ON a.group_id = g.id
WHERE a.subject_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM subjects s 
  WHERE s.name = 'General Assignments' 
  AND s.user_id = g.created_by
);

-- Шаг 2: Связываем orphaned assignments с "General" subject
UPDATE assignments
SET subject_id = (
  SELECT s.id 
  FROM subjects s 
  JOIN groups g ON assignments.group_id = g.id
  WHERE s.name = 'General Assignments' 
  AND s.user_id = g.created_by
  LIMIT 1
)
WHERE subject_id IS NULL
AND group_id IS NOT NULL;

-- Шаг 3: Связываем orphaned groups с первым доступным subject пользователя
UPDATE groups
SET subject_id = (
  SELECT s.id 
  FROM subjects s 
  WHERE s.user_id = groups.created_by
  ORDER BY s.created_at
  LIMIT 1
)
WHERE subject_id IS NULL
AND EXISTS (
  SELECT 1 FROM subjects WHERE subjects.user_id = groups.created_by
);

-- Шаг 4: Выводим отчет о миграции
SELECT 
  'Migration complete!' as status,
  (SELECT COUNT(*) FROM assignments WHERE subject_id IS NULL) as orphaned_assignments,
  (SELECT COUNT(*) FROM groups WHERE subject_id IS NULL) as orphaned_groups,
  (SELECT COUNT(*) FROM subjects) as total_subjects,
  (SELECT COUNT(*) FROM subjects WHERE name = 'General Assignments') as general_subjects_created;
