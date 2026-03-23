import { AddCardForm } from './AddCardForm'

export default function AddCardPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-frost-800">Add a Card</h1>
        <p className="text-frost-400 text-sm mt-0.5">
          Search for a Pokémon card to auto-fill its info, then log what you paid.
        </p>
      </div>
      <AddCardForm />
    </div>
  )
}
