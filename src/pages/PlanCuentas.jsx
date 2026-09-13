// src/pages/PlanCuentas.jsx
import { useState, useMemo } from 'react'
import { useCuentas } from '../hooks/useCuentas'
import { useApp } from '../context/AppContext'
import CuentaTree from '../components/contabilidad/CuentaTree'
import CuentaForm from '../components/contabilidad/CuentaForm'

export default function PlanCuentas() {
  const { empresaId } = useApp()
  const {
    cuentas = [],
    loading,
    error,
    crearCuenta,
    actualizarCuenta,
    desactivarCuenta,
    cargarPlanCompleto,
  } = useCuentas(empresaId)

  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const cuentasFiltradas = useMemo(() => {
    const lista = Array.isArray(cuentas) ? cuentas : []
    let result = lista

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter(
        c =>
          c.codigo?.toLowerCase().includes(q) ||
          c.nombre?.toLowerCase().includes(q)
      )
    }

    if (filtroTipo) {
      result = result.filter(c => c.tipo === filtroTipo)
    }

    return result
  }, [cuentas, busqueda, filtroTipo])

  const handleNuevaCuenta = () => {
    setCuentaSeleccionada(null)
    setModalAbierto(true)
  }

  const handleEditarCuenta = (cuenta) => {
    setCuentaSeleccionada(cuenta)
    setModalAbierto(true)
  }

  const handleGuardar = async (datos) => {
    if (cuentaSeleccionada) {
      await actualizarCuenta(cuentaSeleccionada.id, datos)
    } else {
      await crearCuenta(datos)
    }
    setModalAbierto(false)
  }

  const handleCargarPlan = async () => {
    if (!confirm('¿Cargar el plan de cuentas completo?')) return
    try {
      await cargarPlanCompleto()
      alert('¡Plan cargado!')
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Cargando cuentas...</div>
  }

  if (error) {
    return (
      <div style={{ padding: 40, color: 'red' }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Plan de Cuentas</h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            {cuentas.length} cuentas en total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {cuentas.length === 0 && (
            <button
              onClick={handleCargarPlan}
              style={{
                padding: '8px 16px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Cargar plan recomendado
            </button>
          )}
          <button
            onClick={handleNuevaCuenta}
            style={{
              padding: '8px 16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            + Nueva cuenta
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
        />
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
        >
          <option value="">Todos los tipos</option>
          <option value="ACTIVO">Activo</option>
          <option value="PASIVO">Pasivo</option>
          <option value="PATRIMONIO">Patrimonio</option>
          <option value="INGRESO">Ingreso</option>
          <option value="GASTO">Gasto</option>
        </select>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 4,
          background: 'white',
          padding: 8,
          maxHeight: '70vh',
          overflow: 'auto',
        }}
      >
        {cuentasFiltradas.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#999',
              padding: 32,
            }}
          >
            {cuentas.length === 0
              ? 'Aún no tienes cuentas.'
              : 'No hay cuentas que coincidan.'}
          </div>
        ) : (
          <CuentaTree
            cuentas={cuentasFiltradas}
            onSelect={handleEditarCuenta}
          />
        )}
      </div>

      {modalAbierto && (
        <CuentaForm
          cuenta={cuentaSeleccionada}
          cuentas={cuentas}
          onGuardar={handleGuardar}
          onCerrar={() => setModalAbierto(false)}
          onDesactivar={desactivarCuenta}
        />
      )}
    </div>
  )
}