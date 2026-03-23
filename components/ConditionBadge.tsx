import { clsx } from 'clsx'
import type { Condition } from '@/types/database'

const labels: Record<Condition, string> = {
  NM: 'Near Mint',
  LP: 'Lightly Played',
  MP: 'Moderately Played',
  HP: 'Heavily Played',
  DMG: 'Damaged',
}

interface Props {
  condition: Condition
  showFull?: boolean
}

export function ConditionBadge({ condition, showFull = false }: Props) {
  return (
    <span className={clsx('condition-badge', `condition-${condition}`)}>
      {showFull ? labels[condition] : condition}
    </span>
  )
}

export const CONDITIONS: Condition[] = ['NM', 'LP', 'MP', 'HP', 'DMG']
export { labels as CONDITION_LABELS }
