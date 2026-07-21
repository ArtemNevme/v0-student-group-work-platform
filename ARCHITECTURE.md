# StudySync - Архитектура

## Обзор

StudySync построен на современном стеке технологий с акцентом на производительность, безопасность и developer experience.

## High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Browser  │  │  Mobile  │  │ Desktop  │  │   PWA    │    │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘    │
│        │              │              │              │          │
└────────┼──────────────┼──────────────┼──────────────┼────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                             │
         ┌───────────────────┴────────────────────┐
         │                                        │
┌────────▼──────────┐                  ┌──────────▼─────────┐
│   Next.js 16      │                  │   Static Assets    │
│   App Router      │                  │   (Vercel CDN)     │
│                   │                  └────────────────────┘
│ ┌───────────────┐ │
│ │ Server        │ │
│ │ Components    │ │
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │ Server        │ │
│ │ Actions       │ │
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │ API Routes    │ │
│ └───────┬───────┘ │
└─────────┼─────────┘
          │
          ├────────────────┬────────────────┬──────────────┐
          │                │                │              │
┌─────────▼────────┐ ┌─────▼─────┐ ┌───────▼──────┐ ┌────▼─────┐
│   Supabase       │ │  Vercel   │ │   Google     │ │ Vercel   │
│   (PostgreSQL)   │ │   Blob    │ │  Classroom   │ │ AI SDK   │
│                  │ │           │ │     API      │ │          │
│ ┌──────────────┐ │ │           │ │              │ │          │
│ │  Auth        │ │ │           │ │              │ │          │
│ │  Database    │ │ │           │ │              │ │          │
│ │  Realtime    │ │ │           │ │              │ │          │
│ │  Storage     │ │ │           │ │              │ │          │
│ └──────────────┘ │ │           │ │              │ │          │
└──────────────────┘ └───────────┘ └──────────────┘ └──────────┘
\`\`\`

## Data Flow

### 1. Страница загружается

\`\`\`
User → Next.js Server → Supabase (fetch data) → Server Component → HTML → Browser
\`\`\`

### 2. Пользовательское действие

\`\`\`
User Click → Client Component → Server Action → Supabase → Response → UI Update
\`\`\`

### 3. Realtime обновление

\`\`\`
DB Change → Supabase Realtime → WebSocket → Client → UI Update
\`\`\`

### 4. Google Classroom синхронизация

\`\`\`
User Click → OAuth Flow → Get Token → Fetch GC Data → Parse → Upsert to DB
\`\`\`

## Layers

### 1. Presentation Layer (Components)

**Ответственность**:
- Отображение UI
- Обработка пользовательских событий
- Оптимистичные обновления

**Технологии**:
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

**Паттерны**:
- Server Components по умолчанию
- Client Components для интерактивности
- Composition over inheritance
- Props drilling минимизирован через Server Actions

### 2. Business Logic Layer (Server Actions)

**Ответственность**:
- Валидация данных
- Бизнес-логика
- Взаимодействие с БД
- Авторизация

**Файлы**:
- `lib/actions/*.ts`

**Паттерны**:
- Pure functions
- Error handling с try-catch
- TypeScript strict mode
- Zod validation

### 3. Data Layer (Supabase)

**Ответственность**:
- Хранение данных
- Аутентификация
- Row Level Security
- Realtime subscriptions

**Технологии**:
- PostgreSQL 15
- Supabase SDK
- SQL migrations

**Паттерны**:
- RLS для авторизации
- Foreign keys для integrity
- Indexes для производительности
- Triggers для автоматизации

### 4. Integration Layer

**Ответственность**:
- Внешние API
- OAuth flows
- File storage
- AI services

**Сервисы**:
- Google Classroom API
- Vercel Blob
- Vercel AI SDK

## Key Patterns

### 1. Server-First Architecture

**Принцип**: Максимум логики на сервере

**Преимущества**:
- Меньше JavaScript на клиенте
- Лучшая безопасность
- Проще caching
- Типобезопасность end-to-end

**Пример**:
\`\`\`typescript
// app/dashboard/page.tsx (Server Component)
import { getDashboardStats } from '@/lib/actions/dashboard'

export default async function DashboardPage() {
  const stats = await getDashboardStats() // Fetch на сервере
  return <StatsCards stats={stats} />
}
\`\`\`

### 2. Optimistic UI

**Принцип**: Мгновенный feedback, синхронизация после

**Реализация**:
\`\`\`typescript
async function handleComplete(taskId: string) {
  // 1. Оптимистичное обновление UI
  setTasks(prev => prev.map(t => 
    t.id === taskId ? { ...t, status: 'completed' } : t
  ))
  
  // 2. Синхронизация с сервером
  try {
    await completeTask(taskId)
  } catch (error) {
    // 3. Rollback при ошибке
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'in_progress' } : t
    ))
    toast.error('Failed to complete task')
  }
}
\`\`\`

### 3. Error Boundaries

**Принцип**: Graceful degradation

**Реализация**:
\`\`\`typescript
// app/error.tsx
'use client'

export default function Error({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
\`\`\`

### 4. Realtime Updates

**Принцип**: Live collaboration

**Реализация**:
\`\`\`typescript
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `group_id=eq.${groupId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new as Message])
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [groupId])
\`\`\`

### 5. Caching Strategy

**Принцип**: Агрессивное кеширование с селективной инвалидацией

**Next.js Caching**:
\`\`\`typescript
// Статические страницы (ISR)
export const revalidate = 3600 // 1 час

// Динамические страницы (force dynamic)
export const dynamic = 'force-dynamic'

// Server Actions (revalidatePath)
'use server'
import { revalidatePath } from 'next/cache'

export async function createAssignment(data: CreateAssignmentInput) {
  // ... create assignment
  revalidatePath('/dashboard/my-tasks')
}
\`\`\`

### 6. Type Safety

**Принцип**: Типизация от БД до UI

**Реализация**:
\`\`\`typescript
// Database types (generated from Supabase)
export type Assignment = Database['public']['Tables']['assignments']['Row']

// Zod schemas
const createAssignmentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000),
  deadline: z.string().datetime().optional()
})

// Type-safe server action
export async function createAssignment(
  input: z.infer<typeof createAssignmentSchema>
): Promise<Assignment> {
  const validated = createAssignmentSchema.parse(input)
  // ...
}
\`\`\`

## Security Architecture

### 1. Authentication Flow

\`\`\`
User → Next.js → Supabase Auth → JWT Token → HTTP-only Cookie → Middleware
\`\`\`

### 2. Authorization (RLS)

\`\`\`
Query → Supabase → RLS Policy Check → auth.uid() → Allow/Deny
\`\`\`

### 3. Input Validation

\`\`\`
User Input → Zod Schema → Parse → Server Action → DB
\`\`\`

### 4. XSS Protection

\`\`\`
User Content → React Escaping → Safe HTML → Browser
\`\`\`

### 5. CSRF Protection

\`\`\`
Request → Next.js CSRF Token → Validate → Execute
\`\`\`

## Performance Architecture

### 1. Rendering Strategy

- **Static**: Landing page, Terms, Privacy
- **SSR**: Dashboard pages (Server Components)
- **ISR**: Public profiles (revalidate: 3600)
- **CSR**: Realtime chat, Calendar

### 2. Data Loading

- **Parallel**: Multiple Server Components fetch simultaneously
- **Sequential**: Waterfall only when necessary
- **Streaming**: Suspense boundaries for progressive loading

### 3. Bundle Optimization

- **Code Splitting**: Dynamic imports для тяжелых компонентов
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Next.js Image component

### 4. Database Optimization

- **Indexes**: На foreign keys и часто запрашиваемые поля
- **Pagination**: Limit/offset для больших списков
- **Selective queries**: SELECT только нужные поля
- **Connection pooling**: Supabase Pooler

## Scalability Architecture

### Horizontal Scaling

**Next.js**:
- Vercel автоматически масштабирует edge functions
- Serverless functions scale to zero
- CDN для статических ресурсов

**Database**:
- Supabase read replicas для read-heavy workloads
- Connection pooler для большого количества connections
- PostgreSQL partitioning для больших таблиц

### Vertical Scaling

**Database**:
- Upgrade Supabase plan (больше CPU, RAM, storage)
- Optimized queries (EXPLAIN ANALYZE)
- Indexes на часто запрашиваемые поля

**API**:
- Rate limiting на AI endpoints
- Caching на Server Actions
- CDN для статических ресурсов

## Monitoring & Observability

### Metrics

**Application**:
- Error rate
- Response time
- User activity

**Database**:
- Query performance
- Connection pool usage
- Slow queries

**Infrastructure**:
- Function invocations
- Edge network latency
- CDN cache hit rate

### Logging

**Client**:
\`\`\`typescript
console.error('[v0] Error:', error)
\`\`\`

**Server**:
\`\`\`typescript
console.log('[v0] Processing assignment:', assignmentId)
\`\`\`

**Database**:
- Supabase logs
- Query logs

### Error Tracking

- Next.js error boundaries
- Try-catch в Server Actions
- Supabase error handling

---

**Последнее обновление**: 3 Декабря 2024
