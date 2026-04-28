import { useState } from 'react'

/**
 * Componente principal de la aplicación GameFind.
 * Gestiona la interfaz de usuario, el buscador y la visualización de ofertas.
 */
function App() {
  // Estado para manejar el valor del buscador
  const [search, setSearch] = useState('')

  // Datos mock para las ofertas destacadas (esto vendrá de una API en el futuro)
  const featuredGames = [
    { id: 1, title: 'Cyberpunk 2077', price: '$29.99', platform: 'Steam', image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Elden Ring', price: '$44.50', platform: 'Epic Games', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'God of War', price: '$35.00', platform: 'PlayStation', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80' },
  ]

  return (
    <div className="relative min-h-screen pt-20">
      {/* Navegación Principal: Fija en la parte superior con efecto glassmorphism */}
      <nav className="glass fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo con degradado */}
          <div className="text-2xl font-extrabold text-white">
            Game<span className="bg-grad-primary bg-clip-text text-transparent">Find</span>
          </div>
          {/* Enlaces de navegación (Ocultos en móvil) */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-slate-400 hover:text-accent transition-colors font-medium">Explorar</a>
            <a href="#" className="text-slate-400 hover:text-accent transition-colors font-medium">Ofertas</a>
            <a href="#" className="text-slate-400 hover:text-accent transition-colors font-medium">Tendencias</a>
            <button className="btn-primary">Ingresar</button>
          </div>
        </div>
      </nav>

      {/* Sección Hero: Título principal y buscador */}
      <header className="container mx-auto px-6 pt-24 pb-16 text-center">
        <div className="animate-fade">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-grad-primary bg-clip-text text-transparent leading-tight">
            Encuentra tu próximo juego al mejor precio
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Comparamos miles de tiendas para que no pagues ni un centavo de más.
          </p>
          
          {/* Input de búsqueda con diseño personalizado */}
          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-3xl mx-auto">
            <input 
              type="text" 
              placeholder="¿Qué quieres jugar hoy?" 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="bg-grad-primary text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-accent/20">
              🔍 Buscar
            </button>
          </div>
        </div>
      </header>

      {/* Sección de Ofertas: Grid responsivo de juegos */}
      <section className="container mx-auto px-6 py-16 animate-fade">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold text-white">Ofertas Destacadas</h2>
          <a href="#" className="text-accent hover:underline">Ver todas →</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredGames.map(game => (
            <div key={game.id} className="glass group overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-accent">
              {/* Imagen del juego con zoom al hacer hover */}
              <div 
                className="h-48 bg-cover bg-center relative transition-transform duration-500 group-hover:scale-110" 
                style={{backgroundImage: `url(${game.image})`}}
              >
                {/* Etiqueta de plataforma */}
                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/10">
                  {game.platform}
                </span>
              </div>
              {/* Información del juego */}
              <div className="p-6 relative z-10 bg-bg-dark/80 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4">{game.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-accent">{game.price}</span>
                  <button className="border border-accent text-accent px-4 py-2 rounded-lg hover:bg-accent hover:text-white transition-all">
                    Comparar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pie de página */}
      <footer className="container mx-auto px-6 py-12 mt-12 border-t border-white/5 text-center">
        <p className="text-slate-500">&copy; 2026 GameFind. Desarrollado con ❤️ para gamers.</p>
      </footer>

      {/* Elementos Decorativos: Blobs de fondo para el efecto visual neón */}
      <div className="blob top-[-200px] right-[-100px]"></div>
      <div className="blob bottom-[-200px] left-[-100px] bg-indigo-500/10"></div>
    </div>
  )
}

export default App
