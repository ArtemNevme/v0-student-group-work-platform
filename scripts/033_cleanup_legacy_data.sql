-- Финальная очистка: удаляем orphaned groups и таблицу imported_courses

-- Шаг 1: Обрабатываем оставшиеся orphaned groups
-- Привязываем их к первому доступному General subject пользователя
UPDATE groups
SET subject_id = (
  SELECT s.id 
  FROM subjects s 
  WHERE s.name LIKE 'General Assignments%' 
    AND s.user_id = groups.created_by
  LIMIT 1
)
WHERE subject_id IS NULL AND created_by IS NOT NULL;

-- Шаг 2: Удаляем groups без владельца (если есть)
DELETE FROM groups WHERE subject_id IS NULL AND created_by IS NULL;

-- Шаг 3: Удаляем таблицу imported_courses (данные уже в subjects)
DROP TABLE IF EXISTS imported_courses CASCADE;

-- Шаг 4: Проверяем результат
SELECT 
  (SELECT COUNT(*) FROM groups WHERE subject_id IS NULL) as remaining_orphaned_groups,
  (SELECT COUNT(*) FROM subjects) as total_subjects,
  'Cleanup complete!' as status;
