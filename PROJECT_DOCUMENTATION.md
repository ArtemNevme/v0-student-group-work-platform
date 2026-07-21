# StudySync - Полная Документация Проекта

## Оглавление

1. [Обзор Проекта](#обзор-проекта)
2. [Технологический Стек](#технологический-стек)
3. [Архитектура Проекта](#архитектура-проекта)
4. [Структура Базы Данных](#структура-базы-данных)
5. [API и Server Actions](#api-и-server-actions)
6. [Компоненты](#компоненты)
7. [Интеграции](#интеграции)
8. [Аутентификация и Авторизация](#аутентификация-и-авторизация)
9. [Геймификация](#геймификация)
10. [Установка и Настройка](#установка-и-настройка)
11. [Деплой](#деплой)

---

## Обзор Проекта

**StudySync** - это платформа для совместной работы студентов над учебными заданиями с интеграцией Google Classroom.

### Основной Функционал

- **Управление заданиями**: Создание, редактирование, отслеживание заданий с deadline'ами
- **Study Teams (Группы)**: Совместная работа в командах, чат, приглашения
- **Google Classroom**: Синхронизация курсов, заданий и материалов
- **AI Ассистент**: Генерация рабочих планов, рекомендации источников
- **Геймификация**: Уровни, очки, достижения, стрики
- **Календарь**: Визуализация дедлайнов и событий
- **Профили**: Персонализация, статистика активности

### Целевая Аудитория

Студенты высших учебных заведений, использующие Google Classroom для организации учебного процесса.

---

## Технологический Стек

### Frontend
- **Next.js 16.0.0** (App Router) - React фреймворк
- **React 19.2.0** - UI библиотека
- **TypeScript 5** - Типизация
- **Tailwind CSS 4** - Стилизация
- **shadcn/ui** - UI компоненты
- **Radix UI** - Headless компоненты
- **Lucide Icons** - Иконки
- **React Hook Form** + **Zod** - Формы и валидация
- **Recharts** - Графики и диаграммы
- **date-fns** - Работа с датами

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **Vercel Blob** - Файловое хранилище
- **Vercel AI SDK** - AI интеграции
- **Google Classroom API** - Интеграция с Google

### Dev Tools
- **PostCSS** - CSS обработка
- **ESLint** - Линтинг

---

## Архитектура Проекта

### Структура Директорий

\`\`\`
studysync/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── delete-file/          # Удаление файлов
│   │   ├── generate-work-plan/   # AI генерация планов
│   │   ├── google-classroom/     # Google Classroom API
│   │   ├── improve-tasks/        # AI улучшение задач
│   │   ├── recommend-sources/    # AI рекомендации
│   │   ├── upload/               # Загрузка файлов
│   │   └── upload-avatar/        # Загрузка аватаров
│   ├── auth/                     # Аутентификация
│   │   ├── callback/             # OAuth callback
│   │   ├── login/                # Страница входа
│   │   ├── sign-up/              # Регистрация
│   │   └── signout/              # Выход
│   ├── dashboard/                # Основное приложение
│   │   ├── assignments/          # Задания
│   │   ├── calendar/             # Календарь
│   │   ├── google-classroom/     # Google Classroom
│   │   ├── groups/               # Группы
│   │   ├── my-tasks/             # Мои задачи
│   │   ├── notifications/        # Уведомления
│   │   ├── profile/              # Профиль
│   │   └── subjects/             # Предметы
│   ├── invitations/              # Приглашения в группы
│   ├── privacy/                  # Политика конфиденциальности
│   ├── terms/                    # Условия использования
│   ├── globals.css               # Глобальные стили
│   ├── layout.tsx                # Корневой layout
│   └── page.tsx                  # Landing page
├── components/                   # React компоненты
│   ├── assignments/              # Компоненты заданий
│   ├── calendar/                 # Компоненты календаря
│   ├── chat/                     # Групповой чат
│   ├── dashboard/                # Компоненты дашборда
│   ├── friends/                  # Друзья
│   ├── gamification/             # Геймификация
│   ├── google-classroom/         # Google Classroom
│   ├── groups/                   # Группы
│   ├── layout/                   # Layout компоненты
│   ├── my-tasks/                 # Мои задачи
│   ├── notifications/            # Уведомления
│   ├── profile/                  # Профиль
│   ├── search/                   # Поиск
│   ├── subjects/                 # Предметы
│   └── ui/                       # UI библиотека (shadcn/ui)
├── lib/                          # Библиотеки и утилиты
│   ├── actions/                  # Server Actions
│   │   ├── assignments.ts        # CRUD заданий
│   │   ├── dashboard.ts          # Данные дашборда
│   │   ├── files.ts              # Работа с файлами
│   │   ├── friends.ts            # Друзья
│   │   ├── gamification.ts       # Геймификация
│   │   ├── google-classroom.ts   # Google Classroom
│   │   ├── groups.ts             # Группы
│   │   ├── messages.ts           # Сообщения
│   │   ├── notifications.ts      # Уведомления
│   │   ├── profile.ts            # Профиль
│   │   ├── search.ts             # Поиск
│   │   ├── subjects.ts           # Предметы
│   │   └── tasks.ts              # Задачи
│   ├── supabase/                 # Supabase клиенты
│   │   ├── client.ts             # Клиентский Supabase
│   │   ├── server.ts             # Серверный Supabase
│   │   └── middleware.ts         # Middleware для auth
│   └── utils.ts                  # Утилиты
├── hooks/                        # Custom React hooks
│   ├── use-debounce.ts
│   ├── use-mobile.ts
│   └── use-toast.ts
├── public/                       # Статические файлы
├── scripts/                      # SQL миграции
│   ├── 001_create_users_and_profiles.sql
│   ├── 002_create_groups_and_members.sql
│   ├── 003_create_assignments_and_tasks.sql
│   └── ... (37 миграций)
├── middleware.ts                 # Next.js middleware
├── next.config.mjs              # Next.js конфигурация
├── package.json                  # Dependencies
├── tailwind.config.ts           # Tailwind конфигурация
└── tsconfig.json                # TypeScript конфигурация
\`\`\`

### Паттерны и Принципы

1. **Server Components First**: Все страницы по умолчанию Server Components
2. **Server Actions**: Взаимодействие с БД через Server Actions (не API routes)
3. **RLS (Row Level Security)**: Защита данных на уровне БД
4. **Optimistic Updates**: Мгновенный UI feedback с последующей синхронизацией
5. **Type Safety**: Полная типизация TypeScript + Zod validation

---

## Структура Базы Данных

### ERD (Entity Relationship Diagram)

\`\`\`
┌──────────────┐         ┌──────────────┐
│   profiles   │────────<│ achievements │
│              │         │              │
│ - id (uuid)  │         │ - id (uuid)  │
│ - email      │         │ - name       │
│ - full_name  │         │ - points     │
│ - points     │         └──────────────┘
│ - level      │                 │
│ - streak     │                 │
└──────────────┘                 │
       │                         │
       │                         v
       │              ┌─────────────────────┐
       │              │ user_achievements   │
       │              │                     │
       │              │ - user_id (fk)      │
       │              │ - achievement_id(fk)│
       │              └─────────────────────┘
       │
       │
       ├──────────────┐
       │              │
       v              v
┌──────────────┐  ┌──────────────┐
│   groups     │  │   subjects   │
│              │  │              │
│ - id (uuid)  │  │ - id (uuid)  │
│ - name       │  │ - name       │
│ - created_by │  │ - user_id    │
│ - subject_id │  │ - google_id  │
└──────────────┘  └──────────────┘
       │                  │
       │                  │
       v                  v
┌──────────────┐  ┌──────────────┐
│group_members │  │ assignments  │
│              │  │              │
│ - group_id   │  │ - id (uuid)  │
│ - user_id    │  │ - title      │
│ - role       │  │ - deadline   │
└──────────────┘  │ - subject_id │
                  │ - group_id   │
                  └──────────────┘
                         │
                         v
                  ┌──────────────┐
                  │    tasks     │
                  │              │
                  │ - id (uuid)  │
                  │ - title      │
                  │ - assignment │
                  └──────────────┘
\`\`\`

### Таблицы (23 total)

#### 1. profiles
Профили пользователей
- `id` - UUID, PK, связан с auth.users
- `email` - Email пользователя
- `full_name` - Полное имя
- `avatar_url` - URL аватара
- `bio` - Биография
- `major` - Специальность
- `year` - Курс обучения
- `points` - Очки геймификации
- `level` - Уровень
- `streak` - Текущий стрик
- `longest_streak` - Самый длинный стрик
- `last_activity_date` - Последняя активность

#### 2. subjects
Учебные предметы
- `id` - UUID, PK
- `user_id` - UUID, FK → profiles
- `name` - Название предмета
- `description` - Описание
- `google_course_id` - ID курса в Google Classroom
- `teacher_name` - Имя преподавателя
- `section` - Секция/группа
- `icon` - Эмодзи иконка
- `color` - Цвет темы
- `is_synced` - Синхронизирован с GC
- `last_synced_at` - Время последней синхронизации

#### 3. groups (Study Teams)
Группы для совместной работы
- `id` - UUID, PK
- `name` - Название группы
- `description` - Описание
- `created_by` - UUID, FK → profiles
- `subject_id` - UUID, FK → subjects (nullable)
- `invite_code` - Уникальный код приглашения
- `category` - Категория группы
- `member_count` - Количество участников
- `max_members` - Максимум участников

#### 4. group_members
Участники групп
- `id` - UUID, PK
- `group_id` - UUID, FK → groups
- `user_id` - UUID, FK → profiles
- `role` - Роль (admin, member)
- `joined_at` - Дата вступления

#### 5. assignments
Учебные задания
- `id` - UUID, PK
- `title` - Заголовок
- `description` - Описание
- `deadline` - Дедлайн (nullable)
- `status` - Статус (not_started, in_progress, completed)
- `priority` - Приоритет (low, medium, high)
- `estimated_hours` - Оценка времени
- `subject_id` - UUID, FK → subjects (nullable)
- `group_id` - UUID, FK → groups (nullable)
- `created_by` - UUID, FK → profiles
- `imported_from_google_id` - ID в Google Classroom
- `google_classroom_link` - Ссылка на GC
- `work_link` - Ссылка на работу

#### 6. tasks
Подзадачи assignments
- `id` - UUID, PK
- `assignment_id` - UUID, FK → assignments
- `title` - Заголовок
- `description` - Описание
- `status` - Статус
- `order_index` - Порядок отображения
- `estimated_hours` - Оценка времени

#### 7. task_assignments
Назначение задач участникам
- `id` - UUID, PK
- `task_id` - UUID, FK → tasks
- `user_id` - UUID, FK → profiles
- `status` - Статус выполнения
- `completed_at` - Время завершения

#### 8. course_materials
Учебные материалы из Google Classroom
- `id` - UUID, PK
- `subject_id` - UUID, FK → subjects
- `user_id` - UUID, FK → profiles
- `title` - Название материала
- `description` - Описание
- `material_type` - Тип (link, video, file, form)
- `url` - URL материала
- `drive_file_id` - ID файла в Google Drive
- `youtube_video_id` - ID YouTube видео
- `form_url` - URL Google Forms
- `google_material_id` - ID в Google Classroom

#### 9. assignment_files
Файлы заданий
- `id` - UUID, PK
- `assignment_id` - UUID, FK → assignments
- `file_name` - Имя файла
- `file_url` - URL файла (Vercel Blob)
- `file_type` - MIME тип
- `file_size` - Размер в байтах
- `uploaded_by` - UUID, FK → profiles

#### 10. assignment_links
Полезные ссылки к заданию
- `id` - UUID, PK
- `assignment_id` - UUID, FK → assignments
- `url` - URL ссылки
- `title` - Заголовок
- `description` - Описание
- `category` - Категория (documentation, tutorial, research, etc.)
- `added_by` - UUID, FK → profiles

#### 11. messages
Сообщения в групповом чате
- `id` - UUID, PK
- `group_id` - UUID, FK → groups
- `assignment_id` - UUID, FK → assignments (nullable)
- `user_id` - UUID, FK → profiles
- `content` - Текст сообщения
- `attachment_url` - URL вложения
- `attachment_type` - Тип вложения
- `reply_to_id` - UUID, FK → messages (nullable)
- `is_edited` - Флаг редактирования
- `is_deleted` - Флаг удаления

#### 12. message_reactions
Реакции на сообщения
- `id` - UUID, PK
- `message_id` - UUID, FK → messages
- `user_id` - UUID, FK → profiles
- `emoji` - Эмодзи реакции

#### 13. pinned_messages
Закрепленные сообщения
- `id` - UUID, PK
- `group_id` - UUID, FK → groups
- `message_id` - UUID, FK → messages
- `pinned_by` - UUID, FK → profiles
- `pinned_at` - Время закрепления

#### 14. user_presence
Онлайн статус пользователей
- `user_id` - UUID, PK, FK → profiles
- `group_id` - UUID, FK → groups
- `is_online` - Онлайн статус
- `is_typing` - Печатает сообщение
- `last_seen` - Время последней активности

#### 15. notifications
Уведомления
- `id` - UUID, PK
- `user_id` - UUID, FK → profiles
- `type` - Тип уведомления
- `title` - Заголовок
- `message` - Текст
- `link` - Ссылка для перехода
- `read` - Прочитано

#### 16. invitations
Приглашения в группы
- `id` - UUID, PK
- `group_id` - UUID, FK → groups
- `invited_email` - Email приглашенного
- `invited_by` - UUID, FK → profiles
- `invite_code` - Код приглашения
- `status` - Статус (pending, accepted, rejected)
- `expires_at` - Срок действия

#### 17. friends
Дружеские связи
- `id` - UUID, PK
- `user_id` - UUID, FK → profiles
- `friend_id` - UUID, FK → profiles
- `status` - Статус (pending, accepted, blocked)

#### 18. achievements
Достижения
- `id` - UUID, PK
- `name` - Название
- `description` - Описание
- `icon` - Иконка
- `points_required` - Требуемые очки

#### 19. user_achievements
Полученные достижения
- `id` - UUID, PK
- `user_id` - UUID, FK → profiles
- `achievement_id` - UUID, FK → achievements
- `earned_at` - Время получения

#### 20. google_classroom_connections
Подключения к Google Classroom
- `id` - UUID, PK
- `user_id` - UUID, FK → profiles
- `access_token` - OAuth токен
- `refresh_token` - Refresh токен
- `scopes` - OAuth scopes
- `token_expires_at` - Срок действия токена
- `is_valid` - Валидность подключения
- `last_synced_at` - Время последней синхронизации

#### 21. student_submissions
Работы студентов из Google Classroom
- `id` - UUID, PK
- `user_id` - UUID, FK → profiles
- `assignment_id` - UUID, FK → assignments
- `subject_id` - UUID, FK → subjects
- `google_submission_id` - ID в Google Classroom
- `google_coursework_id` - ID coursework в GC
- `google_course_id` - ID курса в GC
- `state` - Состояние (NEW, CREATED, TURNED_IN, RETURNED, RECLAIMED_BY_STUDENT)
- `late` - Опоздание
- `draft_grade` - Черновая оценка
- `assigned_grade` - Финальная оценка
- `max_points` - Максимум баллов
- `turned_in_at` - Время сдачи
- `returned_at` - Время возврата

#### 22. ai_chat_messages
История AI чата
- `id` - UUID, PK
- `user_id` - UUID, FK → profiles
- `subject_id` - UUID, FK → subjects (nullable)
- `role` - Роль (user, assistant, system)
- `content` - Текст сообщения
- `model` - Модель AI
- `tokens_used` - Использовано токенов
- `metadata` - JSONB метаданные

#### 23. ai_usage
Статистика использования AI
- `id` - UUID, PK
- `user_id` - UUID, FK → profiles
- `date` - Дата
- `messages_count` - Количество сообщений
- `tokens_used` - Использовано токенов

### RLS (Row Level Security)

Все таблицы защищены RLS политиками:

**Базовые правила:**
- SELECT: Пользователи видят только свои данные или данные групп, к которым они принадлежат
- INSERT: Пользователи могут создавать записи, где они указаны как owner
- UPDATE: Пользователи могут обновлять только свои записи или записи в группах где они admin
- DELETE: Пользователи могут удалять только свои записи

---

## API и Server Actions

### API Routes (`app/api/`)

#### 1. `/api/delete-file` (POST)
Удаление файлов из Vercel Blob
- **Input**: `{ url: string }`
- **Output**: `{ success: boolean }`
- **Auth**: Требуется

#### 2. `/api/upload` (POST)
Загрузка файлов в Vercel Blob
- **Input**: `FormData` с файлом
- **Output**: `{ url: string, filename: string, size: number }`
- **Auth**: Требуется
- **Limit**: 10MB

#### 3. `/api/upload-avatar` (POST)
Загрузка аватара
- **Input**: `FormData` с изображением
- **Output**: `{ url: string }`
- **Auth**: Требуется
- **Limit**: 5MB, только изображения

#### 4. `/api/generate-work-plan` (POST)
AI генерация рабочего плана
- **Input**: 
  \`\`\`typescript
  {
    title: string;
    description: string;
    deadline: string;
    estimatedHours: number;
  }
  \`\`\`
- **Output**: 
  \`\`\`typescript
  {
    tasks: Array<{
      title: string;
      description: string;
      estimatedHours: number;
      orderIndex: number;
    }>
  }
  \`\`\`
- **Auth**: Требуется
- **AI Model**: OpenAI GPT-4

#### 5. `/api/improve-tasks` (POST)
AI улучшение списка задач
- **Input**: `{ tasks: Array<{ title: string }> }`
- **Output**: `{ tasks: Array<{ title: string; description: string }> }`
- **Auth**: Требуется

#### 6. `/api/recommend-sources` (POST)
AI рекомендации источников
- **Input**: 
  \`\`\`typescript
  {
    title: string;
    description: string;
    category: string;
  }
  \`\`\`
- **Output**: 
  \`\`\`typescript
  {
    sources: Array<{
      title: string;
      url: string;
      description: string;
      category: string;
    }>
  }
  \`\`\`
- **Auth**: Требуется

#### 7. `/api/google-classroom/auth-url` (GET)
Получение URL для OAuth авторизации Google
- **Output**: `{ url: string }`
- **Auth**: Требуется
- **Scopes**: 
  - classroom.courses.readonly
  - classroom.coursework.me.readonly
  - classroom.courseworkmaterials.readonly
  - classroom.student-submissions.me.readonly

#### 8. `/api/google-classroom/callback` (GET)
OAuth callback от Google
- **Input**: `?code=...&state=...`
- **Redirect**: `/dashboard/subjects?autosync=true`
- **Auth**: Требуется

#### 9. `/api/google-classroom/sync` (POST)
Синхронизация с Google Classroom (legacy, не используется)
- **Рекомендуется**: Использовать `syncGoogleClassroom()` server action

### Server Actions (`lib/actions/`)

#### assignments.ts

\`\`\`typescript
// Получить все задания пользователя
getAssignments(filters?: AssignmentFilters): Promise<Assignment[]>

// Получить детали задания
getAssignmentDetails(id: string): Promise<AssignmentDetails | null>

// Создать задание
createAssignment(data: CreateAssignmentInput): Promise<Assignment>

// Обновить задание
updateAssignment(id: string, data: UpdateAssignmentInput): Promise<Assignment>

// Удалить задание
deleteAssignment(id: string): Promise<void>

// Завершить задание
completeAssignment(id: string): Promise<void>

// Добавить задание в Study Team
addAssignmentToTeam(assignmentId: string, groupId: string): Promise<void>

// Загрузить файл к заданию
uploadAssignmentFile(assignmentId: string, file: File): Promise<AssignmentFile>

// Добавить ссылку к заданию
addAssignmentLink(assignmentId: string, data: LinkInput): Promise<AssignmentLink>
\`\`\`

#### subjects.ts

\`\`\`typescript
// Получить все предметы пользователя
getSubjects(): Promise<Subject[]>

// Получить детали предмета
getSubjectDetails(id: string): Promise<SubjectDetails | null>

// Создать предмет
createSubject(data: CreateSubjectInput): Promise<Subject>

// Обновить предмет
updateSubject(id: string, data: UpdateSubjectInput): Promise<Subject>

// Удалить предмет
deleteSubject(id: string): Promise<void>
\`\`\`

#### groups.ts

\`\`\`typescript
// Получить все группы пользователя
getGroups(): Promise<Group[]>

// Получить детали группы
getGroupDetails(id: string): Promise<GroupDetails | null>

// Создать группу
createGroup(data: CreateGroupInput): Promise<Group>

// Обновить группу
updateGroup(id: string, data: UpdateGroupInput): Promise<Group>

// Удалить группу
deleteGroup(id: string): Promise<void>

// Присоединиться к группе по коду
joinGroupByCode(code: string): Promise<void>

// Пригласить участника
inviteMember(groupId: string, email: string): Promise<Invitation>

// Покинуть группу
leaveGroup(groupId: string): Promise<void>

// Удалить участника (только admin)
removeMember(groupId: string, userId: string): Promise<void>
\`\`\`

#### tasks.ts

\`\`\`typescript
// Получить задачи assignment
getTasks(assignmentId: string): Promise<Task[]>

// Создать задачу
createTask(data: CreateTaskInput): Promise<Task>

// Обновить задачу
updateTask(id: string, data: UpdateTaskInput): Promise<Task>

// Удалить задачу
deleteTask(id: string): Promise<void>

// Назначить задачу участнику
assignTask(taskId: string, userId: string): Promise<void>

// Завершить задачу
completeTask(taskId: string): Promise<void>

// Изменить порядок задач
reorderTasks(assignmentId: string, taskIds: string[]): Promise<void>
\`\`\`

#### google-classroom.ts

\`\`\`typescript
// Синхронизировать Google Classroom
syncGoogleClassroom(): Promise<SyncResult>

// Получить статус подключения
getConnectionStatus(): Promise<ConnectionStatus | null>

// Отключить Google Classroom
disconnectGoogleClassroom(): Promise<void>

// Получить access token
getAccessToken(): Promise<string | null>

// Обновить token
refreshAccessToken(refreshToken: string): Promise<TokenResponse>
\`\`\`

#### messages.ts

\`\`\`typescript
// Получить сообщения группы
getMessages(groupId: string, limit?: number): Promise<Message[]>

// Отправить сообщение
sendMessage(data: SendMessageInput): Promise<Message>

// Редактировать сообщение
editMessage(id: string, content: string): Promise<Message>

// Удалить сообщение
deleteMessage(id: string): Promise<void>

// Добавить реакцию
addReaction(messageId: string, emoji: string): Promise<void>

// Закрепить сообщение
pinMessage(messageId: string): Promise<void>
\`\`\`

#### profile.ts

\`\`\`typescript
// Получить профиль
getProfile(userId?: string): Promise<Profile | null>

// Обновить профиль
updateProfile(data: UpdateProfileInput): Promise<Profile>

// Загрузить аватар
uploadAvatar(file: File): Promise<string>

// Получить статистику активности
getActivityStats(): Promise<ActivityStats>
\`\`\`

#### gamification.ts

\`\`\`typescript
// Получить достижения пользователя
getUserAchievements(): Promise<UserAchievement[]>

// Получить leaderboard
getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>

// Добавить очки
addPoints(userId: string, points: number, reason: string): Promise<void>

// Обновить стрик
updateStreak(): Promise<void>

// Проверить и выдать достижения
checkAndAwardAchievements(userId: string): Promise<Achievement[]>
\`\`\`

#### dashboard.ts

\`\`\`typescript
// Получить данные дашборда
getDashboardStats(): Promise<DashboardStats>

// Получить ближайшие дедлайны
getUpcomingDeadlines(limit?: number): Promise<Assignment[]>

// Получить недавнюю активность
getRecentActivity(limit?: number): Promise<Activity[]>

// Получить статистику недели
getWeekOverview(): Promise<WeekStats>
\`\`\`

#### notifications.ts

\`\`\`typescript
// Получить уведомления
getNotifications(limit?: number): Promise<Notification[]>

// Отметить как прочитанное
markAsRead(id: string): Promise<void>

// Отметить все как прочитанные
markAllAsRead(): Promise<void>

// Удалить уведомление
deleteNotification(id: string): Promise<void>

// Создать уведомление
createNotification(data: CreateNotificationInput): Promise<Notification>
\`\`\`

#### friends.ts

\`\`\`typescript
// Получить друзей
getFriends(): Promise<Friend[]>

// Отправить запрос в друзья
sendFriendRequest(userId: string): Promise<void>

// Принять запрос в друзья
acceptFriendRequest(friendshipId: string): Promise<void>

// Отклонить запрос в друзья
rejectFriendRequest(friendshipId: string): Promise<void>

// Удалить из друзей
removeFriend(friendshipId: string): Promise<void>
\`\`\`

#### search.ts

\`\`\`typescript
// Глобальный поиск
globalSearch(query: string): Promise<SearchResults>

// Поиск заданий
searchAssignments(query: string): Promise<Assignment[]>

// Поиск групп
searchGroups(query: string): Promise<Group[]>

// Поиск пользователей
searchUsers(query: string): Promise<Profile[]>
\`\`\`

---

## Компоненты

### Структура Компонентов

#### Dashboard Components (`components/dashboard/`)

1. **welcome-header.tsx** - Приветственный заголовок с уровнем и очками
2. **stats-cards.tsx** - Карточки статистики (задания, группы, стрик)
3. **upcoming-deadlines.tsx** - Ближайшие дедлайны
4. **priority-tasks.tsx** - Приоритетные задания
5. **quick-access-groups.tsx** - Быстрый доступ к группам
6. **recent-activity.tsx** - Недавняя активность
7. **week-overview.tsx** - Обзор недели с графиком
8. **level-widget.tsx** - Виджет прогресса уровня
9. **my-tasks.tsx** - Список задач на сегодня

#### Assignment Components (`components/assignments/`)

1. **assignment-card.tsx** - Карточка задания
2. **assignment-tabs.tsx** - Табы: Overview, Tasks, Files, Links, Chat
3. **create-assignment-dialog.tsx** - Диалог создания задания
4. **create-assignment-wizard.tsx** - Пошаговый мастер создания
5. **edit-assignment-dialog.tsx** - Редактирование задания
6. **task-list.tsx** - Список задач с drag-and-drop
7. **create-task-dialog.tsx** - Создание задачи
8. **edit-task-dialog.tsx** - Редактирование задачи
9. **file-upload.tsx** - Загрузка файлов
10. **sources-list.tsx** - Список источников/ссылок
11. **source-recommendations.tsx** - AI рекомендации источников
12. **ai-work-planner.tsx** - AI генератор рабочего плана
13. **ai-task-assistant.tsx** - AI помощник по задачам
14. **work-link-field.tsx** - Поле для ссылки на работу
15. **complete-assignment-button.tsx** - Кнопка завершения
16. **add-to-team-dialog.tsx** - Добавление в Study Team
17. **category-filter.tsx** - Фильтр по категориям
18. **date-filter.tsx** - Фильтр по датам
19. **overview/progress-ring.tsx** - Круговой прогресс
20. **overview/priority-badge.tsx** - Бейдж приоритета
21. **overview/time-remaining.tsx** - Оставшееся время
22. **overview/team-workload.tsx** - Загрузка команды
23. **overview/activity-timeline.tsx** - Таймлайн активности

#### Group Components (`components/groups/`)

1. **group-card.tsx** - Карточка группы
2. **create-group-dialog.tsx** - Создание группы
3. **invite-member-dialog.tsx** - Приглашение участника
4. **add-friend-to-group.tsx** - Добавление друга в группу
5. **leave-group-button.tsx** - Покинуть группу

#### Subject Components (`components/subjects/`)

1. **subject-card.tsx** - Карточка предмета с иконкой и статистикой

#### Google Classroom Components (`components/google-classroom/`)

1. **connect-button.tsx** - Подключение Google Classroom
2. **reconnect-button.tsx** - Переподключение с новыми permissions
3. **disconnect-button.tsx** - Отключение
4. **sync-button.tsx** - Синхронизация
5. **subjects-list.tsx** - Список курсов из GC
6. **assignments-list.tsx** - Список заданий из GC
7. **import-to-studysync-dialog.tsx** - Импорт в StudySync

#### Chat Components (`components/chat/`)

1. **group-chat.tsx** - Полнофункциональный групповой чат с:
   - Realtime сообщениями
   - Реакциями
   - Ответами (replies)
   - Загрузкой файлов
   - Закрепленными сообщениями
   - Индикатором печати
   - Онлайн статусом

#### Profile Components (`components/profile/`)

1. **avatar-upload.tsx** - Загрузка аватара
2. **edit-profile-dialog.tsx** - Редактирование профиля
3. **profile-stats-cards.tsx** - Карточки статистики профиля
4. **activity-heatmap.tsx** - Тепловая карта активности

#### Gamification Components (`components/gamification/`)

1. **achievement-showcase.tsx** - Витрина достижений
2. **leaderboard.tsx** - Таблица лидеров
3. **progress-stats.tsx** - Статистика прогресса

#### Calendar Components (`components/calendar/`)

1. **assignment-calendar.tsx** - Календарь с дедлайнами

#### Notification Components (`components/notifications/`)

1. **notification-center.tsx** - Центр уведомлений
2. **notifications-panel.tsx** - Панель уведомлений

#### Search Components (`components/search/`)

1. **global-search.tsx** - Глобальный поиск (Cmd+K)

#### Layout Components (`components/layout/`)

1. **dashboard-header.tsx** - Хедер дашборда с навигацией

#### UI Components (`components/ui/`)
shadcn/ui библиотека компонентов (52 компонента)

---

## Интеграции

### 1. Supabase

**Назначение**: Backend-as-a-Service
- PostgreSQL база данных
- Аутентификация (Email/Password + Google OAuth)
- Row Level Security (RLS)
- Realtime subscriptions

**Конфигурация**:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

**Клиенты**:
- `lib/supabase/client.ts` - Клиентский Supabase (Browser)
- `lib/supabase/server.ts` - Серверный Supabase (Server Components)
- `lib/supabase/middleware.ts` - Middleware для auth refresh

**Использование**:
\`\`\`typescript
// Client Component
import { createBrowserClient } from '@/lib/supabase/client'
const supabase = createBrowserClient()

// Server Component
import { createServerClient } from '@/lib/supabase/server'
const supabase = await createServerClient()
\`\`\`

### 2. Google Classroom API

**Назначение**: Синхронизация курсов, заданий и материалов

**OAuth Scopes**:
- `https://www.googleapis.com/auth/classroom.courses.readonly`
- `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
- `https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly`
- `https://www.googleapis.com/auth/classroom.student-submissions.me.readonly`

**Конфигурация**:
\`\`\`env
GOOGLE_CLIENT_ID=[client-id]
GOOGLE_CLIENT_SECRET=[client-secret]
\`\`\`

**Настройка Google Cloud Console**:
1. Создать проект
2. Включить Google Classroom API
3. Настроить OAuth consent screen
4. Создать OAuth 2.0 Client ID
5. Добавить redirect URI: `https://[your-domain]/api/google-classroom/callback`

**Workflow**:
1. Пользователь нажимает "Connect Google Classroom"
2. Редирект на Google OAuth
3. Callback сохраняет токены в `google_classroom_connections`
4. Автосинхронизация запускается
5. Курсы → `subjects`, задания → `assignments`, материалы → `course_materials`

**Синхронизация**:
\`\`\`typescript
// Manual sync
import { syncGoogleClassroom } from '@/lib/actions/google-classroom'
const result = await syncGoogleClassroom()

// Auto-sync after OAuth
// Происходит автоматически в callback route
\`\`\`

### 3. Vercel Blob

**Назначение**: Файловое хранилище

**Конфигурация**:
\`\`\`env
BLOB_READ_WRITE_TOKEN=[token]
\`\`\`

**Использование**:
\`\`\`typescript
import { put, del } from '@vercel/blob'

// Upload
const blob = await put('filename.pdf', file, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN
})

// Delete
await del(blob.url, {
  token: process.env.BLOB_READ_WRITE_TOKEN
})
\`\`\`

### 4. Vercel AI SDK

**Назначение**: AI интеграции (генерация планов, рекомендации)

**Модели**:
- OpenAI GPT-4 (через AI Gateway)
- Anthropic Claude (опционально)

**Использование**:
\`\`\`typescript
import { generateText } from 'ai'

const { text } = await generateText({
  model: 'openai/gpt-4.1',
  prompt: 'Generate a work plan for...'
})
\`\`\`

---

## Аутентификация и Авторизация

### Провайдеры

1. **Email/Password** - Стандартная регистрация
2. **Google OAuth** - Вход через Google

### Auth Flow

#### Регистрация (`/auth/sign-up`)
1. Пользователь вводит email, пароль, имя
2. Supabase создает пользователя в `auth.users`
3. Trigger создает профиль в `profiles`
4. Email подтверждение (опционально)
5. Редирект на `/auth/sign-up-success`

#### Вход (`/auth/login`)
1. Email/пароль или Google OAuth
2. Supabase создает сессию
3. Middleware проверяет auth cookie
4. Редирект на `/dashboard`

#### Выход (`/auth/signout`)
1. Вызывается `supabase.auth.signOut()`
2. Удаляется auth cookie
3. Редирект на `/auth/login`

### Middleware (`middleware.ts`)

\`\`\`typescript
export async function middleware(request: NextRequest) {
  // Refresh auth token
  const { supabase, response } = await updateSession(request)
  
  // Protected routes
  const protectedPaths = ['/dashboard']
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtected) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  return response
}
\`\`\`

### Row Level Security (RLS)

Все таблицы защищены RLS политиками. Примеры:

\`\`\`sql
-- profiles: Пользователи видят все профили
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

-- assignments: Пользователи видят свои задания или задания в своих группах
CREATE POLICY "assignments_select" ON assignments
  FOR SELECT USING (
    auth.uid() = created_by OR
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

-- messages: Только участники группы видят сообщения
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );
\`\`\`

---

## Геймификация

### Система Уровней

**Формула прогресса**:
\`\`\`typescript
const pointsForNextLevel = level * 100
const progress = (points % 100) / pointsForNextLevel * 100
\`\`\`

**Источники очков**:
- Завершение задания: +10 очков
- Завершение задачи: +5 очков
- Создание задания: +2 очка
- Создание группы: +5 очков
- Ежедневная активность: +1 очко
- Стрик 7 дней: +20 очков
- Стрик 30 дней: +100 очков

### Стрики (Streaks)

**Логика**:
- +1 стрик за каждый день активности
- Активность = любое действие (создание задания, сообщение, завершение задачи)
- Сброс при пропуске дня
- Отслеживание longest_streak

**Обновление**:
\`\`\`typescript
// В updateStreak() server action
const today = new Date().toDateString()
const lastActivity = profile.last_activity_date

if (lastActivity === today) {
  // Уже активен сегодня
  return
}

const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)

if (lastActivity === yesterday.toDateString()) {
  // Продолжение стрика
  profile.streak += 1
} else {
  // Сброс стрика
  profile.streak = 1
}

profile.longest_streak = Math.max(profile.streak, profile.longest_streak)
\`\`\`

### Достижения

**Примеры достижений**:
- "Первое задание" - создать 1 задание
- "Продуктивный" - завершить 10 заданий
- "Командный игрок" - создать 5 групп
- "Социальный" - пригласить 10 друзей
- "Марафонец" - стрик 30 дней
- "Мастер" - достичь 10 уровня

**Проверка достижений**:
\`\`\`typescript
// В checkAndAwardAchievements() server action
const achievements = await supabase
  .from('achievements')
  .select('*')
  
for (const achievement of achievements) {
  const earned = await checkAchievementCriteria(userId, achievement)
  if (earned) {
    await awardAchievement(userId, achievement.id)
  }
}
\`\`\`

### Leaderboard

**Сортировка**:
1. По очкам (убывание)
2. По уровню (убывание)
3. По стрику (убывание)

**Отображение**:
- Топ 100 пользователей
- Аватар, имя, очки, уровень, стрик
- Позиция текущего пользователя

---

## Установка и Настройка

### Требования

- Node.js 18+
- pnpm (или npm/yarn)
- Supabase аккаунт
- Vercel аккаунт (для Blob)
- Google Cloud Console проект (для Google Classroom)

### Шаги Установки

#### 1. Клонирование проекта

\`\`\`bash
# Скачайте ZIP с v0.app или клонируйте
cd studysync
\`\`\`

#### 2. Установка зависимостей

\`\`\`bash
pnpm install
\`\`\`

#### 3. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Скопируйте URL и anon key
3. Выполните SQL миграции из `scripts/` в порядке номеров:

\`\`\`sql
-- В Supabase SQL Editor
-- Выполните все скрипты 001-037 по порядку
\`\`\`

4. Настройте Google OAuth Provider в Supabase:
   - Authentication → Providers → Google
   - Включите Google
   - Добавьте Client ID и Secret
   - Redirect URL: `https://[project-id].supabase.co/auth/v1/callback`

#### 4. Настройка Google Classroom API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Classroom API:
   - APIs & Services → Library
   - Найдите "Google Classroom API"
   - Нажмите Enable
4. Настройте OAuth consent screen:
   - APIs & Services → OAuth consent screen
   - Выберите External
   - Заполните обязательные поля (название, email)
   - Добавьте scopes:
     - `.../auth/classroom.courses.readonly`
     - `.../auth/classroom.coursework.me.readonly`
     - `.../auth/classroom.courseworkmaterials.readonly`
     - `.../auth/classroom.student-submissions.me.readonly`
5. Создайте OAuth 2.0 Client ID:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/google-classroom/callback` (dev)
     - `https://[your-domain]/api/google-classroom/callback` (prod)
   - Скопируйте Client ID и Client Secret

#### 5. Настройка Vercel Blob

1. Установите Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link проект: `vercel link`
4. Создайте Blob Store:
   \`\`\`bash
   vercel blob create
   \`\`\`
5. Скопируйте `BLOB_READ_WRITE_TOKEN`

#### 6. Environment Variables

Создайте `.env.local`:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Google Classroom
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

#### 7. Запуск Dev Server

\`\`\`bash
pnpm dev
\`\`\`

Откройте [http://localhost:3000](http://localhost:3000)

#### 8. Первый запуск

1. Зарегистрируйтесь через `/auth/sign-up`
2. Подтвердите email (если включено)
3. Войдите в дашборд
4. Подключите Google Classroom (если нужно)

---

## Деплой

### Vercel (Рекомендуется)

#### 1. Push в Git

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin [your-repo-url]
git push -u origin main
\`\`\`

#### 2. Import в Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. New Project
3. Import Git Repository
4. Выберите ваш репозиторий

#### 3. Configure Project

**Framework Preset**: Next.js

**Root Directory**: `./`

**Environment Variables**: Добавьте все переменные из `.env.local`

**Build Command**: `pnpm build` (или `npm run build`)

**Output Directory**: `.next`

**Install Command**: `pnpm install` (или `npm install`)

#### 4. Deploy

Нажмите "Deploy"

#### 5. Post-Deploy Configuration

1. **Custom Domain** (опционально):
   - Settings → Domains
   - Добавьте ваш домен
   - Настройте DNS записи

2. **Update Environment Variables**:
   \`\`\`env
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   \`\`\`

3. **Update Google OAuth Redirect**:
   - Google Cloud Console → Credentials
   - Добавьте `https://your-domain.com/api/google-classroom/callback`

4. **Update Supabase Auth Redirect**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

#### 6. Database Setup

Если база данных еще не создана:

\`\`\`bash
# Подключитесь к Supabase через CLI
supabase link --project-ref [project-id]

# Или выполните миграции вручную через Supabase Dashboard
\`\`\`

---

## Troubleshooting

### Частые Проблемы

#### 1. "Authentication failed" при входе

**Причина**: Неверные Supabase credentials или RLS политики

**Решение**:
- Проверьте `.env.local` переменные
- Убедитесь что все SQL скрипты выполнены
- Проверьте RLS политики в Supabase Dashboard

#### 2. Google Classroom не подключается

**Причина**: Неверные OAuth credentials или redirect URIs

**Решение**:
- Проверьте `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`
- Убедитесь что redirect URI правильный в Google Cloud Console
- Проверьте что все scopes добавлены в OAuth consent screen

#### 3. Материалы не синхронизируются

**Причина**: Отсутствует scope `courseworkmaterials.readonly`

**Решение**:
- Переподключите Google Classroom с новыми permissions
- Нажмите "Reconnect Google Classroom" на странице Subjects

#### 4. Файлы не загружаются

**Причина**: Неверный `BLOB_READ_WRITE_TOKEN` или лимиты размера

**Решение**:
- Проверьте token в `.env.local`
- Убедитесь что размер файла < 10MB
- Проверьте MIME type файла

#### 5. FAB кнопка не видна

**Причина**: z-index конфликт или не рендерится

**Решение**:
- Проверьте что скрипты 035-037 выполнены
- Обновите страницу Subjects
- Проверьте console на ошибки React

---

## Архитектурные Решения

### 1. Server Components vs Client Components

**Правило**: Server Components по умолчанию, Client Components только когда необходимо

**Client Components используются для**:
- Интерактивные элементы (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs
- Realtime subscriptions

**Server Components используются для**:
- Страницы
- Layouts
- Статические компоненты
- Fetch данных из БД

### 2. Data Fetching

**Server Actions вместо API Routes**:
- Более простой код
- Автоматическая типизация
- Нет необходимости в отдельных endpoints

**Примеры**:
\`\`\`typescript
// ❌ Старый подход (API Route)
const response = await fetch('/api/assignments')
const data = await response.json()

// ✅ Новый подход (Server Action)
import { getAssignments } from '@/lib/actions/assignments'
const data = await getAssignments()
\`\`\`

### 3. State Management

**Нет глобального store (Redux, Zustand)**:
- Server Components fetch свежие данные
- Client state через useState
- URL state через searchParams
- Realtime через Supabase subscriptions

**Optimistic Updates**:
\`\`\`typescript
// Мгновенное обновление UI
setTasks(prev => [...prev, newTask])

// Затем синхронизация с сервером
await createTask(newTask)
\`\`\`

### 4. Error Handling

**React Error Boundaries**:
\`\`\`typescript
// app/error.tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
\`\`\`

**Try-Catch в Server Actions**:
\`\`\`typescript
export async function createAssignment(data: CreateAssignmentInput) {
  try {
    const supabase = await createServerClient()
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return assignment
  } catch (error) {
    console.error('Error creating assignment:', error)
    throw new Error('Failed to create assignment')
  }
}
\`\`\`

### 5. Performance Optimization

**Image Optimization**:
\`\`\`typescript
import Image from 'next/image'

<Image
  src={avatarUrl || "/placeholder.svg"}
  alt="Avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
\`\`\`

**Dynamic Imports**:
\`\`\`typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
})
\`\`\`

**Pagination**:
\`\`\`typescript
const LIMIT = 20
const { data: assignments } = await supabase
  .from('assignments')
  .select('*')
  .range(offset, offset + LIMIT - 1)
\`\`\`

### 6. Security

**Input Validation**:
\`\`\`typescript
import { z } from 'zod'

const createAssignmentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000),
  deadline: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high'])
})

export async function createAssignment(input: unknown) {
  const validated = createAssignmentSchema.parse(input)
  // ...
}
\`\`\`

**XSS Protection**:
- React автоматически экранирует вывод
- Не используйте `dangerouslySetInnerHTML`
- Валидация всех user inputs

**CSRF Protection**:
- Supabase использует JWT tokens
- Server Actions защищены Next.js

---

## API Documentation

### REST API Endpoints (Legacy)

#### POST /api/delete-file
Удалить файл из Blob storage

**Request**:
\`\`\`json
{
  "url": "https://blob.vercel-storage.com/..."
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true
}
\`\`\`

#### POST /api/upload
Загрузить файл

**Request**: `multipart/form-data`

**Response**:
\`\`\`json
{
  "url": "https://blob.vercel-storage.com/...",
  "filename": "document.pdf",
  "size": 1024000
}
\`\`\`

#### POST /api/generate-work-plan
Сгенерировать рабочий план с AI

**Request**:
\`\`\`json
{
  "title": "Research Paper",
  "description": "Write a 10-page research paper on...",
  "deadline": "2024-12-31T23:59:59Z",
  "estimatedHours": 20
}
\`\`\`

**Response**:
\`\`\`json
{
  "tasks": [
    {
      "title": "Research and gather sources",
      "description": "Find 10-15 academic sources...",
      "estimatedHours": 5,
      "orderIndex": 0
    },
    {
      "title": "Create outline",
      "description": "Structure your paper with...",
      "estimatedHours": 2,
      "orderIndex": 1
    }
  ]
}
\`\`\`

---

## Future Improvements

### Planned Features

1. **Mobile App** (React Native)
2. **Desktop App** (Electron)
3. **Offline Mode** (PWA)
4. **Video Chat** (WebRTC)
5. **Canvas Integration**
6. **Moodle Integration**
7. **Advanced Analytics**
8. **AI Study Assistant** (полноценный чат-бот)
9. **Pomodoro Timer**
10. **Collaborative Whiteboard**

### Known Issues

1. Materials не всегда синхронизируются с Google Classroom (требуется reconnect)
2. Realtime subscriptions могут терять соединение (нужен reconnect механизм)
3. Нет pagination в списках (производительность на больших данных)
4. Отсутствует rate limiting для AI endpoints

---

## Contributing

### Development Workflow

1. Fork репозиторий
2. Создайте feature branch: `git checkout -b feature/amazing-feature`
3. Commit изменения: `git commit -m 'Add amazing feature'`
4. Push в branch: `git push origin feature/amazing-feature`
5. Откройте Pull Request

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Commit messages: Conventional Commits

### Testing

\`\`\`bash
# Unit tests (когда будут добавлены)
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check
\`\`\`

---

## License

MIT License - см. LICENSE файл

---

## Support

- Email: support@studysync.com
- GitHub Issues: [github.com/your-repo/issues](https://github.com)
- Discord: [discord.gg/studysync](https://discord.gg)

---

## Acknowledgments

- Next.js Team
- Vercel
- Supabase
- shadcn/ui
- Radix UI
- Google Classroom API

---

**Последнее обновление**: 3 Декабря 2024

**Версия документации**: 1.0.0
