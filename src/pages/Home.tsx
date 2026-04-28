import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Componente de la página de Inicio (Home).
 * Optimizado para Responsive Nivel Senior.
 */
function Home() {
    const featuredGames = [
        { id: 1, title: 'Elden Ring', price: '$39.99', image: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aajm8sYv98YpMp69lS6Oao0N.png', platform: 'Steam' },
        { id: 2, title: 'Cyberpunk 2077', price: '$29.99', image: 'https://cdn.cdprojektred.com/keyart/cyberpunk/cyberpunk-2077-ultimate-edition-keyart-en.jpg', platform: 'GOG' },
        { id: 3, title: 'Zelda: TotK', price: '$59.99', image: 'https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/ncom/software/switch/70010000047696/e3692d30-ce4c-4735-a740-410a8d672877', platform: 'eShop' },
    ]

    return (
        <div className="min-h-screen w-full bg-[#0c061a] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
            
            {/* --- FONDO DECORATIVO --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[5%] -left-[10%] w-[80vw] md:w-[40vw] h-[80vw] md:h-[40vw] rounded-full bg-gradient-to-br from-[#00f0ff]/10 to-transparent blur-3xl opacity-60"></div>
                <div className="absolute bottom-[5%] -right-[10%] w-[60vw] md:w-[30vw] h-[60vw] md:h-[30vw] rounded-full bg-gradient-to-br from-[#d946ef]/10 to-transparent blur-3xl opacity-50"></div>
            </div>

            {/* --- NAVBAR (Fixed Top) --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-5 bg-[#0c061a]/90 backdrop-blur-xl border-b border-white/5">
                <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <img src="logo.svg" alt="GameFind" className="h-8 md:h-10 w-auto" />
                </Link>
                <div className="flex items-center gap-3 md:gap-6">
                    <Link to="/login" className="text-xs md:text-sm px-4 md:px-6 py-2 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium">
                        Entrar
                    </Link>
                    <Link to="/register" className="text-xs md:text-sm px-4 md:px-6 py-2 rounded-lg md:rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20">
                        Registrarse
                    </Link>
                </div>
            </nav>

            {/* Ajuste de espacio para compensar el Fixed Header */}
            <div className="h-20 md:h-28"></div>

            {/* --- HERO SECTION --- */}
            <header className="relative z-10 pt-12 md:pt-24 pb-12 md:pb-20 px-6 text-center max-w-5xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-7xl font-black mb-6 leading-tight uppercase">
                    TU PRÓXIMA <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
                        AVENTURA GAMER
                    </span> <br className="hidden sm:block" />
                    AL MEJOR PRECIO
                </h1>
                <p className="text-purple-200/60 text-sm md:text-lg max-w-xl mx-auto mb-10 md:mb-14 font-medium px-4">
                    Comparamos miles de tiendas para que tú solo te preocupes de jugar. 
                    Simple, rápido y 100% gratuito.
                </p>

                {/* Buscador Estilo Píldora Premium */}
                <div className="relative max-w-2xl mx-auto group px-4 md:px-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-15 group-focus-within:opacity-30 transition-opacity"></div>
                    <div className="relative flex items-center bg-[#150c2b]/90 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 md:p-2 shadow-2xl">
                        <div className="hidden sm:flex pl-4 text-purple-400/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="¿Qué quieres jugar hoy?" 
                            className="w-full bg-transparent px-4 md:px-6 py-2.5 md:py-3.5 text-white outline-none placeholder:text-gray-500 text-sm md:text-base font-medium"
                        />
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 md:px-10 py-2.5 md:py-3.5 font-black hover:brightness-110 transition-all rounded-full text-[10px] md:text-xs tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 whitespace-nowrap">
                            BUSCAR
                        </button>
                    </div>
                </div>
            </header>

            {/* --- SECCIÓN DE OFERTAS --- */}
            <main className="relative z-10 container mx-auto px-6 py-10 md:py-20">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 mb-10 md:mb-16">
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 uppercase tracking-tight">OFERTAS TOP</h2>
                        <div className="h-1 w-16 md:w-20 bg-cyan-500 rounded-full mx-auto sm:mx-0"></div>
                    </div>
                    <a href="#" className="text-cyan-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                        VER TODAS
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {featuredGames.map(game => (
                        <div key={game.id} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-15 transition duration-500"></div>
                            
                            <div className="relative bg-[#150c2b]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
                                <div className="h-48 md:h-56 overflow-hidden relative">
                                    <img 
                                        src={game.image} 
                                        alt={game.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                    <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold border border-white/10 text-cyan-400 uppercase tracking-widest">
                                        {game.platform}
                                    </span>
                                </div>
                                <div className="p-5 md:p-6 text-center sm:text-left">
                                    <h3 className="text-lg md:text-xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">{game.title}</h3>
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <span className="text-2xl md:text-3xl font-black text-white">{game.price}</span>
                                        <button className="w-full sm:w-auto bg-white/5 hover:bg-cyan-500 px-6 py-2.5 rounded-xl font-bold border border-white/10 transition-all text-sm uppercase">
                                            Comparar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="relative z-10 py-12 px-6 bg-black/40 backdrop-blur-xl">
                <div className="container mx-auto flex flex-col items-center gap-6 text-center">
                    <img src="logo.svg" alt="GameFind" className="h-7 w-auto opacity-30" />
                    <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest font-medium">
                        © 2026 GameFind • PRECIOS ACTUALIZADOS
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Home
