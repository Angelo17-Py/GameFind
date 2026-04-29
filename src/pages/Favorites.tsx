import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import Navbar from '../components/Navbar'

function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    const fetchFavorites = useCallback(async (userId: string) => {
        setLoading(true)
        const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        
        if (error) {
            console.error('Error fetching favorites:', error)
            setFavorites([])
        } else if (data) {
            const enrichedData = await Promise.all(data.map(async (fav) => {
                try {
                    const res = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${fav.game_id}`)
                    const gameData = await res.json()
                    const lowestDeal = gameData.deals.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))[0]
                    return { 
                        ...fav, 
                        currentPrice: lowestDeal ? lowestDeal.price : 'N/A', 
                        dealUrl: lowestDeal ? `https://www.cheapshark.com/redirect?dealID=${lowestDeal.dealID}` : '#'
                    }
                } catch(e) {
                    return { ...fav, currentPrice: 'N/A', dealUrl: '#' }
                }
            }))
            setFavorites(enrichedData)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            if (user) fetchFavorites(user.id)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)
            if (currentUser) {
                fetchFavorites(currentUser.id)
            } else {
                setFavorites([])
            }
        })

        return () => subscription.unsubscribe()
    }, [fetchFavorites])

    const removeFavorite = async (gameId: string) => {
        if (!user) return

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('game_id', gameId)

        if (!error) {
            setFavorites(prev => prev.filter(f => f.game_id !== gameId))
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <div className="min-h-screen w-full bg-[#0c061a] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
            
            {/* --- FONDO DECORATIVO --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[5%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-[#00f0ff]/5 to-transparent blur-3xl opacity-40"></div>
                <div className="absolute bottom-[5%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#d946ef]/5 to-transparent blur-3xl opacity-30"></div>
            </div>

            <Navbar />

            <div className="h-28 md:h-36"></div>

            <main className="relative z-10 container mx-auto px-6 pb-20">
                <header className="mb-12">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Volver a la tienda
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                        MIS JUEGOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">GUARDADOS</span>
                    </h1>
                    <p className="text-gray-400 mt-4 max-w-lg font-medium">Aquí tienes todos los títulos que estás siguiendo. Te avisaremos cuando haya bajadas de precio brutales.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Aún no tienes favoritos</h2>
                        <p className="text-gray-500 mb-8">Explora la tienda y dale al corazón a los juegos que te gusten.</p>
                        <Link to="/" className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
                            Ir a explorar
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favorites.map(game => (
                            <div key={game.game_id} className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative bg-[#150c2b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full hover:border-white/20 transition-all duration-500">
                                    <div className="h-40 overflow-hidden relative bg-black/40 flex items-center justify-center">
                                        <img src={game.image} className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20" />
                                        <img src={game.image} alt={game.title} className="relative z-10 w-full h-full object-contain p-4" />
                                        
                                        <button 
                                            onClick={() => removeFavorite(game.game_id)}
                                            className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/60 border border-white/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            title="Eliminar de favoritos"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                                        </button>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold mb-4 line-clamp-2 uppercase tracking-tight">{game.title}</h3>
                                        <div className="mt-auto">
                                            {game.currentPrice && game.currentPrice !== 'N/A' && (
                                                <div className="flex items-center justify-between mb-4 px-2">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Mejor Precio:</span>
                                                    <span className="text-xl font-black text-cyan-400">${game.currentPrice}</span>
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => window.open(game.dealUrl || `https://www.cheapshark.com/api/1.0/games?id=${game.game_id}`, '_blank')}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] active:scale-95 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20"
                                            >
                                                VER OFERTA
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* --- FOOTER --- */}
            <footer className="py-12 border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em]">GameFind • Colección Personal</p>
                </div>
            </footer>
        </div>
    )
}

export default Favorites
