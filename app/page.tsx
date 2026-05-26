import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { Calendar, MessageSquare, Trophy, Sparkles, CheckCircle, Users, Zap, UserPlus, FileText, Brain, Rocket } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg text-white">✦</span>
            </div>
            StudySinc
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 px-6 py-20 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-1/4 top-0 h-96 w-96 rounded-full bg-blue-100 opacity-50 blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-96 w-96 rounded-full bg-purple-100 opacity-50 blur-3xl" />
        </div>

        <div className="container mx-auto">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            {/* Left content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                <Sparkles className="h-4 w-4" />
                AI-Powered Collaboration
              </div>

              <h1 className="mb-6 text-balance text-5xl font-bold leading-tight text-gray-900 md:text-6xl lg:text-7xl">
                Collaborate Smarter, Not Harder
              </h1>
              <p className="mb-8 text-pretty text-lg leading-relaxed text-gray-600 md:text-xl">
                The all-in-one platform for student group projects. Track deadlines, communicate seamlessly, and
                leverage AI to plan your work effectively.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-blue-600 text-base hover:bg-blue-700">
                  <Link href="/auth/sign-up">
                    Get Started Free
                    <Zap className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right illustration */}
            <div className="relative">
              <img
                src="/images/design-mode/unnamed.png"
                alt="Students collaborating"
                className="h-auto w-full rounded-2xl object-contain shadow-2xl"
              />
              {/* Floating elements */}
              <div className="absolute -right-4 top-8 rounded-lg bg-white p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Task Completed!</span>
                </div>
              </div>
              <div className="absolute -left-4 bottom-8 rounded-lg bg-white p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">3 members online</span>
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
            <h2 className="mb-4 text-balance text-4xl font-bold text-gray-900 md:text-5xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-gray-600">
              Get started in minutes and transform the way your team collaborates on group projects.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line - hidden on mobile */}
            <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 lg:block" />

            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <UserPlus className="h-10 w-10 text-white" />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600 shadow-md">
                  1
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Create or Join a Group</h3>
              <p className="leading-relaxed text-gray-600">
                Start by creating a new group for your project or join an existing one through an invitation link.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-purple-600 shadow-md">
                  2
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Set Up Your Assignment</h3>
              <p className="leading-relaxed text-gray-600">
                Add assignment details, upload project files, set deadlines, and link to your work documents.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <Brain className="h-10 w-10 text-white" />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-orange-600 shadow-md">
                  3
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Plan with AI or Manually</h3>
              <p className="leading-relaxed text-gray-600">
                Let AI analyze your files and create a smart work plan, or build your task list manually.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <Rocket className="h-10 w-10 text-white" />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-green-600 shadow-md">
                  4
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Collaborate & Complete</h3>
              <p className="leading-relaxed text-gray-600">
                Chat in real-time, track progress, share resources, and complete tasks together efficiently.
              </p>
            </div>
          </div>

          {/* CTA below steps */}
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-blue-600 text-base hover:bg-blue-700">
              <Link href="/auth/sign-up">
                Start Your First Project
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="px-6 py-20 lg:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance text-4xl font-bold text-gray-900 md:text-5xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-gray-600">
              StudySinc offers a comprehensive suite of tools designed to enhance your group work experience and boost
              productivity.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Deadline Tracking</h3>
              <p className="leading-relaxed text-gray-600">
                Stay on top of your project timelines with clear, shared deadlines and automated reminders.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Seamless Communication</h3>
              <p className="leading-relaxed text-gray-600">
                Communicate effectively with built-in chat and file sharing, keeping all discussions in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Gamified Progress</h3>
              <p className="leading-relaxed text-gray-600">
                Boost motivation with gamified progress tracking and rewards for milestones achieved.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">AI-Powered Planning</h3>
              <p className="leading-relaxed text-gray-600">
                Let AI optimize your project plan with smart task suggestions and balanced workload distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gradient-to-br from-gray-50 to-blue-50 px-6 py-20 lg:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance text-4xl font-bold text-gray-900 md:text-5xl">
              Loved by Students Everywhere
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-gray-600">
              See what students are saying about how StudySinc transformed their group work experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <p className="mb-6 leading-relaxed text-gray-700">
                "StudySinc completely changed how our team works together. The AI work planner saved us hours of
                planning meetings!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Martinez</div>
                  <div className="text-sm text-gray-600">Computer Science Student</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <p className="mb-6 leading-relaxed text-gray-700">
                "The gamification features keep everyone motivated. We've never been this productive with group projects
                before!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-semibold text-purple-600">
                  JC
                </div>
                <div>
                  <div className="font-semibold text-gray-900">James Chen</div>
                  <div className="text-sm text-gray-600">Business Student</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <p className="mb-6 leading-relaxed text-gray-700">
                "Finally, a platform that actually understands student needs. The deadline tracking and reminders are
                lifesavers!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-600">
                  EP
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Emily Patel</div>
                  <div className="text-sm text-gray-600">Engineering Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-16 text-center shadow-2xl md:px-16">
            <h2 className="mb-4 text-balance text-4xl font-bold text-white md:text-5xl">
              Ready to Elevate Your Group Work?
            </h2>
            <p className="mb-8 text-pretty text-lg leading-relaxed text-blue-50">
              Join thousands of students who are already using StudySinc to achieve academic success. Start
              collaborating smarter today.
            </p>
            <Button asChild size="lg" className="bg-white text-base text-blue-600 hover:bg-gray-100">
              <Link href="/auth/sign-up">
                Get Started Free
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-blue-100">No credit card required • Free forever for students</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 px-6 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Brand */}
            <div className="text-center md:text-left">
              <Link
                href="/"
                className="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-gray-900 md:justify-start"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg text-white">✦</span>
                </div>
                StudySinc
              </Link>
              <p className="text-sm leading-relaxed text-gray-600">Empowering students to collaborate smarter.</p>
            </div>

            {/* Auth Links */}
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            <p>© 2025 StudySinc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
