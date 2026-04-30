import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [favCount, setFavCount] = useState(0)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            if (user) fetchFavCount(user.id)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)
            if (currentUser) fetchFavCount(currentUser.id)
            else setFavCount(0)
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchFavCount = async (userId: string) => {
        const { count } = await supabase
            .from('favoritos')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', userId)
        setFavCount(count ?? 0)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-5 bg-[#0c061a]/90 backdrop-blur-xl border-b border-white/5">
            {/* Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity" aria-label="GameFind - Ir al inicio">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="h-8 md:h-10 w-auto" aria-hidden="true" />
            </Link>

            {/* Acciones */}
            <div className="flex items-center gap-3 md:gap-4">
                {user ? (
                    <>
                        {/* Mis Favoritos + Hola */}
                        <div className="flex items-center gap-2 sm:gap-4 pr-2 sm:pr-4 border-r border-white/10">
                            <Link
                                to="/favorites"
                                className="flex items-center gap-2.5 p-2 sm:px-4 sm:py-2 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 group"
                                aria-label={`Ver mis favoritos, tienes ${favCount} juegos guardados`}
                            >
                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                                    Mis Favoritos
                                </span>
                                <div className="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true">
                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                    </svg>
                                    {favCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-white text-red-600 text-[7px] font-black px-1 rounded shadow-lg" aria-hidden="true">
                                            {favCount}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            <span className="hidden md:inline text-xs font-bold text-white whitespace-nowrap">
                                ¡Hola, {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}!
                            </span>
                        </div>

                        {/* Avatar → Perfil */}
                        <Link to="/profile" className="relative group shrink-0" aria-label="Ir a mi perfil">
                            <img
                                src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                alt=""
                                className="w-10 h-10 rounded-full border-2 border-purple-500/50 p-0.5 hover:border-cyan-400 transition-colors"
                                aria-hidden="true"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full border-2 border-[#0c061a] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </div>
                        </Link>

                        {/* Salir */}
                        <button
                            onClick={handleLogout}
                            className="text-xs md:text-sm px-4 md:px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium"
                            aria-label="Cerrar sesión"
                        >
                            Salir
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-xs md:text-sm px-4 md:px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium">
                            Entrar
                        </Link>
                        <Link to="/register" className="text-xs md:text-sm px-4 md:px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all">
                            Registrarse
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}
