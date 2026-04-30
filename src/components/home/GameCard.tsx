import React from 'react'
import type { Game } from '../../hooks/useDeals'

interface GameCardProps {
    game: Game
    isFavorite: boolean
    onToggleFavorite: (game: Game) => void
}

export const GameCard: React.FC<GameCardProps> = ({ game, isFavorite, onToggleFavorite }) => {
    return (
        <div className="group relative animate-fade">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-[#150c2b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="h-48 overflow-hidden relative bg-black/40 flex items-center justify-center">
                    <img src={game.image} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125" alt="" aria-hidden="true" />
                    <img src={game.image} alt={`Portada de ${game.title}`} className="relative z-10 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                    
                    {/* Botón Favorito */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(game);
                        }}
                        className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white hover:text-red-500 transition-colors group/fav"
                        aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        aria-pressed={isFavorite}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill={isFavorite ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`transition-transform ${isFavorite ? 'text-red-500 scale-110' : 'group-hover/fav:scale-110'}`}
                            aria-hidden="true"
                        >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                    </button>

                    {game.metacritic !== "N/A" && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-yellow-400">
                            MC {game.metacritic}
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-6 line-clamp-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{game.title}</h3>

                    <div className="space-y-2 mb-6 flex-grow">
                        {game.deals.map((offer, idx) => (
                            <div
                                key={idx}
                                onClick={() => window.open(offer.url, '_blank')}
                                className={`flex justify-between items-center p-3 rounded-2xl border transition-all cursor-pointer group/row ${idx === 0
                                    ? 'bg-cyan-500/10 border-cyan-400/20 hover:bg-cyan-500/20'
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                                role="link"
                                aria-label={`Ver oferta de ${offer.store} por $${offer.price}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-white/10 p-1 flex items-center justify-center">
                                        <img 
                                            src={offer.logo} 
                                            alt="" 
                                            className={`w-full h-full object-contain ${offer.store === 'GOG' ? 'invert brightness-200' : ''}`} 
                                            aria-hidden="true" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-cyan-400' : 'text-gray-400'}`}>{offer.store}</span>
                                        {offer.savings > 0 && (
                                            <span className="text-[8px] font-bold text-green-500">-{offer.savings}%</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    {offer.savings > 0 && (
                                        <span className="text-[10px] text-gray-500 line-through font-medium">${offer.retail}</span>
                                    )}
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
    )
}
