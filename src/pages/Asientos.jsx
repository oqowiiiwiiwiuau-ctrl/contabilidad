// src/pages/Asientos.jsx
import { useState, useEffect } from 'react'
import { useEmpresa } from '../context/EmpresaContext'
import { getAsientosByEmpresa } from '../services/asientosService'

export default function Asientos() {
  const { empresaActiva } = useEmpresa()
  const [asientos, setAsientos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!empresaActiva) return
    setAsientos([])
    setLoading(true)
    
    async function cargar() {
      try {
        const data = await getAsientosByEmpresa(empresaActiva.id)
        // Filtro de seguridad
        setAsientos((data || []).filter(a => a.empresa_id === empresaActiva.id))
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [empresaActiva])

  if (!empresaActiva) return <div>Selecciona una empresa.</div>
  if (loading) return <div>Cargando asientos...</div>

  return (
    <div>
      <div className="empresa">
        <h2>Libro Diario</h2>
        <div className="datos-empresa">
          <span>{empresaActiva.nombre}</span>
          <span>NIT: {empresaActiva.nit || '—'}</span>
        </div>
      </div>

      {asientos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', margin: 0 }}>No hay asientos registrados para esta empresa.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#1e3a5f' }}>
              <tr>
                <th style={{ padding: '15px', width: '50px' }}></th>
                <th style={{ padding: '15px' }}>Número</th>
                <th style={{ padding: '15px' }}>Fecha</th>
                <th style={{ padding: '15px' }}>Concepto</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Debe</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Haber</th>
                <th style={{ padding: '15px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {asientos.map(asiento => {
                const totalDebe = asiento.partidas?.reduce((sum, p) => sum + Number(p.debe), 0) || 0
                const totalHaber = asiento.partidas?.reduce((sum, p) => sum + Number(p.haber), 0) || 0
                return (
                  <FilaAsiento 
                    key={asiento.id} 
                    asiento={asiento} 
                    totalDebe={totalDebe} 
                    totalHaber={totalHaber} 
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FilaAsiento({ asiento, totalDebe, totalHaber }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <>
      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: expandido ? '#f8fafc' : 'white' }}>
        <td style={{ padding: '15px', textAlign: 'center' }}>
          <button 
            onClick={() => setExpandido(!expandido)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6' }}
          >
            {expandido ? '▼' : '▶'}
          </button>
        </td>
        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{asiento.numero}</td>
        <td style={{ padding: '15px', color: '#64748b' }}>
          {new Date(asiento.fecha).toLocaleDateString('es-ES')}
        </td>
        <td style={{ padding: '15px', fontWeight: '500' }}>{asiento.concepto}</td>
        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a5f' }}>
          {totalDebe.toFixed(2)}
        </td>
        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a5f' }}>
          {totalHaber.toFixed(2)}
        </td>
        <td style={{ padding: '15px' }}>
          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {asiento.estado}
          </span>
        </td>
      </tr>

      {expandido && asiento.partidas?.map(partida => (
        <tr key={partida.id} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <td></td>
          <td colSpan="2" style={{ padding: '10px 15px', textAlign: 'right', color: '#64748b', fontSize: '12px' }}>
            {partida.cuentas?.codigo} - {partida.cuentas?.nombre}
          </td>
          <td style={{ padding: '10px 15px', color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
            {partida.descripcion || '—'}
          </td>
          <td style={{ padding: '10px 15px', textAlign: 'right', color: '#475569' }}>
            {Number(partida.debe) > 0 ? Number(partida.debe).toFixed(2) : '-'}
          </td>
          <td style={{ padding: '10px 15px', textAlign: 'right', color: '#475569' }}>
            {Number(partida.haber) > 0 ? Number(partida.haber).toFixed(2) : '-'}
          </td>
          <td></td>
        </tr>
      ))}
    </>
  )
}