import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import Navbar from '../components/Navbar'

import { MainLayout } from '../components/MainLayout'

function Profile() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [fullName, setFullName] = useState('')
    const [stats, setStats] = useState({ saved: 0, tracked: 0 })

    const fetchUserData = useCallback(async (currentUser: User) => {
        setLoading(true)
        setFullName(currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '')

        const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', currentUser.id)

        if (!error && data) {
            let totalSaved = 0
            await Promise.all(data.map(async (fav) => {
                try {
                    const res = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${fav.game_id}`)
                    const gameData = await res.json()
                    const lowestDeal = gameData.deals.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))[0]
                    if (lowestDeal) {
                        const saved = parseFloat(lowestDeal.retailPrice) - parseFloat(lowestDeal.price)
                        if (saved > 0) totalSaved += saved
                    }
                } catch(e) {
                    // Ignore errors for stats
                }
            }))
            setStats({ saved: totalSaved, tracked: data.length })
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user)
                fetchUserData(user)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)
            if (currentUser) {
                fetchUserData(currentUser)
            }
        })

        return () => subscription.unsubscribe()
    }, [fetchUserData])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        })
        setUpdating(false)
        if (error) {
            alert('Error al actualizar el perfil')
        } else {
            supabase.auth.refreshSession()
            alert('¡Perfil actualizado con éxito!')
        }
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-6 pb-20 max-w-4xl">
                <header className="mb-12">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest group" aria-label="Volver a la tienda">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Volver a la tienda
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                        TU <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">PERFIL GAMER</span>
                    </h1>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20" aria-live="polite">
                        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                ) : user ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Panel de Usuario */}
                        <div className="md:col-span-1 flex flex-col gap-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center backdrop-blur-xl">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" aria-hidden="true"></div>
                                    <img 
                                        src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                                        alt="" 
                                        className="w-32 h-32 rounded-full border-4 border-[#150c2b] shadow-2xl relative z-10"
                                        aria-hidden="true"
                                    />
                                </div>
                                <h2 className="text-2xl font-black mb-1">{user.user_metadata?.full_name || 'Gamer Anónimo'}</h2>
                                <p className="text-gray-400 text-sm font-medium">{user.email}</p>
                            </div>
                        </div>

                        {/* Configuración y Estadísticas */}
                        <div className="md:col-span-2 flex flex-col gap-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-3xl p-6 relative overflow-hidden group">
                                    <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                    </div>
                                    <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest block mb-2">Ahorro Potencial</span>
                                    <span className="text-4xl font-black">${stats.saved.toFixed(2)}</span>
                                    <p className="text-[9px] text-gray-500 mt-2 leading-relaxed">Diferencia entre el precio normal y el mejor precio actual de tus juegos guardados.</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden group">
                                    <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                                    </div>
                                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block mb-2">Juegos Rastreados</span>
                                    <span className="text-4xl font-black">{stats.tracked}</span>
                                </div>
                            </div>

                            {/* Formulario */}
                            <form onSubmit={handleUpdateProfile} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                <h3 className="text-xl font-bold mb-6">Ajustes de Cuenta</h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="full-name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre de Usuario</label>
                                        <input 
                                            id="full-name"
                                            type="text" 
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                            placeholder="Tu nombre gamer"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                                        <input 
                                            id="email"
                                            type="text" 
                                            value={user.email || ''}
                                            disabled
                                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
                                        />
                                        <span className="text-[10px] text-gray-500 mt-2 inline-block">El correo electrónico no puede modificarse por seguridad.</span>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={updating || !fullName.trim()}
                                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updating ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20" aria-live="polite">
                        <h2 className="text-2xl font-bold mb-4">Debes iniciar sesión</h2>
                        <Link to="/login" className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-xl font-bold inline-block">
                            Ir a Entrar
                        </Link>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}


export default Profile

