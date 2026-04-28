import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'

/**
 * Componente raíz de la aplicación.
 * Configura el enrutamiento principal de GameFind.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal: Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Ruta de Login: Implementada según diseño proporcionado */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
