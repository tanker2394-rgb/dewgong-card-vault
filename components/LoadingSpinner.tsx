import { Snowflake } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function LoadingSpinner({ size = 'md', label = 'Loading...' }: Props) {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-ice-400">
      <Snowflake className={clsx(sizes[size], 'animate-spin')} />
      {label && <p className="text-sm text-frost-400">{label}</p>}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="aspect-[2.5/3.5] shimmer-bg" />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded shimmer-bg w-3/4" />
        <div className="h-3 rounded shimmer-bg w-1/2" />
        <div className="h-5 rounded shimmer-bg w-1/4" />
      </div>
    </div>
  )
}
