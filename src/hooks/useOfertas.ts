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

type JuegoConPrecios = {
    id: string
    nombre: string
    imagen_url: string
    precios?: Array<{
        precio_actual: string | number
        precio_original: string | number | null
        descuento: number | null
        url_oferta: string
        moneda: string
        tiendas?: {
            nombre: string
            logo_url: string | null
            slug: string
        }
    }>
}

type ResultadoBusqueda = {
    id: string
    relevancia: number
}

function normalizeSearchText(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
}

// Mapa de tiendas con Slugs como claves
const STORE_MAP: Record<string, { name: string, logo: string }> = {
    "steam": { name: "Steam", logo: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" },
    "epic": { name: "Epic Games", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg" },
    "gog": { name: "GOG", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/GOG.com_logo.svg" },
    "gamesplanet": { name: "Gamesplanet", logo: "https://gpstatic.com/assets/gamesplanet_com_circle-4aac2ab0b9700fc58cb2631f1fd5d12fb5b162d956ab2c217dc61ec92d827d2e.svg" },
    "gamersgate": { name: "GamersGate", logo: "https://www.gamersgate.com/static/images/logo.svg" }
}

function createDealsQuery(requirePrices = true) {
    const preciosRelation = requirePrices ? 'precios!inner' : 'precios'

    return supabase
        .from('juegos')
        .select(`
            id,
            nombre,
            imagen_url,
            ${preciosRelation} (
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
}

function mapGames(data: JuegoConPrecios[]): Game[] {
    return (data || []).map((j) => {
        const deals = (j.precios || [])
            .filter((p) => p && p.tiendas)
            .map((p) => ({
                store: p.tiendas!.nombre,
                logo: p.tiendas!.logo_url || STORE_MAP[p.tiendas!.slug]?.logo || "",
                price: parseFloat(String(p.precio_actual)).toFixed(2),
                retail: parseFloat(String(p.precio_original || p.precio_actual)).toFixed(2),
                savings: p.descuento || 0,
                url: p.url_oferta
            }))
            .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))

        return {
            id: j.id.toString(),
            title: j.nombre,
            image: j.imagen_url,
            metacritic: "N/A",
            deals
        }
    })
}

export function useOfertas() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchDeals = useCallback(async (query = '', storeSlug = 'steam') => {
        setLoading(true)
        setError(null)

        try {
            const trimmedQuery = query.trim()
            const normalizedQuery = normalizeSearchText(trimmedQuery)
            let supabaseQuery = createDealsQuery(!trimmedQuery)
            let relevanceMap = new Map<string, number>()
            let orderByRelevance = false

            if (trimmedQuery) {
                const { data: searchResults, error: searchError } = await supabase.rpc('buscar_juegos', {
                    termino_busqueda: trimmedQuery,
                    limite_resultados: 24
                })

                if (searchError) {
                    console.warn('Busqueda inteligente no disponible, usando busqueda basica:', searchError)
                    supabaseQuery = supabaseQuery.or([
                        `nombre.ilike.%${trimmedQuery}%`,
                        `nombre_normalizado.ilike.%${normalizedQuery}%`,
                        `acronimo_normalizado.ilike.${normalizedQuery}%`
                    ].join(','))
                } else {
                    const results = (searchResults || []) as ResultadoBusqueda[]
                    const orderedIds = results.map((result) => result.id).filter(Boolean)

                    if (orderedIds.length === 0) {
                        supabaseQuery = supabaseQuery.or([
                            `nombre.ilike.%${trimmedQuery}%`,
                            `nombre_normalizado.ilike.%${normalizedQuery}%`,
                            `acronimo_normalizado.ilike.${normalizedQuery}%`
                        ].join(','))
                    } else {
                        relevanceMap = new Map(results.map((result) => [result.id, Number(result.relevancia)]))
                        orderByRelevance = true
                        supabaseQuery = supabaseQuery.in('id', orderedIds)
                    }
                }
            } else {
                const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

                supabaseQuery = supabaseQuery
                    .eq('precios.tiendas.slug', storeSlug)
                    .gt('precios.descuento', 0)
                    .gt('precios.ultima_actualizacion', hace24Horas)
            }

            const { data, error: dbError } = await supabaseQuery.limit(24)

            if (dbError) throw dbError

            const sortedGames = mapGames((data || []) as JuegoConPrecios[])
                .sort((a, b) => {
                    if (orderByRelevance) {
                        const relevanceDiff = (relevanceMap.get(b.id) || 0) - (relevanceMap.get(a.id) || 0)
                        if (relevanceDiff !== 0) return relevanceDiff
                    }

                    const maxA = Math.max(...a.deals.map((d) => d.savings), 0)
                    const maxB = Math.max(...b.deals.map((d) => d.savings), 0)
                    return maxB - maxA
                })

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
