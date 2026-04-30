import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFavorites(userId: string | undefined) {
    const [favorites, setFavorites] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const fetchFavorites = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        const { data, error } = await supabase
            .from('favoritos')
            .select('juego_id')
            .eq('usuario_id', userId)
        
        if (error) {
            console.error('Error fetching favorites:', error)
        } else {
            setFavorites(data.map(f => f.juego_id))
        }
        setLoading(false)
    }, [userId])

    const toggleFavorite = async (game: { id: string, title: string, image: string }) => {
        if (!userId) return { error: 'User not logged in' }

        const isFavorite = favorites.includes(game.id)

        if (isFavorite) {
            const { error } = await supabase
                .from('favoritos')
                .delete()
                .eq('usuario_id', userId)
                .eq('juego_id', game.id)

            if (!error) {
                setFavorites(prev => prev.filter(id => id !== game.id))
            }
            return { error }
        } else {
            const { error } = await supabase
                .from('favoritos')
                .insert([
                    { 
                        usuario_id: userId, 
                        juego_id: game.id
                    }
                ])

            if (!error) {
                setFavorites(prev => [...prev, game.id])
            }
            return { error }
        }
    }

    return { favorites, loading, fetchFavorites, toggleFavorite }
}
