import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

/**
 * GameFind: Estructura Original + Motor CheapShark
 * Mantiene el diseño original pero con datos reales y comparativa
 */
function Home() {
    const [games, setGames] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedStore, setSelectedStore] = useState('1') // Default: Steam (1)

    // Configuración de Tiendas con logos oficiales
    const STORE_MAP: any = {
        "1": { name: "Steam", logo: "https://www.cheapshark.com/img/stores/icons/0.png" },
        "2": { name: "GamersGate", logo: "https://www.cheapshark.com/img/stores/icons/1.png" },
        "3": { name: "GreenManGaming", logo: "https://www.cheapshark.com/img/stores/icons/2.png" },
        "7": { name: "GOG", logo: "https://www.cheapshark.com/img/stores/icons/6.png" },
        "11": { name: "Humble Store", logo: "https://www.cheapshark.com/img/stores/icons/10.png" },
        "25": { name: "Epic Games", logo: "https://www.cheapshark.com/img/stores/icons/24.png" }
    }

    const fetchDeals = useCallback(async (query = '', storeId = '') => {
        setLoading(true)
        try {
            let url = ""
            if (query) {
                url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=20`
                const res = await fetch(url)
                const data = await res.json()

                const detailedGames = await Promise.all(data.map(async (g: any) => {
                    const gameRes = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${g.gameID}`)
                    const gameData = await gameRes.json()

                    const validDeals = gameData.deals.map((d: any) => ({
                        store: STORE_MAP[d.storeID]?.name || "Tienda",
                        logo: STORE_MAP[d.storeID]?.logo || "",
                        price: d.price,
                        retail: d.retailPrice,
                        savings: Math.round(parseFloat(d.savings)),
                        url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`
                    })).filter((d: any) => d.logo !== "").sort((a: any, b: any) => a.price - b.price).slice(0, 3)

                    return {
                        id: g.gameID,
                        title: g.external,
                        image: g.thumb,
                        metacritic: gameData.info.metacriticScore || "N/A",
                        deals: validDeals
                    }
                }))
                setGames(detailedGames.filter(g => g.deals.length > 0).slice(0, 12))
            } else {
                // Mejores ofertas filtradas por tienda
                url = `https://www.cheapshark.com/api/1.0/deals?storeID=${storeId || selectedStore}&upperPrice=60&sortBy=Savings&pageSize=15`
                const res = await fetch(url)
                const data = await res.json()

                const enrichedDeals = await Promise.all(data.map(async (deal: any) => {
                    const gameRes = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${deal.gameID}`)
                    const gameData = await gameRes.json()

                    return {
                        id: deal.gameID,
                        title: deal.title,
                        image: deal.thumb,
                        metacritic: deal.metacriticScore || "N/A",
                        deals: gameData.deals.map((d: any) => ({
                            store: STORE_MAP[d.storeID]?.name || "Tienda",
                            logo: STORE_MAP[d.storeID]?.logo || "",
                            price: d.price,
                            retail: d.retailPrice,
                            savings: Math.round(parseFloat(d.savings)),
                            url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`
                        })).filter((d: any) => d.logo !== "").sort((a: any, b: any) => a.price - b.price).slice(0, 3)
                    }
                }))
                setGames(enrichedDeals.filter(g => g.deals.length > 0))
            }
        } catch (error) {
            console.error("Error:", error)
        }
        setLoading(false)
    }, [selectedStore])

    useEffect(() => {
        if (!searchTerm) fetchDeals()
    }, [fetchDeals, searchTerm])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchDeals(searchTerm)
    }

    const handleStoreChange = (id: string) => {
        setSelectedStore(id)
        setSearchTerm('')
        fetchDeals('', id)
    }

    return (
        <div className="min-h-screen w-full bg-[#0c061a] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">

            {/* --- FONDO DECORATIVO --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[5%] -left-[10%] w-[80vw] md:w-[40vw] h-[80vw] md:h-[40vw] rounded-full bg-gradient-to-br from-[#00f0ff]/10 to-transparent blur-3xl opacity-60"></div>
                <div className="absolute bottom-[5%] -right-[10%] w-[60vw] md:w-[30vw] h-[60vw] md:h-[30vw] rounded-full bg-gradient-to-br from-[#d946ef]/10 to-transparent blur-3xl opacity-50"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-5 bg-[#0c061a]/90 backdrop-blur-xl border-b border-white/5">
                <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="GameFind" className="h-8 md:h-10 w-auto" />
                </Link>
                <div className="flex items-center gap-3 md:gap-6">
                    <button className="text-xs md:text-sm px-4 md:px-6 py-2 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium">
                        Entrar
                    </button>
                    <button className="text-xs md:text-sm px-4 md:px-6 py-2 rounded-lg md:rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20">
                        Registrarse
                    </button>
                </div>
            </nav>

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
                    Comparamos los precios de las tiendas de videojuegos para que tú solo te preocupes de jugar.
                    Simple, rápido y 100% gratuito.
                </p>

                {/* Buscador */}
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group px-4 md:px-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-15 group-focus-within:opacity-30 transition-opacity"></div>
                    <div className="relative flex items-center bg-[#150c2b]/90 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 md:p-2 shadow-2xl">
                        <div className="hidden sm:flex pl-4 text-purple-400/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="¿Qué quieres jugar hoy?"
                            className="w-full bg-transparent px-4 md:px-6 py-2.5 md:py-3.5 text-white outline-none placeholder:text-gray-500 text-sm md:text-base font-medium"
                        />
                        <button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 md:px-10 py-2.5 md:py-3.5 font-black hover:brightness-110 transition-all rounded-full text-[10px] md:text-xs tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 whitespace-nowrap">
                            {loading ? '...' : 'BUSCAR'}
                        </button>
                    </div>
                </form>
            </header>

            {/* --- SECCIÓN DE OFERTAS POR TIENDA --- */}
            <main className="relative z-10 container mx-auto px-6 py-10 md:py-20">
                <div className="flex flex-col items-center mb-12">
                    <h2 className="text-2xl md:text-4xl font-black mb-8 uppercase tracking-tighter text-center">
                        MEJORES OFERTAS <span className="text-cyan-400">POR TIENDA</span>
                    </h2>

                    {/* Selector de Tiendas */}
                    <div className="flex flex-wrap justify-center gap-4">
                        {Object.entries(STORE_MAP).map(([id, store]: any) => (
                            <button
                                key={id}
                                onClick={() => handleStoreChange(id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${selectedStore === id
                                        ? 'bg-white/10 border-cyan-500 shadow-lg shadow-cyan-500/20 scale-105'
                                        : 'bg-white/5 border-white/10 hover:border-white/30 grayscale hover:grayscale-0'
                                    }`}
                            >
                                <img src={store.logo} alt={store.name} className="w-5 h-5 object-contain" />
                                <span className={`text-xs font-black uppercase tracking-widest ${selectedStore === id ? 'text-cyan-400' : 'text-gray-400'}`}>
                                    {store.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {games.map(game => (
                            <div key={game.id} className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative bg-[#150c2b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                                    <div className="h-48 overflow-hidden relative bg-black/40 flex items-center justify-center">
                                        <img src={game.image} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125" />
                                        <img src={game.image} alt={game.title} className="relative z-10 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                                        {game.metacritic !== "N/A" && (
                                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-yellow-400">
                                                MC {game.metacritic}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold mb-6 line-clamp-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{game.title}</h3>

                                        <div className="space-y-2 mb-6 flex-grow">
                                            {game.deals.map((offer: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => window.open(offer.url, '_blank')}
                                                    className={`flex justify-between items-center p-3 rounded-2xl border transition-all cursor-pointer group/row ${idx === 0
                                                        ? 'bg-cyan-500/10 border-cyan-400/20 hover:bg-cyan-500/20'
                                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-lg bg-white/10 p-1 flex items-center justify-center">
                                                            <img src={offer.logo} alt={offer.store} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-cyan-400' : 'text-gray-400 group-hover/row:text-white'}`}>{offer.store}</span>
                                                            {offer.savings > 0 && (
                                                                <span className="text-[8px] font-bold text-green-500">-{offer.savings}%</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className="text-[10px] text-gray-500 line-through font-medium">${offer.retail}</span>
                                                        <span className={`text-sm font-black ${idx === 0 ? 'text-cyan-400' : 'text-white'}`}>${offer.price}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => window.open(game.deals[0]?.url, '_blank')}
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] active:scale-95 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-purple-500/20"
                                        >
                                            IR A LA MEJOR OFERTA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* --- FOOTER --- */}
            <footer className="relative z-10 py-12 px-6 bg-black/40 backdrop-blur-xl">
                <div className="container mx-auto flex flex-col items-center gap-6 text-center">
                    <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="GameFind" className="h-7 w-auto opacity-30" />
                    <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest font-medium">
                        © 2026 GameFind • DATOS POR CHEAPSHARK
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Home
