import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import Navbar from '../components/Navbar'
import { useEnrichedFavorites } from '../hooks/useEnrichedFavorites'

import { MainLayout } from '../components/MainLayout'

function Favorites() {
    const [user, setUser] = useState<User | null>(null)
    const { favorites, loading, fetchFavorites, removeFavorite } = useEnrichedFavorites(user?.id)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (user) fetchFavorites()
    }, [user, fetchFavorites])

    return (
        <MainLayout>
            <div className="container mx-auto px-6 pb-20">
                <header className="mb-12">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest group" aria-label="Volver a la tienda">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Volver a la tienda
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                        MIS JUEGOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">GUARDADOS</span>
                    </h1>
                    <p className="text-gray-400 mt-4 max-w-lg font-medium">Aquí tienes todos los títulos que estás siguiendo. Te avisaremos cuando haya bajadas de precio brutales.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20" aria-live="polite">
                        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl" aria-live="polite">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
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
                            <div key={game.juego_id} className="group relative animate-fade">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative bg-[#150c2b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full hover:border-white/20 transition-all duration-500">
                                    <div className="h-40 overflow-hidden relative bg-black/40 flex items-center justify-center">
                                        <img src={game.image} className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20" alt="" aria-hidden="true" />
                                        <img src={game.image} alt={`Portada de ${game.title}`} className="relative z-10 w-full h-full object-contain p-4" />
                                        
                                        <button 
                                            onClick={() => removeFavorite(game.juego_id)}
                                            className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/60 border border-white/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            aria-label={`Eliminar ${game.title} de favoritos`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
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
                                                onClick={() => window.open(game.dealUrl, '_blank')}
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
            </div>
        </MainLayout>
    )
}


export default Favorites

