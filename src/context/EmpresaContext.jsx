// src/context/EmpresaContext.jsx
import { createContext, useContext, useState } from 'react'

// 1. Creamos el contexto (la "caja" donde guardaremos los datos globales)
const EmpresaContext = createContext()

// 2. Proveedor: Envuelve a toda la app y les da acceso a los datos a sus hijos
export function EmpresaProvider({ children }) {
  // Guardamos la empresa activa en el estado global
  const [empresaActiva, setEmpresaActiva] = useState(null)

  return (
    <EmpresaContext.Provider value={{ empresaActiva, setEmpresaActiva }}>
      {children}
    </EmpresaContext.Provider>
  )
}

// 3. Hook personalizado: Para que los componentes consuman esto fácilmente
export function useEmpresa() {
  const context = useContext(EmpresaContext)
  if (!context) {
    throw new Error('useEmpresa debe usarse dentro de un EmpresaProvider')
  }
  return context
}