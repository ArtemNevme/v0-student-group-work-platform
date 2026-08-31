import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Briefcase,
  Calculator,
  Code,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  Microscope,
  Music,
  Palette,
  Scale,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

interface SubjectCardProps {
  subject: {
    id: string
    name: string
    description?: string
    color?: string
    icon?: string
    teacher_name?: string
    google_course_id?: string
    assignments?: { count: number }[]
    course_materials?: { count: number }[]
    assignments_count?: number
    materials_count?: number
  }
}

function getSubjectIcon(icon?: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    "book-open": BookOpen,
    "graduation-cap": GraduationCap,
    calculator: Calculator,
    microscope: Microscope,
    palette: Palette,
    music: Music,
    globe: Globe,
    code: Code,
    scale: Scale,
    "trending-up": TrendingUp,
    briefcase: Briefcase,
  }

  return iconMap[icon?.toLowerCase() || ""] || BookOpen
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const assignmentsCount = subject.assignments_count ?? subject.assignments?.[0]?.count ?? 0
  const materialsCount = subject.materials_count ?? subject.course_materials?.[0]?.count ?? 0
  const Icon = getSubjectIcon(subject.icon)

  return (
    <Link href={`/dashboard/subjects/${subject.id}`}>
      <Card className="h-full cursor-pointer border-l-4 border-l-accent transition-colors duration-150 hover:bg-secondary">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-control bg-accent-soft p-2.5 text-accent-fg">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-2 text-base leading-tight">{subject.name}</CardTitle>
              {subject.teacher_name && <p className="mt-1 truncate text-xs text-muted-foreground">{subject.teacher_name}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span><span className="font-num">{assignmentsCount}</span> assignments</span>
            </div>
            {materialsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span><span className="font-num">{materialsCount}</span> materials</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
