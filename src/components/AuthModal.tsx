import { Link } from 'react-router-dom'
import SocialLogin from './SocialLogin'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay con blur */}
            <div 
                className="absolute inset-0 bg-[#0c061a]/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Contenido del Modal */}
            <div className="relative w-full max-w-md bg-[#150c2b] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-purple-500/10 animate-in zoom-in-95 duration-300">
                {/* Botón Cerrar */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">¡Guarda tus favoritos!</h2>
                    <p className="text-gray-400 font-medium">Inicia sesión para llevar el control de tus juegos y recibir alertas de ofertas.</p>
                </div>

                <div className="space-y-4">
                    <Link 
                        to="/login"
                        className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl text-center shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all"
                    >
                        Iniciar Sesión
                    </Link>
                    
                    <Link 
                        to="/register"
                        className="block w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl text-center hover:bg-white/10 transition-all"
                    >
                        Crear Cuenta
                    </Link>

                    <SocialLogin />
                </div>

                <p className="text-center mt-8 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                    Únete a la comunidad GameFind
                </p>
            </div>
        </div>
    )
}
