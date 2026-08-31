"use client"

interface ProgressRingProps {
  progress: number
  completedTasks: number
  totalTasks: number
  size?: number
}

export function ProgressRing({ progress, completedTasks, totalTasks, size = 120 }: ProgressRingProps) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const isComplete = progress >= 100
  const arcColor = isComplete ? "text-success" : "text-primary"

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${arcColor} transition-all duration-500 ease-out`}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-num text-[22px] font-semibold ${isComplete ? "text-success" : "text-foreground"}`}>
            {Math.round(progress)}%
          </span>
          <span className="text-xs text-muted-foreground">complete</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-foreground">
          <span className="font-num">{completedTasks}</span> of <span className="font-num">{totalTasks}</span> tasks
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-num">{totalTasks - completedTasks}</span> remaining
        </p>
      </div>
    </div>
  )
}
