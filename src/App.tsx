import { useState } from 'react'
import './App.css'

function App() {
  const [search, setSearch] = useState('')

  const featuredGames = [
    { id: 1, title: 'Cyberpunk 2077', price: '$29.99', platform: 'Steam', image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Elden Ring', price: '$44.50', platform: 'Epic Games', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'God of War', price: '$35.00', platform: 'PlayStation', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80' },
  ]

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="glass nav-bar">
        <div className="container nav-content">
          <div className="logo">Game<span>Find</span></div>
          <div className="nav-links">
            <a href="#">Explorar</a>
            <a href="#">Ofertas</a>
            <a href="#">Tendencias</a>
            <button className="btn-primary">Ingresar</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section container">
        <div className="hero-content animate-fade">
          <h1>Encuentra tu próximo juego al mejor precio</h1>
          <p>Comparamos miles de tiendas para que no pagues ni un centavo de más.</p>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="¿Qué quieres jugar hoy?" 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn-search">🔍 Buscar</button>
          </div>
        </div>
      </header>

      {/* Featured Section */}
      <section className="featured container animate-fade">
        <div className="section-header">
          <h2>Ofertas Destacadas</h2>
          <a href="#">Ver todas →</a>
        </div>
        
        <div className="game-grid">
          {featuredGames.map(game => (
            <div key={game.id} className="game-card glass">
              <div className="game-image" style={{backgroundImage: `url(${game.image})`}}>
                <span className="platform-badge">{game.platform}</span>
              </div>
              <div className="game-info">
                <h3>{game.title}</h3>
                <div className="price-row">
                  <span className="price">{game.price}</span>
                  <button className="btn-buy">Comparar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer container">
        <p>&copy; 2026 GameFind. Desarrollado con ❤️ para gamers.</p>
      </footer>

      {/* Decorative Elements */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  )
}

export default App
