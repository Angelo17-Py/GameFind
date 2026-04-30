import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'
import { useDeals } from '../hooks/useDeals'
import { useFavorites } from '../hooks/useFavorites'
import { Hero } from '../components/home/Hero'
import { StoreSelector } from '../components/home/StoreSelector'
import { GameList } from '../components/home/GameList'

import { MainLayout } from '../components/MainLayout'

function Home() {
    const [searchTerm, setSearchTerm] = useState('')
    const [hasSearched, setHasSearched] = useState(false)
    const [selectedStore, setSelectedStore] = useState('steam')
    const [user, setUser] = useState<User | null>(null)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    const { games, loading, fetchDeals, STORE_MAP } = useDeals()
    const { favorites, fetchFavorites, toggleFavorite } = useFavorites(user?.id)

    useEffect(() => {
        if (!searchTerm.trim()) {
            fetchDeals('', selectedStore)
            setHasSearched(false)
        }
    }, [fetchDeals, searchTerm, selectedStore])

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (user) fetchFavorites()
    }, [user, fetchFavorites])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchTerm.trim()) return
        setHasSearched(true)
        fetchDeals(searchTerm)
    }

    const handleStoreChange = (id: string) => {
        setSelectedStore(id)
        setSearchTerm('')
        setHasSearched(false)
        fetchDeals('', id)
    }

    const handleToggleFavorite = async (game: any) => {
        if (!user) {
            setIsAuthModalOpen(true)
            return
        }
        await toggleFavorite({
            id: game.id,
            title: game.title,
            image: game.image
        })
    }

    return (
        <MainLayout>
            <Hero 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                handleSearch={handleSearch} 
                loading={loading} 
            />

            <div className="container mx-auto px-6 py-10 md:py-20">
                {!hasSearched && (
                    <StoreSelector 
                        storeMap={STORE_MAP} 
                        selectedStore={selectedStore} 
                        onStoreChange={handleStoreChange} 
                    />
                )}

                {hasSearched && (
                    <div className="flex justify-center mb-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                            RESULTADOS PARA <span className="text-purple-400">"{searchTerm}"</span>
                        </h2>
                    </div>
                )}

                <GameList 
                    games={games} 
                    favorites={favorites} 
                    onToggleFavorite={handleToggleFavorite} 
                    loading={loading} 
                />
            </div>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </MainLayout>
    )
}


export default Home



