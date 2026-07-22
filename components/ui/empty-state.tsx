import * as React from "react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type EmptyStateActionConfig =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never }

type EmptyStateAction = React.ReactNode | EmptyStateActionConfig

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  variant?: "dashed" | "card"
  className?: string
}

function isActionConfig(action: EmptyStateAction): action is EmptyStateActionConfig {
  return action !== null && typeof action === "object" && "label" in action
}

function EmptyStateActionButton({ action }: { action: EmptyStateActionConfig }) {
  if (action.href) {
    return (
      <Button asChild variant="default" className="gap-2">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    )
  }

  return (
    <Button variant="default" onClick={action.onClick} className="gap-2">
      {action.label}
    </Button>
  )
}

function EmptyStateActionOutlineButton({ action }: { action: EmptyStateActionConfig }) {
  if (action.href) {
    return (
      <Button asChild variant="outline" className="gap-2">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={action.onClick} className="gap-2">
      {action.label}
    </Button>
  )
}

function renderAction(action: EmptyStateAction | undefined) {
  if (!action) return null
  if (isActionConfig(action)) {
    return <EmptyStateActionButton action={action} />
  }
  return <>{action}</>
}

function renderSecondaryAction(action: EmptyStateAction | undefined) {
  if (!action) return null
  if (isActionConfig(action)) {
    return <EmptyStateActionOutlineButton action={action} />
  }
  return <>{action}</>
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "dashed",
  className,
}: EmptyStateProps) {
  return (
    <Empty
      className={cn(
        "rounded-card",
        variant === "dashed"
          ? "border-2 border-dashed border-border bg-surface"
          : "border border-border bg-surface",
        className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-11 rounded-control bg-accent-soft text-accent-fg"
        >
          <Icon className="size-6" strokeWidth={1.75} />
        </EmptyMedia>
        <EmptyTitle className="font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
          {title}
        </EmptyTitle>
        {description && (
          <EmptyDescription className="text-sm text-muted-foreground">
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {(action || secondaryAction) && (
        <EmptyContent className="flex-row flex-wrap justify-center gap-3">
          {renderAction(action)}
          {renderSecondaryAction(secondaryAction)}
        </EmptyContent>
      )}
    </Empty>
  )
}

export type { EmptyStateActionConfig }
export { isActionConfig }
