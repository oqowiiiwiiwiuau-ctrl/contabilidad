// src/pages/LibroMayor.jsx
import { useState, useEffect } from 'react'
import { useEmpresa } from '../context/EmpresaContext'
import { getAsientosByEmpresa } from '../services/asientosService'

export default function LibroMayor() {
  const { empresaActiva } = useEmpresa()
  const [cuentasAgrupadas, setCuentasAgrupadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!empresaActiva) return
    setLoading(true)
    setError(null)

    async function cargar() {
      try {
        // 1. Traemos todos los asientos con sus partidas
        const asientos = await getAsientosByEmpresa(empresaActiva.id)
        
        // 2. Agrupamos las partidas por cuenta
        const mapaCuentas = {}

        asientos.forEach(asiento => {
          // Si el asiento está ANULADO, no lo contamos en el mayor
          if (asiento.estado === 'ANULADO') return

          asiento.partidas?.forEach(partida => {
            const cuenta = partida.cuentas
            if (!cuenta) return

            const cuentaId = cuenta.codigo // Usamos el código como clave única
            
            if (!mapaCuentas[cuentaId]) {
              mapaCuentas[cuentaId] = {
                codigo: cuenta.codigo,
                nombre: cuenta.nombre,
                movimientos: [],
                totalDebe: 0,
                totalHaber: 0,
                saldo: 0
              }
            }

            const debe = Number(partida.debe) || 0
            const haber = Number(partida.haber) || 0

            mapaCuentas[cuentaId].movimientos.push({
              fecha: asiento.fecha,
              numero: asiento.numero,
              concepto: asiento.concepto,
              descripcion: partida.descripcion,
              debe,
              haber
            })

            mapaCuentas[cuentaId].totalDebe += debe
            mapaCuentas[cuentaId].totalHaber += haber
          })
        })

        // 3. Calculamos el saldo y ordenamos
        const listaCuentas = Object.values(mapaCuentas).map(c => ({
          ...c,
          saldo: c.totalDebe - c.totalHaber
        })).sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }))

        setCuentasAgrupadas(listaCuentas)
      } catch (err) {
        console.error(err)
        setError('Error al cargar el Libro Mayor')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [empresaActiva])

  if (!empresaActiva) return <div style={{ padding: 20 }}>Selecciona una empresa.</div>
  if (loading) return <div style={{ padding: 20 }}>Cargando Libro Mayor...</div>
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 20 }}>
      {/* Cabecera */}
      <div className="empresa" style={{ marginBottom: 25 }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Libro Mayor</h2>
        <div className="datos-empresa">
          <span>{empresaActiva.nombre}</span>
          <span>NIT: {empresaActiva.nit || '—'}</span>
        </div>
      </div>

      {cuentasAgrupadas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b' }}>No hay movimientos registrados para esta empresa.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cuentasAgrupadas.map(cuenta => (
            <div key={cuenta.codigo} style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              
              {/* Cabecera de la Cuenta */}
              <div style={{ backgroundColor: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#1e3a5f', marginRight: 10, fontSize: '15px' }}>{cuenta.codigo}</span>
                  <span style={{ color: '#334155', fontWeight: '500' }}>{cuenta.nombre}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: cuenta.saldo >= 0 ? '#166534' : '#b91c1c' }}>
                  Saldo: {Math.abs(cuenta.saldo).toFixed(2)} {cuenta.saldo >= 0 ? '(Deudor)' : '(Acreedor)'}
                </div>
              </div>

              {/* Tabla de Movimientos */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '10px 20px', fontWeight: '600' }}>Fecha</th>
                    <th style={{ padding: '10px', fontWeight: '600' }}>Asiento</th>
                    <th style={{ padding: '10px', fontWeight: '600' }}>Concepto</th>
                    <th style={{ padding: '10px', fontWeight: '600' }}>Detalle</th>
                    <th style={{ padding: '10px', fontWeight: '600', textAlign: 'right' }}>Debe</th>
                    <th style={{ padding: '10px', fontWeight: '600', textAlign: 'right' }}>Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {cuenta.movimientos.map((mov, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 20px', color: '#475569' }}>{new Date(mov.fecha).toLocaleDateString('es-ES')}</td>
                      <td style={{ padding: '10px', color: '#2563eb', fontWeight: '500' }}>#{mov.numero}</td>
                      <td style={{ padding: '10px', color: '#334155' }}>{mov.concepto}</td>
                      <td style={{ padding: '10px', color: '#64748b', fontStyle: 'italic' }}>{mov.descripcion || '—'}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#334155' }}>{mov.debe > 0 ? mov.debe.toFixed(2) : '-'}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#334155' }}>{mov.haber > 0 ? mov.haber.toFixed(2) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                {/* Fila de Totales */}
                <tfoot>
                  <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0', fontWeight: 'bold' }}>
                    <td colSpan="4" style={{ padding: '10px 20px', textAlign: 'right', color: '#475569' }}>Totales:</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#1e3a5f' }}>{cuenta.totalDebe.toFixed(2)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#1e3a5f' }}>{cuenta.totalHaber.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}