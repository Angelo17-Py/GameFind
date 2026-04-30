import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Deal {
    store: string
    logo: string
    price: string
    retail: string
    savings: number
    url: string
}

export interface Game {
    id: string
    title: string
    image: string
    metacritic: string
    deals: Deal[]
}

// Mapa de tiendas con Slugs como claves
const STORE_MAP: Record<string, { name: string, logo: string }> = {
    "steam": { name: "Steam", logo: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" },
    "epic": { name: "Epic Games", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg" },
    "gog": { name: "GOG", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/GOG.com_logo.svg" },
    "gamesplanet": { name: "Gamesplanet", logo: "https://gpstatic.com/assets/gamesplanet_com_circle-4aac2ab0b9700fc58cb2631f1fd5d12fb5b162d956ab2c217dc61ec92d827d2e.svg" },
    "gamersgate": { name: "GamersGate", logo: "https://www.gamersgate.com/static/images/logo.svg" }
}

export function useDeals() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchDeals = useCallback(async (query = '', storeSlug = 'steam') => {
        setLoading(true)
        setError(null)
        try {
            let supabaseQuery = supabase
                .from('juegos')
                .select(`
                    id,
                    nombre,
                    imagen_url,
                    precios!inner (
                        precio_actual,
                        precio_original,
                        descuento,
                        url_oferta,
                        moneda,
                        tiendas!inner (
                            nombre,
                            logo_url,
                            slug
                        )
                    )
                `)

            // Si hay búsqueda, buscamos por nombre
            if (query) {
                supabaseQuery = supabaseQuery.ilike('nombre', `%${query}%`)
            } else {
                // Si NO hay búsqueda, filtramos por la tienda seleccionada Y que tengan descuento
                // Y que la información no tenga más de 24 horas de antigüedad
                const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                
                supabaseQuery = supabaseQuery
                    .eq('precios.tiendas.slug', storeSlug)
                    .gt('precios.descuento', 0)
                    .gt('precios.ultima_actualizacion', hace24Horas)
            }

            const { data, error: dbError } = await supabaseQuery.limit(24)

            if (dbError) throw dbError

            const mappedGames: Game[] = (data || []).map((j: any) => {
                const deals = (j.precios || [])
                    .filter((p: any) => p && p.tiendas)
                    .map((p: any) => ({
                        store: p.tiendas.nombre,
                        logo: p.tiendas.logo_url || STORE_MAP[p.tiendas.slug]?.logo || "",
                        price: parseFloat(p.precio_actual).toFixed(2),
                        retail: parseFloat(p.precio_original || p.precio_actual).toFixed(2),
                        savings: p.descuento || 0,
                        url: p.url_oferta
                    }))
                    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

                return {
                    id: j.id.toString(),
                    title: j.nombre,
                    image: j.imagen_url,
                    metacritic: "N/A",
                    deals
                }
            })

            // Ordenar: mejores descuentos primero
            const sortedGames = mappedGames
                .sort((a, b) => {
                    const maxA = Math.max(...a.deals.map(d => d.savings), 0);
                    const maxB = Math.max(...b.deals.map(d => d.savings), 0);
                    return maxB - maxA;
                });

            setGames(sortedGames)

        } catch (err) {
            console.error("Error fetching deals:", err)
            setError("Error al cargar las ofertas.")
        } finally {
            setLoading(false)
        }
    }, [])

    return { games, loading, error, fetchDeals, STORE_MAP }
}
