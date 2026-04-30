import React from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
    heroTitle: React.ReactNode
    heroSubtitle: string
    switchText: string
    switchLinkText: string
    switchLink: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
    children, 
    title, 
    subtitle, 
    heroTitle, 
    heroSubtitle,
    switchText,
    switchLinkText,
    switchLink
}) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0c061a] font-sans text-white antialiased overflow-x-hidden">
            <a href="#auth-content" className="skip-link">Saltar al formulario</a>

            <div className="flex flex-col md:flex-row w-full min-h-screen md:h-screen bg-[#0c061a] overflow-hidden relative z-10">
                {/* Fondo Decorativo Global para Móvil */}
                <div className="md:hidden absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[5%] -left-[15%] w-[90vw] h-[90vw] rounded-full bg-gradient-to-br from-[#00f0ff]/40 via-[#0055ff]/20 to-transparent blur-xl"></div>
                    <div className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#d946ef]/40 to-[#581c87]/20"></div>
                </div>

                {/* Panel Izquierdo - Visual/Brand */}
                <div className="hidden md:flex w-1/2 relative p-12 xl:p-24 flex-col justify-between overflow-hidden bg-[#0c061a]">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] min-w-[700px] min-h-[700px] rounded-full bg-gradient-to-br from-[#00f0ff] via-[#0055ff] to-transparent opacity-80 blur-[1px]">
                            <div className="absolute inset-10 rounded-full border-t-[6px] border-white/20 rotate-45"></div>
                        </div>
                        <div className="absolute top-[45%] right-[-5%] w-[25vw] h-[25vw] min-w-[300px] min-h-[300px] rounded-full bg-gradient-to-br from-[#d946ef] to-[#581c87] shadow-[0_0_40px_rgba(217,70,239,0.4)]"></div>
                    </div>

                    <Link to="/" className="relative z-10 flex items-center gap-3 hover:opacity-80 transition-opacity group" aria-label="Volver al inicio">
                        <div className="absolute inset-0 bg-black/60 blur-[60px] rounded-full scale-[2.5] -z-10"></div>
                        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="h-16 w-auto relative z-10" aria-hidden="true" />
                    </Link>

                    <div className="relative z-10 mb-4 xl:mb-8 text-left">
                        <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-4 drop-shadow-2xl uppercase">
                            {heroTitle}
                        </h1>
                        <p className="text-purple-200 text-base max-w-sm font-medium">
                            {heroSubtitle}
                        </p>
                    </div>
                </div>

                {/* Panel Derecho - Formulario */}
                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col relative bg-transparent md:bg-[#150c2b] justify-center items-center">
                    <div className="absolute top-4 left-4 right-4 md:top-10 md:left-12 md:right-12 flex justify-between items-center z-20">
                        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors group" aria-label="Volver a la tienda">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            <span>Volver</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 font-medium hidden sm:block">{switchText}</span>
                            <Link to={switchLink} className="relative inline-flex items-center justify-center px-5 md:px-6 py-2.5 text-sm font-bold text-purple-300 transition-all duration-300 bg-purple-900/10 border border-purple-500/30 rounded-xl hover:bg-purple-900/20 hover:border-cyan-400/50 backdrop-blur-sm">
                                {switchLinkText}
                            </Link>
                        </div>
                    </div>

                    <div id="auth-content" className="w-full max-w-sm md:max-w-md mx-auto flex flex-col justify-center min-h-[85vh] md:min-h-0 px-4 sm:px-0 pt-12 md:pt-0">
                        <Link to="/" className="md:hidden relative flex items-center gap-3 mb-10 justify-center hover:opacity-80 transition-opacity" aria-label="Volver al inicio">
                            <div className="absolute inset-0 bg-black/60 blur-[30px] rounded-full scale-[2] -z-10"></div>
                            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="h-11 w-auto relative z-10" aria-hidden="true" />
                        </Link>

                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight uppercase">{title}</h2>
                            <p className="text-gray-400 text-sm md:text-base">{subtitle}</p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
