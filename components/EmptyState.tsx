import Link from 'next/link'

interface Props {
  title?: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({
  title = 'Your vault is empty',
  description = 'Add your first card to get started!',
  action = { label: 'Add a Card', href: '/add' },
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="animate-float">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
          alt="Dewgong"
          className="w-32 h-32 object-contain drop-shadow-lg"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-frost-700">{title}</h3>
        <p className="text-frost-400 text-sm mt-1">{description}</p>
      </div>
      {action && (
        <Link href={action.href} className="ice-button">
          {action.label}
        </Link>
      )}
    </div>
  )
}
