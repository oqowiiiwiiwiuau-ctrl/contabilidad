// src/hooks/useAsientos.js
import { useState, useEffect, useCallback } from 'react'
import {
  getAsientosByEmpresa,
  crearAsiento as crearAsientoService,
  anularAsiento as anularAsientoService,
  eliminarAsiento as eliminarAsientoService,
} from '../services/asientosService'

export function useAsientos(empresaId) {
  const [asientos, setAsientos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargarAsientos = useCallback(async () => {
    if (!empresaId) {
      setAsientos([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getAsientosByEmpresa(empresaId)
      setAsientos(data)
    } catch (err) {
      console.error('Error cargando asientos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    cargarAsientos()
  }, [cargarAsientos])

  const crearAsiento = async (datos) => {
    const id = await crearAsientoService({
      empresaId,
      ...datos,
    })
    await cargarAsientos()
    return id
  }

  const anularAsiento = async (id) => {
    await anularAsientoService(id)
    await cargarAsientos()
  }

  const eliminarAsiento = async (id) => {
    await eliminarAsientoService(id)
    await cargarAsientos()
  }

  return {
    asientos,
    loading,
    error,
    cargarAsientos,
    crearAsiento,
    anularAsiento,
    eliminarAsiento,
  }
}