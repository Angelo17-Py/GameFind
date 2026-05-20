import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Register from './pages/Register'
import Favoritos from './pages/Favoritos'
import Perfil from './pages/Perfil'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Inicio />} />
      </Routes>
    </Router>
  )
}

export default App
