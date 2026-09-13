// src/hooks/useCuentas.js
import { useState, useEffect, useCallback } from 'react'
import {
  getCuentasByEmpresa,
  crearCuenta,
  actualizarCuenta,
  desactivarCuenta,
  cargarPlanCompleto,
} from '../services/cuentasService'

export function useCuentas(empresaId) {
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargarCuentas = useCallback(async () => {
    if (!empresaId) {
      console.log('⚠️ empresaId es null')
      setCuentas([])
      return
    }
    console.log('🔍 Cargando cuentas para:', empresaId)
    setLoading(true)
    setError(null)
    try {
      const data = await getCuentasByEmpresa(empresaId)
      console.log('✅ Cuentas cargadas:', data.length)
      setCuentas(data)
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    cargarCuentas()
  }, [cargarCuentas])

  const handleCrear = async (cuenta) => {
    const nueva = await crearCuenta({ ...cuenta, empresa_id: empresaId })
    setCuentas(prev => [...prev, nueva])
    return nueva
  }

  const handleActualizar = async (id, cambios) => {
    const actualizada = await actualizarCuenta(id, cambios)
    setCuentas(prev => prev.map(c => (c.id === id ? actualizada : c)))
    return actualizada
  }

  const handleDesactivar = async (id) => {
    await desactivarCuenta(id)
    setCuentas(prev => prev.map(c => (c.id === id ? { ...c, activa: false } : c)))
  }

  const handleCargarPlan = async () => {
    await cargarPlanCompleto(empresaId)
    await cargarCuentas()
  }

  return {
    cuentas,
    loading,
    error,
    cargarCuentas,
    crearCuenta: handleCrear,
    actualizarCuenta: handleActualizar,
    desactivarCuenta: handleDesactivar,
    cargarPlanCompleto: handleCargarPlan,
  }
}