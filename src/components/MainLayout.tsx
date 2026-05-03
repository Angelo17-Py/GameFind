import React from 'react'
import Navbar from './Navbar'

interface MainLayoutProps {
    children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-[#0c061a] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
            <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
            
            {/* --- FONDO DECORATIVO --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[5%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-[#00f0ff]/5 to-transparent blur-3xl opacity-40"></div>
                <div className="absolute bottom-[5%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#d946ef]/5 to-transparent blur-3xl opacity-30"></div>
            </div>

            <Navbar />

            <div className="h-20 md:h-28"></div>

            <main id="main-content" className="relative z-10">
                {children}
            </main>

            <footer className="relative z-10 py-12 px-6 bg-black/40 backdrop-blur-xl border-t border-white/5">
                <div className="container mx-auto flex flex-col items-center gap-6 text-center">
                    <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="GameFind" className="h-7 w-auto opacity-30" />
                    <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest font-medium">
                        © 2026 GameFind
                    </p>
                </div>
            </footer>
        </div>
    )
}
