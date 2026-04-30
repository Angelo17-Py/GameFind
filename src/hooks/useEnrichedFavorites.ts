import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface EnrichedFavorite {
    game_id: string
    title: string
    image: string
    currentPrice: string
    dealUrl: string
}

export function useEnrichedFavorites(userId: string | undefined) {
    const [favorites, setFavorites] = useState<EnrichedFavorite[]>([])
    const [loading, setLoading] = useState(false)

    const fetchFavorites = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        
        if (error) {
            console.error('Error fetching favorites:', error)
            setFavorites([])
        } else if (data) {
            const enrichedData = await Promise.all(data.map(async (fav) => {
                try {
                    const res = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${fav.game_id}`)
                    const gameData = await res.json()
                    const lowestDeal = gameData.deals.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))[0]
                    return { 
                        game_id: fav.game_id,
                        title: fav.title,
                        image: fav.image,
                        currentPrice: lowestDeal ? lowestDeal.price : 'N/A', 
                        dealUrl: lowestDeal ? `https://www.cheapshark.com/redirect?dealID=${lowestDeal.dealID}` : '#'
                    }
                } catch(e) {
                    return { 
                        game_id: fav.game_id,
                        title: fav.title,
                        image: fav.image,
                        currentPrice: 'N/A', 
                        dealUrl: '#' 
                    }
                }
            }))
            setFavorites(enrichedData)
        }
        setLoading(false)
    }, [userId])

    const removeFavorite = async (gameId: string) => {
        if (!userId) return
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('game_id', gameId)

        if (!error) {
            setFavorites(prev => prev.filter(f => f.game_id !== gameId))
        }
    }

    return { favorites, loading, fetchFavorites, removeFavorite }
}
