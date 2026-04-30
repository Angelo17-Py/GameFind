import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SocialLogin from '../components/SocialLogin'

/**
 * Componente de la página de Login.
 * Implementado siguiendo fielmente el diseño premium proporcionado en login.html.
 */
import { AuthLayout } from '../components/AuthLayout'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            navigate('/')
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="INICIAR SESIÓN"
            subtitle="Ingresa con tu correo electrónico para continuar"
            heroTitle={<>¡ENCUENTRA <br /> TU PRÓXIMA <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AVENTURA!</span></>}
            heroSubtitle="Compara precios en todas las tiendas y consigue tus videojuegos favoritos al mejor costo."
            switchText="¿No tienes cuenta?"
            switchLinkText="Regístrate"
            switchLink="/register"
        >
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium" role="alert">
                    {error}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
                <div className="relative group">
                    <label htmlFor="email" className="sr-only">Correo Electrónico</label>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-400 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                    </div>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#1e1438] border border-[#2d1b54] focus:border-purple-500 focus:bg-[#251a45] rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all duration-300"
                        placeholder="tu_correo@gmail.com"
                        required
                    />
                </div>

                <div className="relative group">
                    <label htmlFor="password" className="sr-only">Contraseña</label>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-400 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#1e1438] border border-[#2d1b54] focus:border-purple-500 focus:bg-[#251a45] rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all duration-300"
                        placeholder="Contraseña"
                        required
                    />
                </div>

                <div className="flex justify-end">
                    <button type="button" className="text-sm text-purple-400 hover:text-cyan-400 transition-colors font-medium">
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg rounded-xl py-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(107,33,168,0.5)] flex justify-center items-center gap-2 group mt-2 disabled:opacity-50 disabled:transform-none"
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    {!loading && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1.5 transition-transform" aria-hidden="true">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    )}
                </button>
            </form>

            <div className="mt-8">
                <SocialLogin />
            </div>
        </AuthLayout>
    )
}


export default Login

