import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'green' | 'red' | 'purple'
}

const colorMap = {
  blue:   { icon: 'text-ice-500',    bg: 'bg-ice-50',    border: 'border-ice-100' },
  green:  { icon: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  red:    { icon: 'text-red-400',    bg: 'bg-red-50',    border: 'border-red-100' },
  purple: { icon: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-100' },
}

export function StatCard({ label, value, sub, icon: Icon, trend = 'neutral', color = 'blue' }: Props) {
  const colors = colorMap[color]

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', colors.bg, colors.border)}>
          <Icon className={clsx('w-5 h-5', colors.icon)} />
        </div>
        {sub && (
          <span className={clsx(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            trend === 'up'      ? 'bg-emerald-100 text-emerald-700' :
            trend === 'down'    ? 'bg-red-100 text-red-600' :
            'bg-frost-100 text-frost-500'
          )}>
            {sub}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-frost-800">{value}</div>
        <div className="text-sm text-frost-400 mt-0.5">{label}</div>
      </div>
    </div>
  )
}
