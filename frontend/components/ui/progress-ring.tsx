'use client'

interface ProgressRingProps {
  value: number      // 0-100
  size?: number      // px
  strokeWidth?: number
  label?: string
  color?: string
}

export default function ProgressRing({ value, size = 80, strokeWidth = 6, label, color }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(value, 100) / 100) * circumference

  const getColor = () => {
    if (color) return color
    if (value >= 80) return '#34d399'
    if (value >= 60) return '#5eead4'
    if (value >= 40) return '#fbbf24'
    return '#f87171'
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--aurora-muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-foreground">{Math.round(value)}%</span>
        {label && <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>}
      </div>
    </div>
  )
}
