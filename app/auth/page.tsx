import { AuthForm } from './AuthForm'

export default function AuthPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)' }}
    >
      {/* Background Dewgong silhouettes */}
      <div className="absolute -bottom-10 -right-10 w-72 h-72 opacity-10 pointer-events-none select-none">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute -top-8 -left-8 w-48 h-48 opacity-8 pointer-events-none select-none">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
          alt=""
          className="w-full h-full object-contain scale-x-[-1] rotate-12"
          style={{ opacity: 0.08 }}
        />
      </div>
      <div className="absolute top-1/4 right-8 w-24 h-24 pointer-events-none select-none hidden md:block"
        style={{ opacity: 0.06 }}>
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
          alt=""
          className="w-full h-full object-contain -rotate-6"
        />
      </div>

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(14,165,233,0.15) 0%, transparent 65%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
              alt="Dewgong"
              className="w-32 h-32 object-contain drop-shadow-2xl animate-float"
            />
            {/* Glow ring under Dewgong */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full blur-md"
              style={{ background: 'rgba(125,211,252,0.4)' }}
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Card Vault</h1>
            <p className="text-ice-200 text-sm mt-1">Your personal Pokémon TCG portfolio</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/30">
          <AuthForm />
        </div>

        <p className="text-center text-ice-300/60 text-xs mt-6">
          ❄ Powered by ice-type energy
        </p>
      </div>
    </div>
  )
}
