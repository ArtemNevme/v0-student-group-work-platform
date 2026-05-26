"use client"

interface ProgressRingProps {
  progress: number
  completedTasks: number
  totalTasks: number
  size?: number
}

export function ProgressRing({ progress, completedTasks, totalTasks, size = 120 }: ProgressRingProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  // Color based on progress
  const getColor = () => {
    if (progress >= 100) return { stroke: "#10b981", bg: "#d1fae5", text: "text-emerald-600" }
    if (progress >= 75) return { stroke: "#3b82f6", bg: "#dbeafe", text: "text-blue-600" }
    if (progress >= 50) return { stroke: "#f59e0b", bg: "#fef3c7", text: "text-amber-600" }
    if (progress >= 25) return { stroke: "#f97316", bg: "#ffedd5", text: "text-orange-600" }
    return { stroke: "#6b7280", bg: "#f3f4f6", text: "text-gray-600" }
  }

  const colors = getColor()

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
            className="text-gray-100 dark:text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colors.text}`}>{Math.round(progress)}%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">complete</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {completedTasks} of {totalTasks} tasks
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{totalTasks - completedTasks} remaining</p>
      </div>
    </div>
  )
}
