import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Componente de la página de Login.
 * Implementado siguiendo fielmente el diseño premium proporcionado en login.html.
 */
function Login() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#120a26] font-sans text-white antialiased overflow-x-hidden">

            {/* Main Container: 100% ancho y alto en desktop */}
            <div className="flex flex-col md:flex-row w-full min-h-screen md:h-screen bg-[#0c061a] overflow-hidden relative z-10">

                {/* Fondo Decorativo Global para Móvil (Planetas con alta visibilidad) */}
                <div className="md:hidden absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Planeta Grande Superior - Más sólido */}
                    <div className="absolute -top-[5%] -left-[15%] w-[90vw] h-[90vw] rounded-full bg-gradient-to-br from-[#00f0ff]/40 via-[#0055ff]/20 to-transparent blur-xl">
                        <div className="absolute inset-[15%] rounded-full border-t-[5px] border-white/30 rotate-45"></div>
                    </div>
                    {/* Planeta Pequeño Inferior - Más sólido */}
                    <div className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#d946ef]/40 to-[#581c87]/20 shadow-[0_0_50px_rgba(217,70,239,0.2)]"></div>
                </div>

                {/* Panel Izquierdo - Visual/Brand (Oculto en móvil) */}
                <div className="hidden md:flex w-1/2 relative p-12 xl:p-24 flex-col justify-between overflow-hidden bg-[#0c061a]">

                    {/* Fondo Decorativo (Planetas y Espacio) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Planeta Grande Cian/Azul */}
                        <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] min-w-[700px] min-h-[700px] rounded-full bg-gradient-to-br from-[#00f0ff] via-[#0055ff] to-transparent opacity-80 blur-[1px]">
                            <div className="absolute inset-10 rounded-full border-t-[6px] border-white/20 rotate-45"></div>
                            <div className="absolute inset-20 rounded-full border-t-[6px] border-white/10 -rotate-12"></div>
                        </div>

                        {/* Planeta Pequeño Púrpura */}
                        <div className="absolute top-[45%] right-[-5%] w-[25vw] h-[25vw] min-w-[300px] min-h-[300px] rounded-full bg-gradient-to-br from-[#d946ef] to-[#581c87] shadow-[0_0_40px_rgba(217,70,239,0.4)]">
                            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-transparent to-white/20"></div>
                        </div>

                        {/* Estrellas Distantes */}
                        <div className="absolute top-[20%] left-[60%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>
                        <div className="absolute top-[70%] left-[20%] w-2 h-2 bg-cyan-200 rounded-full shadow-[0_0_10px_cyan]"></div>
                        <div className="absolute top-[85%] right-[40%] w-1.5 h-1.5 bg-purple-300 rounded-full shadow-[0_0_8px_purple]"></div>

                        {/* Estrellas Fugaces */}
                        <div className="absolute top-[15%] right-[20%] w-40 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent rotate-[35deg] opacity-60"></div>
                        <div className="absolute top-[65%] left-[25%] w-60 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent rotate-[35deg] opacity-40"></div>
                        <div className="absolute bottom-[15%] right-[15%] w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-300 to-transparent rotate-[35deg] opacity-50"></div>
                    </div>

                    <Link to="/" className="relative z-10 flex items-center gap-3 hover:opacity-80 transition-opacity group">
                        {/* Fondo difuminado sin bordes (acabado orgánico) */}
                        <div className="absolute inset-0 bg-black/60 blur-[60px] rounded-full scale-[2.5] -z-10"></div>
                        <img src="logo.svg" alt="GameFind Logo" className="h-16 w-auto relative z-10" />
                    </Link>

                    {/* Texto de Bienvenida Hero */}
                    <div className="relative z-10 mb-4 xl:mb-8 text-left">
                        <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-4 drop-shadow-2xl uppercase">
                            ¡ENCUENTRA <br />
                            TU PRÓXIMA <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                AVENTURA!
                            </span>
                        </h1>
                        <p className="text-purple-200 text-base max-w-sm font-medium">
                            Compara precios en todas las tiendas y consigue tus videojuegos favoritos al mejor costo.
                        </p>
                    </div>
                </div>

                {/* Panel Derecho - Formulario */}
                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col relative bg-transparent md:bg-[#150c2b] justify-center items-center">

                    {/* Enlace de Registro (Arriba a la derecha) */}
                    <div className="absolute top-6 right-6 md:top-10 md:right-12 flex items-center gap-4 z-20">
                        <span className="text-sm text-gray-400 font-medium hidden sm:block">¿No tienes una cuenta?</span>
                        <Link to="/register" className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-purple-300 transition-all duration-300 bg-purple-900/10 border border-purple-500/30 rounded-xl hover:bg-purple-900/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] group overflow-hidden backdrop-blur-sm">
                            <span className="relative z-10 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                Regístrate
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                </svg>
                            </span>
                            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                        </Link>
                    </div>

                    {/* Contenedor del Formulario */}
                    <div className="w-full max-w-sm md:max-w-md mx-auto flex flex-col justify-center min-h-[75vh] md:min-h-0 px-4 sm:px-0">

                        {/* Logo en Móvil con fondo difuminado */}
                        <Link to="/" className="md:hidden relative flex items-center gap-3 mb-10 justify-center hover:opacity-80 transition-opacity">
                            <div className="absolute inset-0 bg-black/60 blur-[30px] rounded-full scale-[2] -z-10"></div>
                            <img src="logo.svg" alt="GameFind Logo" className="h-12 w-auto relative z-10" />
                        </Link>

                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight uppercase">INICIAR SESIÓN</h2>
                            <p className="text-gray-400 text-sm md:text-base">Ingresa con tu correo electrónico para continuar</p>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                            {/* Input de Email */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-400 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    className="w-full bg-[#1e1438] border border-[#2d1b54] focus:border-purple-500 focus:bg-[#251a45] rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all duration-300"
                                    placeholder="tu_correo@gmail.com"
                                    required
                                />
                            </div>

                            {/* Input de Contraseña */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-400 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    className="w-full bg-[#1e1438] border border-[#2d1b54] focus:border-purple-500 focus:bg-[#251a45] rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all duration-300"
                                    placeholder="Contraseña"
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-purple-400 hover:text-cyan-400 transition-colors font-medium">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            {/* Botón de Envío */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg rounded-xl py-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(107,33,168,0.5)] flex justify-center items-center gap-2 group mt-2"
                            >
                                Iniciar Sesión
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="group-hover:translate-x-1.5 transition-transform">
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                </svg>
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Login
