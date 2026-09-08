import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'

import Dashboard from './pages/Dashboard'
import PlanCuentas from './pages/PlanCuentas'
import Asientos from './pages/Asientos'
import Libros from './pages/Libros'
import Reportes from './pages/Reportes'

import './App.css'

function App() {
  return (
    <BrowserRouter>

      <Header />

      <div className="layout">

        <Sidebar />

        <main className="contenido">

          <Routes>

            <Route path="/" element={<Dashboard />} />

            <Route
              path="/cuentas"
              element={<PlanCuentas />}
            />

            <Route
              path="/asientos"
              element={<Asientos />}
            />

            <Route
              path="/libros"
              element={<Libros />}
            />

            <Route
              path="/reportes"
              element={<Reportes />}
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>
  )
}

export default App
