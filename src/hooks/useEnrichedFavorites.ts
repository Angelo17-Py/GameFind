import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface EnrichedFavorite {
    juego_id: string
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
        // Consulta relacional directa: Obtenemos el favorito -> el juego -> sus precios
        const { data, error } = await supabase
            .from('favoritos')
            .select(`
                juego_id,
                juegos (
                    nombre,
                    imagen_url,
                    precios (
                        precio_actual,
                        url_oferta
                    )
                )
            `)
            .eq('usuario_id', userId)
            .order('fecha_creacion', { ascending: false })
        
        if (error) {
            console.error('Error fetching favorites:', error)
            setFavorites([])
        } else if (data) {
            const enrichedData = data.map((fav: any) => {
                const juego = fav.juegos;
                // Encontrar el precio más bajo (si existe en alguna tienda)
                let lowestPrice = 'N/A';
                let dealUrl = '#';

                if (juego.precios && juego.precios.length > 0) {
                    const bestDeal = juego.precios.reduce((prev: any, current: any) => 
                        (prev.precio_actual < current.precio_actual) ? prev : current
                    );
                    lowestPrice = bestDeal.precio_actual.toString();
                    dealUrl = bestDeal.url_oferta;
                }

                return { 
                    juego_id: fav.juego_id,
                    title: juego.nombre,
                    image: juego.imagen_url,
                    currentPrice: lowestPrice, 
                    dealUrl: dealUrl
                }
            })
            setFavorites(enrichedData)
        }
        setLoading(false)
    }, [userId])

    const removeFavorite = async (juegoId: string) => {
        if (!userId) return
        const { error } = await supabase
            .from('favoritos')
            .delete()
            .eq('usuario_id', userId)
            .eq('juego_id', juegoId)

        if (!error) {
            setFavorites(prev => prev.filter(f => f.juego_id !== juegoId))
        }
    }

    return { favorites, loading, fetchFavorites, removeFavorite }
}
