// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { EmpresaProvider, useEmpresa } from './context/EmpresaContext'

import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'

import SeleccionEmpresa from './pages/SeleccionEmpresa'
import Dashboard from './pages/Dashboard'
import PlanCuentas from './pages/PlanCuentas'
import Asientos from './pages/Asientos'
import Libros from './pages/Libros'
import Reportes from './pages/Reportes'

import './App.css'

function RutasProtegidas() {
  const { empresaActiva } = useEmpresa()

  if (!empresaActiva) {
    return <Navigate to="/" replace />
  }

  return (
    <Routes key={empresaActiva.id}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/cuentas" element={<PlanCuentas />} />
      <Route path="/asientos" element={<Asientos />} />
      <Route path="/libros" element={<Libros />} />
      <Route path="/reportes" element={<Reportes />} />
    </Routes>
  )
}

function AppContent() {
  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar />
        <main className="contenido">
          <Routes>
            <Route path="/" element={<SeleccionEmpresa />} />
            <Route path="/*" element={<RutasProtegidas />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <EmpresaProvider>
        <AppContent />
      </EmpresaProvider>
    </BrowserRouter>
  )
}