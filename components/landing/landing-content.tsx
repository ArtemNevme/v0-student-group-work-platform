"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MessageSquare,
  Trophy,
  Sparkles,
  Zap,
  UserPlus,
  FileText,
  Brain,
  Rocket,
  ArrowRight,
  CheckSquare,
  Users,
  BarChart3,
  Check,
  Flame,
} from "lucide-react"

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
      <span className="grid h-[26px] w-[26px] place-items-center rounded-control bg-primary font-display text-sm font-semibold text-primary-foreground">
        S
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[-0.01em]">StudySinc</span>
    </>
  )
}

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#stats", label: "Stats" },
]

const features = [
  {
    icon: Calendar,
    title: "Shared deadlines",
    description: "Keep the whole group on the same timeline with clear due dates and progress tracking.",
  },
  {
    icon: MessageSquare,
    title: "Group chat",
    description: "Discuss tasks, share files, and make decisions without switching between apps.",
  },
  {
    icon: Trophy,
    title: "Gamified progress",
    description: "XP, streaks, and leaderboards turn coursework into a motivating team experience.",
    accent: true,
  },
  {
    icon: Sparkles,
    title: "AI planning",
    description: "Let AI break assignments into manageable steps and suggest a balanced workload.",
  },
]

const steps = [
  {
    step: "01",
    title: "Create a team",
    description: "Set up a group for your course, invite classmates by link, and assign roles.",
  },
  {
    step: "02",
    title: "Plan the work",
    description: "Add assignments, deadlines, and tasks — manually or with AI assistance.",
  },
  {
    step: "03",
    title: "Finish together",
    description: "Track progress, chat, and celebrate when the project is submitted on time.",
  },
]

const stats = [
  { value: "10,000+", label: "student teams" },
  { value: "250+", label: "universities" },
  { value: "1M+", label: "tasks completed" },
]

const universities = ["MIT", "Stanford", "Oxford", "TU Munich", "Tsinghua"]

export default function LandingContent() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-control px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

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

      <main>
        {/* Hero */}
        <section className="px-6 py-20 lg:py-28">
          <div className="container mx-auto">
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <span className="mb-6 inline-flex items-center gap-2 rounded-chip bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-fg">
                  <Users className="h-4 w-4" strokeWidth={1.75} />
                  For student teams
                </span>

                <h1 className="mb-6 text-balance font-display text-4xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-5xl lg:text-[3.25rem]">
                  Group projects without the chaos
                </h1>
                <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">
                  Track tasks, share deadlines, and keep everyone accountable in one calm workspace. No scattered chats, no missed assignments.
                </p>

                <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Button asChild size="lg" className="text-base">
                    <Link href="/auth/sign-up">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.75} />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base">
                    <a href="#features">Learn more</a>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Free for study groups. No credit card required.</p>
              </div>

              {/* Product preview */}
              <div className="relative">
                <div className="rounded-card border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-foreground">PI-301 · Software Engineering</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">2 days left</span>
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-chip bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-fg">
                      <Zap className="h-3.5 w-3.5" strokeWidth={1.75} />
                      <span className="font-num">2,450</span> XP
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-chip bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-fg">
                      <Flame className="h-3.5 w-3.5" strokeWidth={1.75} />
                      <span className="font-num">12</span>
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      Level <span className="font-num">7</span>
                    </span>
                  </div>

                  <div className="mb-4 flex flex-col gap-1">
                    {[
                      { title: "Lab #4: Indexes and Transactions", tag: "today", done: false },
                      { title: "Review Maria's project plan", tag: "overdue", done: false },
                      { title: "Submit English essay draft", tag: "+40 XP", done: true },
                    ].map((task, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-control px-2 py-2 hover:bg-secondary"
                      >
                        <span
                          className={`grid h-[17px] w-[17px] shrink-0 place-items-center rounded-[5px] border-[1.5px] ${
                            task.done ? "border-transparent bg-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {task.done && <Check className="h-[11px] w-[11px]" strokeWidth={2.5} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-[13px] font-medium ${task.done ? "text-muted-foreground line-through decoration-border" : "text-foreground"}`}>
                            {task.title}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-chip px-2 py-0.5 font-num text-[11px] font-medium ${
                            task.tag === "today"
                              ? "bg-accent-soft text-accent-fg"
                              : task.tag === "overdue"
                                ? "bg-danger/10 text-danger"
                                : "bg-secondary text-success"
                          }`}
                        >
                          {task.tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 rounded-control border border-border p-3">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Activity</p>
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
                        Artem K. <span className="font-medium text-muted-foreground">· you</span>
                      </span>
                      <span className="shrink-0 font-num text-xs font-semibold text-accent-fg">2,450</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-border bg-secondary/40 px-6 py-20 lg:py-28">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="mb-4 text-balance font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Everything to finish on time
              </h2>
              <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                A focused set of tools that do not try to replace the entire internet.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <div key={i} className="rounded-card border border-border bg-card p-6">
                  <div
                    className={`mb-5 flex h-11 w-11 items-center justify-center rounded-control ${
                      feature.accent ? "bg-accent-soft text-accent-fg" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-medium tracking-[-0.01em]">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-6 py-20 lg:py-28">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-14 max-w-2xl">
              <h2 className="mb-4 text-balance font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Easier than explaining in a messenger
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((item, i) => (
                <div key={i} className="relative">
                  <span className="font-num text-3xl font-bold text-muted-foreground/40">{item.step}</span>
                  <h3 className="mt-2 font-display text-xl font-medium tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="border-y border-border bg-secondary/40 px-6 py-20 lg:py-28">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">Trusted by teams worldwide</h2>
              <span className="text-sm text-muted-foreground">Numbers are illustrative placeholders.</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat, i) => (
                <div key={i} className="rounded-card border border-border bg-card p-6">
                  <div className="font-num text-4xl font-semibold tracking-tight text-accent-fg">{stat.value}</div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="px-6 py-16 lg:py-20">
          <div className="container mx-auto max-w-6xl">
            <p className="text-center text-sm font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Used by students at
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {universities.map((name) => (
                <span
                  key={name}
                  className="rounded-chip border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-20 lg:pb-28">
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-card bg-primary px-8 py-14 text-center md:px-16">
              <h2 className="mb-4 text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-primary-foreground sm:text-4xl">
                Start your next project calmly
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/90">
                Create a team in a minute. No cards, no complicated setup — just a quiet space for focused work.
              </p>
              <Button asChild size="lg" variant="secondary" className="text-base">
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.75} />
                </Link>
              </Button>
              <p className="mt-4 text-sm text-primary-foreground/80">Free for study groups up to 6 people.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <Link href="/" className="mb-2 flex items-center justify-center gap-2.5 md:justify-start">
                <Logo />
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">Empowering students to collaborate smarter.</p>
            </div>

            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/privacy">Privacy</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/terms">Terms</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} StudySinc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
