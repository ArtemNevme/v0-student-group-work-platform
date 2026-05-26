-- Финальная миграция: переносим все старые данные в новую структуру
-- Этот скрипт безопасно мигрирует assignments и groups к subjects

-- Шаг 1: Создаем "General" subject для orphaned data
INSERT INTO subjects (id, user_id, name, description, color, icon, created_at)
SELECT 
  gen_random_uuid(),
  user_id,
  'General Assignments',
  'Assignments not linked to any specific subject',
  'gray',
  'book-open',
  NOW()
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM subjects WHERE name = 'General Assignments' AND subjects.user_id = profiles.user_id
);

-- Шаг 2: Связываем orphaned assignments с "General" subject
UPDATE assignments
SET subject_id = (
  SELECT s.id 
  FROM subjects s 
  WHERE s.name = 'General Assignments' 
  AND s.user_id = assignments.user_id
  LIMIT 1
)
WHERE subject_id IS NULL;

-- Шаг 3: Связываем orphaned groups с первым доступным subject пользователя
-- Или оставляем их без subject_id если хотим чтобы они были доступны везде
UPDATE groups
SET subject_id = (
  SELECT s.id 
  FROM subjects s 
  WHERE s.user_id = groups.user_id
  ORDER BY s.created_at
  LIMIT 1
)
WHERE subject_id IS NULL
AND EXISTS (
  SELECT 1 FROM subjects WHERE subjects.user_id = groups.user_id
);

-- Шаг 4: Выводим отчет о миграции
SELECT 
  'Migration complete!' as status,
  (SELECT COUNT(*) FROM assignments WHERE subject_id IS NULL) as orphaned_assignments,
  (SELECT COUNT(*) FROM groups WHERE subject_id IS NULL) as orphaned_groups,
  (SELECT COUNT(*) FROM subjects) as total_subjects;
