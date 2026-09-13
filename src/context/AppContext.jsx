// src/context/AppContext.jsx
import { createContext, useContext, useState } from 'react'

// 👇 PEGA AQUÍ EL UUID REAL DE TU EMPRESA DEMO
const EMPRESA_DEMO_ID = '3f9dd324-965b-48e8-b973-8ff499169aec'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [empresaId, setEmpresaIdState] = useState(
    localStorage.getItem('empresaId') || EMPRESA_DEMO_ID
  )

  const setEmpresaId = (id) => {
    setEmpresaIdState(id)
    if (id) localStorage.setItem('empresaId', id)
    else localStorage.removeItem('empresaId')
  }

  return (
    <AppContext.Provider value={{ empresaId, setEmpresaId }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}