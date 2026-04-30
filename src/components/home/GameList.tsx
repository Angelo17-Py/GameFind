import React from 'react'
import type { Game } from '../../hooks/useDeals'
import { GameCard } from './GameCard'

interface GameListProps {
    games: Game[]
    favorites: string[]
    onToggleFavorite: (game: Game) => void
    loading: boolean
}

export const GameList: React.FC<GameListProps> = ({ games, favorites, onToggleFavorite, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4" aria-live="polite">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Buscando ofertas...</span>
            </div>
        )
    }

    if (games.length === 0) {
        return (
            <div className="text-center py-20" aria-live="polite">
                <p className="text-gray-400 font-medium">No se encontraron resultados para tu búsqueda.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {games.map(game => (
                <GameCard 
                    key={game.id} 
                    game={game} 
                    isFavorite={favorites.includes(game.id)} 
                    onToggleFavorite={onToggleFavorite}
                />
            ))}
        </div>
    )
}
