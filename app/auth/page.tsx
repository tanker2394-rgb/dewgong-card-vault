import { AuthForm } from './AuthForm'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-dewgong-header flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
            alt="Dewgong"
            className="w-28 h-28 object-contain drop-shadow-2xl animate-float"
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Dewgong Card Vault</h1>
            <p className="text-ice-200 text-sm mt-1">Your personal Pokémon TCG portfolio</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
