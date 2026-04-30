import { useState, useCallback } from 'react'

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

const STORE_MAP: Record<string, { name: string, logo: string }> = {
    "1": { name: "Steam", logo: "https://www.cheapshark.com/img/stores/icons/0.png" },
    "2": { name: "GamersGate", logo: "https://www.cheapshark.com/img/stores/icons/1.png" },
    "3": { name: "GreenManGaming", logo: "https://www.cheapshark.com/img/stores/icons/2.png" },
    "7": { name: "GOG", logo: "https://www.cheapshark.com/img/stores/icons/6.png" },
    "11": { name: "Humble Store", logo: "https://www.cheapshark.com/img/stores/icons/10.png" },
    "25": { name: "Epic Games", logo: "https://www.cheapshark.com/img/stores/icons/24.png" }
}

export function useDeals() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchDeals = useCallback(async (query = '', storeId = '1') => {
        setLoading(true)
        setError(null)
        try {
            let url = ""
            if (query) {
                url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=20`
                const res = await fetch(url)
                const data = await res.json()

                const detailedGames = await Promise.all(data.map(async (g: any) => {
                    const gameRes = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${g.gameID}`)
                    const gameData = await gameRes.json()

                    const validDeals = gameData.deals.map((d: any) => ({
                        store: STORE_MAP[d.storeID]?.name || "Tienda",
                        logo: STORE_MAP[d.storeID]?.logo || "",
                        price: d.price,
                        retail: d.retailPrice,
                        savings: Math.round(parseFloat(d.savings)),
                        url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`
                    })).filter((d: any) => d.logo !== "").sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price)).slice(0, 3)

                    return {
                        id: g.gameID,
                        title: g.external,
                        image: g.thumb,
                        metacritic: gameData.info.metacriticScore || "N/A",
                        deals: validDeals
                    }
                }))
                setGames(detailedGames.filter(g => g.deals.length > 0).slice(0, 12))
            } else {
                url = `https://www.cheapshark.com/api/1.0/deals?storeID=${storeId}&upperPrice=60&sortBy=Savings&pageSize=15`
                const res = await fetch(url)
                const data = await res.json()

                const enrichedDeals = await Promise.all(data.map(async (deal: any) => {
                    const gameRes = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${deal.gameID}`)
                    const gameData = await gameRes.json()

                    return {
                        id: deal.gameID,
                        title: deal.title,
                        image: deal.thumb,
                        metacritic: deal.metacriticScore || "N/A",
                        deals: gameData.deals.map((d: any) => ({
                            store: STORE_MAP[d.storeID]?.name || "Tienda",
                            logo: STORE_MAP[d.storeID]?.logo || "",
                            price: d.price,
                            retail: d.retailPrice,
                            savings: Math.round(parseFloat(d.savings)),
                            url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`
                        })).filter((d: any) => d.logo !== "").sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price)).slice(0, 3)
                    }
                }))
                setGames(enrichedDeals.filter(g => g.deals.length > 0))
            }
        } catch (err) {
            console.error("Error fetching deals:", err)
            setError("No se pudieron cargar las ofertas. Reintenta más tarde.")
        } finally {
            setLoading(false)
        }
    }, [])

    return { games, loading, error, fetchDeals, STORE_MAP }
}
