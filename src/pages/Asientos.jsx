// src/pages/Asientos.jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAsientos } from '../hooks/useAsientos'
import { useCuentas } from '../hooks/useCuentas'
import AsientoForm from '../components/contabilidad/AsientoForm'

export default function Asientos() {
  const { empresaId } = useApp()
  const { cuentas } = useCuentas(empresaId)
  const {
    asientos,
    loading,
    error,
    crearAsiento,
    anularAsiento,
    eliminarAsiento,
  } = useAsientos(empresaId)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [expandido, setExpandido] = useState(null)

  const handleCrear = async (datos) => {
    await crearAsiento(datos)
    alert('✅ Asiento creado correctamente')
  }

  const handleAnular = async (id) => {
    if (!confirm('¿Anular este asiento? No se borrará, quedará con estado ANULADO.')) return
    await anularAsiento(id)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este asiento? Esta acción no se puede deshacer.')) return
    await eliminarAsiento(id)
  }

  if (loading) return <div style={{ padding: 40 }}>Cargando asientos...</div>
  if (error) return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Asientos Contables</h1>
          <p style={{ color: '#666', fontSize: 14, margin: '4px 0 0 0' }}>
            {asientos.length} asientos registrados
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          disabled={cuentas.length === 0}
          style={{
            padding: '10px 20px',
            background: cuentas.length === 0 ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: cuentas.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          + Nuevo Asiento
        </button>
      </div>

      {/* Lista */}
      {asientos.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: '#999',
            background: 'white',
            borderRadius: 8,
            border: '1px dashed #e5e7eb',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p style={{ fontSize: 16, margin: 0 }}>No hay asientos registrados</p>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
            Haz click en "Nuevo Asiento" para empezar
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Concepto</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Debe</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Haber</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {asientos.map(a => {
                const totalDebe = (a.partidas || []).reduce(
                  (s, p) => s + parseFloat(p.debe || 0),
                  0
                )
                const totalHaber = (a.partidas || []).reduce(
                  (s, p) => s + parseFloat(p.haber || 0),
                  0
                )
                const isOpen = expandido === a.id

                const estadoColor = {
                  BORRADOR: { bg: '#fef3c7', color: '#92400e' },
                  CONTABILIZADO: { bg: '#dcfce7', color: '#166534' },
                  ANULADO: { bg: '#fee2e2', color: '#991b1b' },
                }[a.estado] || { bg: '#f3f4f6', color: '#374151' }

                return (
                  <>
                    <tr
                      key={a.id}
                      onClick={() => setExpandido(isOpen ? null : a.id)}
                      style={{
                        borderTop: '1px solid #f3f4f6',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>
                          #{a.numero}
                        </span>
                      </td>
                      <td style={tdStyle}>{new Date(a.fecha).toLocaleDateString('es-BO')}</td>
                      <td style={tdStyle}>{a.concepto}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                        {totalDebe.toFixed(2)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                        {totalHaber.toFixed(2)}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: estadoColor.bg,
                            color: estadoColor.color,
                            fontWeight: 600,
                          }}
                        >
                          {a.estado}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setExpandido(isOpen ? null : a.id)
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#6b7280',
                          }}
                        >
                          {isOpen ? '▼' : '▶'}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${a.id}-detail`}>
                        <td colSpan={7} style={{ padding: 0, background: '#fafafa' }}>
                          <div style={{ padding: '12px 40px' }}>
                            <table style={{ width: '100%', fontSize: 13 }}>
                              <thead>
                                <tr style={{ color: '#6b7280' }}>
                                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Cuenta</th>
                                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Descripción</th>
                                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>Debe</th>
                                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>Haber</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(a.partidas || []).map(p => (
                                  <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>
                                      {p.cuentas?.codigo} — {p.cuentas?.nombre}
                                    </td>
                                    <td style={{ padding: '4px 8px', color: '#6b7280' }}>
                                      {p.descripcion}
                                    </td>
                                    <td style={{ padding: '4px 8px', textAlign: 'right', fontFamily: 'monospace' }}>
                                      {parseFloat(p.debe) > 0 ? parseFloat(p.debe).toFixed(2) : ''}
                                    </td>
                                    <td style={{ padding: '4px 8px', textAlign: 'right', fontFamily: 'monospace' }}>
                                      {parseFloat(p.haber) > 0 ? parseFloat(p.haber).toFixed(2) : ''}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                              {a.estado !== 'ANULADO' && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleAnular(a.id)
                                  }}
                                  style={{
                                    padding: '4px 12px',
                                    fontSize: 12,
                                    border: '1px solid #f59e0b',
                                    background: 'white',
                                    color: '#92400e',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Anular
                                </button>
                              )}
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  handleEliminar(a.id)
                                }}
                                style={{
                                  padding: '4px 12px',
                                  fontSize: 12,
                                  border: '1px solid #dc2626',
                                  background: 'white',
                                  color: '#dc2626',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <AsientoForm
          cuentas={cuentas}
          onGuardar={handleCrear}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  )
}

const thStyle = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const tdStyle = {
  padding: '12px 16px',
  fontSize: 13,
}