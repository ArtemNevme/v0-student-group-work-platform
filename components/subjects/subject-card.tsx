import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  FolderOpen,
  BookOpen,
  GraduationCap,
  Calculator,
  Microscope,
  Palette,
  Music,
  Globe,
  Code,
  Scale,
  TrendingUp,
  Briefcase,
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

function renderSubjectIcon(icon?: string) {
  if (!icon) return "📚"

  // Check if it's an emoji (simple heuristic: emojis are typically 1-2 characters and have high Unicode values)
  const isEmoji = icon.length <= 2 && /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(icon)

  if (isEmoji) {
    return icon
  }

  // Map text icon names to Lucide icons
  const iconMap: Record<string, any> = {
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

  const IconComponent = iconMap[icon.toLowerCase()] || BookOpen
  return <IconComponent className="h-5 w-5" />
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const assignmentsCount = subject.assignments_count ?? subject.assignments?.[0]?.count ?? 0
  const materialsCount = subject.materials_count ?? subject.course_materials?.[0]?.count ?? 0

  return (
    <Link href={`/dashboard/subjects/${subject.id}`}>
      <Card
        className="hover:shadow-md transition-all hover:scale-[1.02] border-l-4 cursor-pointer h-full"
        style={{ borderLeftColor: subject.color || "#3B82F6" }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div
              className="rounded-lg p-2.5 text-lg flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: `${subject.color || "#3B82F6"}20` }}
            >
              {renderSubjectIcon(subject.icon)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-tight line-clamp-2">{subject.name}</CardTitle>
              {subject.teacher_name && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{subject.teacher_name}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>{assignmentsCount} assignments</span>
            </div>
            {materialsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4 flex-shrink-0" />
                <span>{materialsCount} materials</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
