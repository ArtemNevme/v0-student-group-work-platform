import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MessageSquare, Trophy, Sparkles, Zap, UserPlus, FileText, Brain, Rocket, Flame, Check } from 'lucide-react'

// Уровни активности для мини-графа (0–4), 7 дней × 8 недель — демо-данные
const ACTIVITY_LEVELS = [
  0, 1, 2, 3, 2, 4, 1,
  1, 2, 0, 3, 4, 2, 1,
  2, 3, 4, 1, 0, 2, 3,
  1, 0, 2, 4, 3, 1, 2,
  0, 2, 3, 4, 2, 3, 1,
  1, 3, 2, 0, 1, 2, 4,
  2, 1, 3, 2, 4, 1, 0,
  3, 2, 1, 4, 2, 0, 1,
]

const ACTIVITY_CELL_CLASS = [
  "bg-secondary",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
]

function Logo() {
  return (
    <>
      <span className="grid h-[26px] w-[26px] place-items-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground">
        S
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[-0.01em]">StudySinc</span>
    </>
  )
}

export default function LandingContent() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="container mx-auto">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            {/* Left content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-chip bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-fg">
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                AI-Powered Collaboration
              </div>

              <h1 className="mb-6 text-balance font-display text-5xl font-semibold leading-[1.15] tracking-[-0.02em] md:text-6xl">
                Collaborate Smarter, Not Harder
              </h1>
              <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                The all-in-one platform for student group projects. Track deadlines, communicate seamlessly, and
                leverage AI to plan your work effectively.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="text-base">
                  <Link href="/auth/sign-up">
                    Get Started Free
                    <Zap className="ml-2 h-4 w-4" strokeWidth={1.75} />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: мини-мок продукта вместо стоковой иллюстрации */}
            <div className="relative">
              <div className="rounded-card border border-border bg-card p-4">
                {/* XP + streak */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-chip bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-fg">
                    <Zap className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span className="font-num">2,450</span> XP
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-chip bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-fg">
                    <Flame className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span className="font-num">14</span>
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground">Level <span className="font-num">7</span></span>
                </div>

                {/* Задачи */}
                <div className="mb-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2.5 rounded-control px-2 py-2 hover:bg-secondary">
                    <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-[5px] border-[1.5px] border-border" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">Lab #4: Indexes and Transactions</p>
                      <p className="text-[11px] text-muted-foreground">Databases · SE-301</p>
                    </div>
                    <span className="shrink-0 rounded-chip bg-accent-soft px-2 py-0.5 font-num text-[11px] font-medium text-accent-fg">
                      today
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-control px-2 py-2 hover:bg-secondary">
                    <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-[5px] border-[1.5px] border-border" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">Review Maria's project plan</p>
                      <p className="text-[11px] text-muted-foreground">SE-301 · Software Engineering</p>
                    </div>
                    <span className="shrink-0 rounded-chip bg-danger/10 px-2 py-0.5 font-num text-[11px] font-medium text-danger">
                      overdue
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-control px-2 py-2 hover:bg-secondary">
                    <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-[5px] bg-success text-on-accent">
                      <Check className="h-[11px] w-[11px]" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-muted-foreground line-through decoration-border">
                        Submit English essay draft
                      </p>
                      <p className="text-[11px] text-muted-foreground">English · personal</p>
                    </div>
                    <span className="shrink-0 rounded-chip bg-secondary px-2 py-0.5 font-num text-[11px] font-medium text-success">
                      +40 XP
                    </span>
                  </div>
                </div>

                {/* Граф активности */}
                <div className="mb-4 rounded-control border border-border p-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Activity
                  </p>
                  <div
                    className="grid w-max grid-rows-7 gap-[3px] [grid-auto-flow:column] [grid-auto-columns:10px]"
                    aria-hidden="true"
                  >
                    {ACTIVITY_LEVELS.map((level, index) => (
                      <span
                        key={index}
                        className={`h-[10px] w-[10px] rounded-[2px] ${ACTIVITY_CELL_CLASS[level]}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Рейтинг */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2.5 rounded-control px-2 py-1.5">
                    <span className="w-7 shrink-0 font-num text-xs font-semibold text-accent-fg">#1</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[10.5px] font-semibold">
                      MS
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">Maria Sokolova</span>
                    <span className="shrink-0 font-num text-xs text-muted-foreground">3,120</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-control bg-accent-soft px-2 py-1.5">
                    <span className="w-7 shrink-0 font-num text-xs font-semibold text-muted-foreground">#2</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[10.5px] font-semibold text-primary-foreground">
                      AK
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                      Artem Kovalev <span className="font-medium text-muted-foreground">· you</span>
                    </span>
                    <span className="shrink-0 font-num text-xs font-semibold text-accent-fg">2,450</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance font-display text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Get started in minutes and transform the way your team collaborates on group projects.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line - hidden on mobile */}
            <div className="absolute left-0 right-0 top-12 hidden h-px bg-border lg:block" />

            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-card">
                <UserPlus className="h-9 w-9 text-muted-foreground" strokeWidth={1.75} />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-accent-soft font-num text-sm font-semibold text-accent-fg">
                  1
                </div>
              </div>
              <h3 className="mb-3 font-display text-xl font-medium tracking-[-0.01em]">Create or Join a Group</h3>
              <p className="leading-relaxed text-muted-foreground">
                Start by creating a new group for your project or join an existing one through an invitation link.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-card">
                <FileText className="h-9 w-9 text-muted-foreground" strokeWidth={1.75} />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-accent-soft font-num text-sm font-semibold text-accent-fg">
                  2
                </div>
              </div>
              <h3 className="mb-3 font-display text-xl font-medium tracking-[-0.01em]">Set Up Your Assignment</h3>
              <p className="leading-relaxed text-muted-foreground">
                Add assignment details, upload project files, set deadlines, and link to your work documents.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-card">
                <Brain className="h-9 w-9 text-muted-foreground" strokeWidth={1.75} />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-accent-soft font-num text-sm font-semibold text-accent-fg">
                  3
                </div>
              </div>
              <h3 className="mb-3 font-display text-xl font-medium tracking-[-0.01em]">Plan with AI or Manually</h3>
              <p className="leading-relaxed text-muted-foreground">
                Let AI analyze your files and create a smart work plan, or build your task list manually.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-card">
                <Rocket className="h-9 w-9 text-muted-foreground" strokeWidth={1.75} />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-accent-soft font-num text-sm font-semibold text-accent-fg">
                  4
                </div>
              </div>
              <h3 className="mb-3 font-display text-xl font-medium tracking-[-0.01em]">Collaborate & Complete</h3>
              <p className="leading-relaxed text-muted-foreground">
                Chat in real-time, track progress, share resources, and complete tasks together efficiently.
              </p>
            </div>
          </div>

          {/* CTA below steps */}
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/sign-up">
                Start Your First Project
                <Zap className="ml-2 h-4 w-4" strokeWidth={1.75} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="px-6 py-20 lg:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance font-display text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              StudySinc offers a comprehensive suite of tools designed to enhance your group work experience and boost
              productivity.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-card border border-border bg-card p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-control bg-secondary">
                <Calendar className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 font-display text-lg font-medium tracking-[-0.01em]">Deadline Tracking</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Stay on top of your project timelines with clear, shared deadlines and automated reminders.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-card border border-border bg-card p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-control bg-secondary">
                <MessageSquare className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 font-display text-lg font-medium tracking-[-0.01em]">Seamless Communication</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Communicate effectively with built-in chat and file sharing, keeping all discussions in one place.
              </p>
            </div>

            {/* Feature 3 — геймификация, единственная акцентная иконка */}
            <div className="rounded-card border border-border bg-card p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-control bg-accent-soft">
                <Trophy className="h-5 w-5 text-accent-fg" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 font-display text-lg font-medium tracking-[-0.01em]">Gamified Progress</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Boost motivation with gamified progress tracking and rewards for milestones achieved.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-card border border-border bg-card p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-control bg-secondary">
                <Sparkles className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 font-display text-lg font-medium tracking-[-0.01em]">AI-Powered Planning</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Let AI optimize your project plan with smart task suggestions and balanced workload distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="border-y border-border bg-secondary/40 px-6 py-20 lg:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance font-display text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Loved by Students Everywhere
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              See what students are saying about how StudySinc transformed their group work experience.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-card border border-border bg-card p-6">
              <p className="mb-6 leading-relaxed text-foreground">
                "StudySinc completely changed how our team works together. The AI work planner saved us hours of
                planning meetings!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                  SM
                </div>
                <div>
                  <div className="font-semibold">Sarah Martinez</div>
                  <div className="text-sm text-muted-foreground">Computer Science Student</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-card border border-border bg-card p-6">
              <p className="mb-6 leading-relaxed text-foreground">
                "The gamification features keep everyone motivated. We've never been this productive with group projects
                before!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                  JC
                </div>
                <div>
                  <div className="font-semibold">James Chen</div>
                  <div className="text-sm text-muted-foreground">Business Student</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-card border border-border bg-card p-6">
              <p className="mb-6 leading-relaxed text-foreground">
                "Finally, a platform that actually understands student needs. The deadline tracking and reminders are
                lifesavers!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                  EP
                </div>
                <div>
                  <div className="font-semibold">Emily Patel</div>
                  <div className="text-sm text-muted-foreground">Engineering Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-card border border-border bg-accent-soft px-8 py-16 text-center md:px-16">
            <h2 className="mb-4 text-balance font-display text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Ready to Elevate Your Group Work?
            </h2>
            <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">
              Join thousands of students who are already using StudySinc to achieve academic success. Start
              collaborating smarter today.
            </p>
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/sign-up">
                Get Started Free
                <Zap className="ml-2 h-4 w-4" strokeWidth={1.75} />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">No credit card required • Free forever for students</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Brand */}
            <div className="text-center md:text-left">
              <Link href="/" className="mb-2 flex items-center justify-center gap-2.5 md:justify-start">
                <Logo />
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">Empowering students to collaborate smarter.</p>
            </div>

            {/* Auth Links */}
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 StudySinc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
