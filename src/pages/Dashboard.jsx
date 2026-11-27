// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useEmpresa } from '../context/EmpresaContext'
import { getCuentasByEmpresa } from '../services/cuentasService'

export default function Dashboard() {
  const { empresaActiva } = useEmpresa()
  const [totalCuentas, setTotalCuentas] = useState(0)
  const [loadingCuentas, setLoadingCuentas] = useState(true)

  // Cargamos el conteo de cuentas reales de la empresa seleccionada
  useEffect(() => {
    if (!empresaActiva) return

    async function cargarConteo() {
      setLoadingCuentas(true)
      try {
        const cuentas = await getCuentasByEmpresa(empresaActiva.id)
        setTotalCuentas(cuentas.length)
      } catch (err) {
        console.error("Error al contar cuentas:", err)
      } finally {
        setLoadingCuentas(false)
      }
    }
    cargarConteo()
  }, [empresaActiva])

  if (!empresaActiva) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
        No hay empresa seleccionada. Por favor, vuelve al inicio.
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      {/* TARJETA AZUL ORIGINAL (con datos dinámicos) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          color: 'white',
          padding: 24,
          borderRadius: 12,
          marginBottom: 32,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            🏢
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 'bold', margin: 0 }}>
              {/* 👇 ESTO ES LO QUE CAMBIA DINÁMICAMENTE */}
              {empresaActiva.nombre}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: 24,
                marginTop: 8,
                fontSize: 14,
                opacity: 0.9,
              }}
            >
              <span>NIT: {empresaActiva.nit || '—'}</span>
              <span>Moneda: {empresaActiva.moneda || 'BOB'}</span>
              <span>
                {loadingCuentas ? 'Contando...' : `${totalCuentas} cuentas activas`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACCIONES (Tus tarjetas de siempre) */}
      <h2
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 16,
          color: '#111827',
        }}
      >
        ¿Qué deseas hacer?
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        <DashCard
          to="/asientos"
          icon="📝"
          titulo="Asientos"
          descripcion="Registrar asientos contables"
        />
        <DashCard
          to="/cuentas"
          icon="📒"
          titulo="Plan de cuentas"
          descripcion="Administrar cuentas contables"
        />
        <DashCard
          to="/libros"
          icon="📖"
          titulo="Libros"
          descripcion="Consultar libros contables"
        />
        <DashCard
          to="/reportes"
          icon="📊"
          titulo="Reportes"
          descripcion="Generar estados financieros"
        />
      </div>
    </div>
  )
}

// Tu componente DashCard se mantiene intacto
function DashCard({ to, icon, titulo, descripcion }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        display: 'block',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#2563eb'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#111827',
          marginBottom: 4,
        }}
      >
        {titulo}
      </div>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{descripcion}</div>
    </Link>
  )
}