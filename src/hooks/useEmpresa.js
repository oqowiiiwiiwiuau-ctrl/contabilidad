import { useState, useEffect } from 'react'
import { getEmpresaById } from '../services/cuentasService'

export function useEmpresa(empresaId) {
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!empresaId) {
      setEmpresa(null)
      return
    }
    setLoading(true)
    setError(null)
    getEmpresaById(empresaId)
      .then(setEmpresa)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [empresaId])

  return { empresa, loading, error }
}