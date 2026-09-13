// src/components/contabilidad/AsientoForm.jsx
import { useState, useMemo } from 'react'

export default function AsientoForm({ cuentas, onGuardar, onCerrar }) {
  const hoy = new Date().toISOString().split('T')[0]

  const [fecha, setFecha] = useState(hoy)
  const [concepto, setConcepto] = useState('')
  const [lineas, setLineas] = useState([
    { cuenta_id: '', descripcion: '', debe: '', haber: '' },
    { cuenta_id: '', descripcion: '', debe: '', haber: '' },
  ])
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Solo cuentas que permiten movimientos
  const cuentasDisponibles = useMemo(() => {
    return cuentas
      .filter(c => c.permite_movimientos && c.activa)
      .sort((a, b) =>
        (a.codigo || '').localeCompare(b.codigo || '', undefined, { numeric: true })
      )
  }, [cuentas])

  // Totales calculados
  const totalDebe = lineas.reduce(
    (s, l) => s + (parseFloat(l.debe) || 0),
    0
  )
  const totalHaber = lineas.reduce(
    (s, l) => s + (parseFloat(l.haber) || 0),
    0
  )
  const cuadrado = Math.abs(totalDebe - totalHaber) < 0.01 && totalDebe > 0

  const agregarLinea = () => {
    setLineas(prev => [
      ...prev,
      { cuenta_id: '', descripcion: '', debe: '', haber: '' },
    ])
  }

  const eliminarLinea = (idx) => {
    if (lineas.length <= 2) return
    setLineas(prev => prev.filter((_, i) => i !== idx))
  }

  const cambiarLinea = (idx, campo, valor) => {
    setLineas(prev =>
      prev.map((l, i) => (i === idx ? { ...l, [campo]: valor } : l))
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // Validaciones
    if (!fecha) return setErrorMsg('Falta la fecha')
    if (!concepto.trim()) return setErrorMsg('Falta el concepto')

    const partidasValidas = lineas.filter(
      l => l.cuenta_id && (parseFloat(l.debe) > 0 || parseFloat(l.haber) > 0)
    )

    if (partidasValidas.length < 2) {
      return setErrorMsg('Necesitas al menos 2 partidas')
    }

    if (!cuadrado) {
      return setErrorMsg('El asiento no cuadra: Debe ≠ Haber')
    }

    // Convertir a formato para el backend
    const partidas = partidasValidas.map(l => ({
      cuenta_id: l.cuenta_id,
      descripcion: l.descripcion || '',
      debe: parseFloat(l.debe) || 0,
      haber: parseFloat(l.haber) || 0,
    }))

    setGuardando(true)
    try {
      await onGuardar({ fecha, concepto, partidas })
      onCerrar()
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          width: '100%',
          maxWidth: 900,
          maxHeight: '95vh',
          overflow: 'auto',
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>
            Nuevo Asiento Contable
          </h2>
          <button
            onClick={onCerrar}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 24,
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Cabecera */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
                Concepto
              </label>
              <input
                type="text"
                value={concepto}
                onChange={e => setConcepto(e.target.value)}
                placeholder="Ej: Compra de mercadería al contado"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Tabla de partidas */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: 12,
            }}
          >
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={thStyle}>Cuenta</th>
                <th style={thStyle}>Descripción</th>
                <th style={{ ...thStyle, width: 120, textAlign: 'right' }}>Debe</th>
                <th style={{ ...thStyle, width: 120, textAlign: 'right' }}>Haber</th>
                <th style={{ ...thStyle, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((linea, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>
                    <select
                      value={linea.cuenta_id}
                      onChange={e => cambiarLinea(idx, 'cuenta_id', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 13,
                        fontFamily: 'monospace',
                      }}
                    >
                      <option value="">— Seleccionar —</option>
                      {cuentasDisponibles.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.codigo} — {c.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={linea.descripcion}
                      onChange={e => cambiarLinea(idx, 'descripcion', e.target.value)}
                      placeholder="Detalle (opcional)"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 13,
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={linea.debe}
                      onChange={e => cambiarLinea(idx, 'debe', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 13,
                        textAlign: 'right',
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={linea.haber}
                      onChange={e => cambiarLinea(idx, 'haber', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 13,
                        textAlign: 'right',
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    {lineas.length > 2 && (
                      <button
                        type="button"
                        onClick={() => eliminarLinea(idx)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontSize: 16,
                        }}
                        title="Eliminar línea"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#f9fafb', fontWeight: 'bold' }}>
                <td style={{ ...tdStyle, textAlign: 'right' }} colSpan={2}>
                  TOTALES
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                  {totalDebe.toFixed(2)}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                  {totalHaber.toFixed(2)}
                </td>
                <td style={tdStyle}>
                  {cuadrado ? (
                    <span style={{ color: '#16a34a', fontSize: 16 }}>✓</span>
                  ) : (
                    <span style={{ color: '#dc2626', fontSize: 16 }}>✗</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <button
            type="button"
            onClick={agregarLinea}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              border: '1px dashed #9ca3af',
              background: 'transparent',
              color: '#374151',
              borderRadius: 4,
              cursor: 'pointer',
              marginBottom: 20,
            }}
          >
            + Agregar línea
          </button>

          {/* Error */}
          {errorMsg && (
            <div
              style={{
                padding: 12,
                background: '#fef2f2',
                color: '#991b1b',
                borderRadius: 6,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Botones */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              paddingTop: 16,
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !cuadrado}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: cuadrado && !guardando ? '#2563eb' : '#9ca3af',
                color: 'white',
                borderRadius: 6,
                cursor: cuadrado && !guardando ? 'pointer' : 'not-allowed',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {guardando ? 'Guardando...' : 'Guardar Asiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  borderBottom: '1px solid #e5e7eb',
}

const tdStyle = {
  padding: '4px 6px',
  verticalAlign: 'middle',
}