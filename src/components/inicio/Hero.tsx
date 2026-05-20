import React from 'react'

interface HeroProps {
    searchTerm: string
    setSearchTerm: (val: string) => void
    handleSearch: (e: React.FormEvent) => void
    loading: boolean
}

export const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm, handleSearch, loading }) => {
    return (
        <header className="relative z-10 pt-12 md:pt-24 pb-12 md:pb-20 px-6 text-center max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black mb-6 leading-tight uppercase">
                TU PRÓXIMA <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
                    AVENTURA GAMER
                </span> <br className="hidden sm:block" />
                AL MEJOR PRECIO
            </h1>
            <p className="text-purple-200/60 text-sm md:text-lg max-w-xl mx-auto mb-10 md:mb-14 font-medium px-4">
                Comparamos los precios de las tiendas de videojuegos para que tú solo te preocupes de jugar.
                Simple, rápido y 100% gratuito.
            </p>

            {/* Buscador */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group px-4 md:px-0" role="search">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-15 group-focus-within:opacity-30 transition-opacity"></div>
                <div className="relative flex items-center bg-[#150c2b]/90 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 md:p-2 shadow-2xl">
                    <div className="hidden sm:flex pl-4 text-purple-400/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <label htmlFor="game-search" className="visually-hidden">Buscar videojuegos</label>
                    <input
                        id="game-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="¿Qué quieres jugar hoy?"
                        className="w-full px-4 md:px-6 py-2.5 md:py-3.5 text-white outline-none placeholder:text-purple-300/40 text-sm md:text-base font-medium focus:ring-0"
                        style={{ background: 'transparent', WebkitAppearance: 'none' }}
                    />
                    <button 
                        type="submit" 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 md:px-10 py-2.5 md:py-3.5 font-black hover:brightness-110 transition-all rounded-full text-[10px] md:text-xs tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 whitespace-nowrap"
                        aria-label={loading ? 'Buscando...' : 'Buscar'}
                    >
                        {loading ? '...' : 'BUSCAR'}
                    </button>
                </div>
            </form>
        </header>
    )
}
