import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Componente de la página de Inicio (Home).
 * Refactorizado para mantener la coherencia visual premium con la página de Login.
 */
function Home() {
    // Datos mock para las ofertas destacadas
    const featuredGames = [
        { id: 1, title: 'Elden Ring', price: '$39.99', image: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aajm8sYv98YpMp69lS6Oao0N.png', platform: 'Steam' },
        { id: 2, title: 'Cyberpunk 2077', price: '$29.99', image: 'https://cdn.cdprojektred.com/keyart/cyberpunk/cyberpunk-2077-ultimate-edition-keyart-en.jpg', platform: 'GOG' },
        { id: 3, title: 'Zelda: TotK', price: '$59.99', image: 'https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/ncom/software/switch/70010000047696/e3692d30-ce4c-4735-a740-410a8d672877', platform: 'eShop' },
    ]

    return (
        <div className="min-h-screen w-full bg-[#0c061a] text-white font-sans selection:bg-cyan-500/30">

            {/* --- FONDO DECORATIVO (Coherencia con Login) --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Planeta Grande (Cian) */}
                <div className="absolute -top-[10%] -left-[5%] w-[40vw] h-[40vw] min-w-[400px] rounded-full bg-gradient-to-br from-[#00f0ff]/10 via-[#0055ff]/5 to-transparent blur-3xl opacity-60"></div>
                {/* Planeta Pequeño (Púrpura) */}
                <div className="absolute top-[60%] -right-[5%] w-[30vw] h-[30vw] min-w-[300px] rounded-full bg-gradient-to-br from-[#d946ef]/10 via-[#581c87]/5 to-transparent blur-3xl opacity-50"></div>

                {/* Estrellas Distantes */}
                <div className="absolute top-[20%] left-[30%] w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white] opacity-40"></div>
                <div className="absolute top-[70%] left-[60%] w-1.5 h-1.5 bg-cyan-200 rounded-full shadow-[0_0_10px_cyan] opacity-30"></div>
                <div className="absolute top-[40%] right-[20%] w-1 h-1 bg-purple-300 rounded-full shadow-[0_0_8px_purple] opacity-40"></div>
            </div>

            {/* --- NAVBAR (Sticky, Transparent & Standard Layout) --- */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-8 md:px-12 bg-transparent">
                <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <img src="/logo.svg" alt="GameFind" className="h-10 w-auto" />
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/login" className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium">
                        Iniciar Sesión
                    </Link>
                    <Link to="/register" className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all font-bold">
                        Registrarse
                    </Link>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative z-10 pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight animate-fade">
                    ENCUENTRA TU PRÓXIMO <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
                        JUEGO AL MEJOR PRECIO
                    </span>
                </h1>
                <p className="text-purple-200/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                    Comparamos miles de tiendas para que tú solo te preocupes de jugar.
                    Simple, rápido y sin trampas.
                </p>

                {/* Buscador Estilizado */}
                <div className="relative max-w-3xl mx-auto group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center bg-[#150c2b]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="pl-6 text-purple-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Busca tu juego favorito (ej: Elden Ring, FIFA 24...)"
                            className="w-full bg-transparent px-6 py-5 text-white outline-none placeholder:text-gray-500 font-medium"
                        />
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-5 font-bold hover:brightness-110 transition-all uppercase tracking-wider">
                            Buscar
                        </button>
                    </div>
                </div>
            </header>

            {/* --- SECCIÓN DE OFERTAS --- */}
            <main className="relative z-10 container mx-auto px-6 py-20">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Ofertas del Momento</h2>
                        <div className="h-1 w-20 bg-cyan-500 rounded-full"></div>
                    </div>
                    <a href="#" className="text-cyan-400 hover:text-white transition-colors font-semibold flex items-center gap-2">
                        Ver todas las ofertas
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y2="12" y1="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredGames.map(game => (
                        <div key={game.id} className="group relative">
                            {/* Glow effect on hover */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>

                            <div className="relative bg-[#150c2b]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                                <div className="h-56 overflow-hidden relative">
                                    <img
                                        src={game.image}
                                        alt={game.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#150c2b] to-transparent opacity-60"></div>
                                    <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest text-cyan-400">
                                        {game.platform}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">{game.title}</h3>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-xs uppercase font-bold tracking-tighter">Mejor precio</span>
                                            <span className="text-3xl font-black text-white">{game.price}</span>
                                        </div>
                                        <button className="bg-white/5 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold border border-white/10 hover:border-cyan-400 transition-all active:scale-95">
                                            Comparar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* --- FOOTER (Centered & Clean) --- */}
            <footer className="relative z-10 py-12 px-6 bg-black/20 backdrop-blur-lg">
                <div className="container mx-auto flex flex-col items-center justify-center text-center gap-6">
                    <img src="/logo.svg" alt="GameFind" className="h-8 w-auto opacity-50" />
                    <p className="text-gray-500 text-sm">© 2026 GameFind. Hecho para gamers.</p>
                </div>
            </footer>
        </div>
    )
}

export default Home
