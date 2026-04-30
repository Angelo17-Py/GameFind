import React from 'react'

interface StoreSelectorProps {
    storeMap: Record<string, { name: string, logo: string }>
    selectedStore: string
    onStoreChange: (id: string) => void
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({ storeMap, selectedStore, onStoreChange }) => {
    return (
        <div className="flex flex-col items-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black mb-8 uppercase tracking-tighter text-center">
                MEJORES OFERTAS <span className="text-cyan-400">POR TIENDA</span>
            </h2>

            <div className="flex flex-wrap justify-center gap-4" role="tablist" aria-label="Seleccionar tienda">
                {Object.entries(storeMap).map(([id, store]) => (
                    <button
                        key={id}
                        role="tab"
                        aria-selected={selectedStore === id}
                        aria-controls={`panel-${id}`}
                        id={`tab-${id}`}
                        onClick={() => onStoreChange(id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${selectedStore === id
                                ? 'bg-white/10 border-cyan-500 shadow-lg shadow-cyan-500/20 scale-105'
                                : 'bg-white/5 border-white/10 hover:border-white/30 grayscale hover:grayscale-0'
                            }`}
                    >
                        <img 
                            src={store.logo} 
                            alt="" 
                            className={`w-5 h-5 object-contain ${id === 'gog' ? 'invert brightness-200' : ''}`} 
                            aria-hidden="true" 
                        />
                        <span className={`text-xs font-black uppercase tracking-widest ${selectedStore === id ? 'text-cyan-400' : 'text-gray-400'}`}>
                            {store.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
