import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

/**
 * Componente raíz de la aplicación.
 * Configura el enrutamiento principal con HashRouter para GitHub Pages.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal: Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Ruta de Login: Implementada según diseño proporcionado */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Register: Implementada según diseño proporcionado */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
