// src/pages/Asientos.jsx
import { useState, useEffect } from 'react'
import { useEmpresa } from '../context/EmpresaContext'
import { getAsientosByEmpresa, crearAsiento, eliminarAsiento, anularAsiento } from '../services/asientosService'
import { getCuentasByEmpresa } from '../services/cuentasService'

export default function Asientos() {
  const { empresaActiva } = useEmpresa()
  const [asientos, setAsientos] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados para el formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cuentas, setCuentas] = useState([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [concepto, setConcepto] = useState('')
  const [partidas, setPartidas] = useState([
    { cuenta_id: '', descripcion: '', debe: '', haber: '' },
    { cuenta_id: '', descripcion: '', debe: '', haber: '' }
  ])
  const [guardando, setGuardando] = useState(false)

  // 1. Cargar asientos de la empresa
  const cargarAsientos = async () => {
    if (!empresaActiva) return
    setLoading(true)
    try {
      const data = await getAsientosByEmpresa(empresaActiva.id)
      setAsientos((data || []).filter(a => a.empresa_id === empresaActiva.id))
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  // 2. Cargar cuentas para el formulario
  const cargarCuentas = async () => {
    if (!empresaActiva) return
    try {
      const data = await getCuentasByEmpresa(empresaActiva.id)
      setCuentas(data.filter(c => c.permite_movimientos))
    } catch (err) {
      console.error("Error cuentas:", err)
    }
  }

  useEffect(() => {
    cargarAsientos()
    cargarCuentas()
  }, [empresaActiva])

  // Manejo del formulario
  const actualizarPartida = (index, campo, valor) => {
    const nuevas = [...partidas]
    nuevas[index][campo] = valor
    if (campo === 'debe' && valor !== '') nuevas[index].haber = ''
    if (campo === 'haber' && valor !== '') nuevas[index].debe = ''
    setPartidas(nuevas)
  }

  const agregarPartida = () => {
    setPartidas([...partidas, { cuenta_id: '', descripcion: '', debe: '', haber: '' }])
  }

  const eliminarPartida = (index) => {
    if (partidas.length <= 2) return alert('Mínimo 2 partidas')
    setPartidas(partidas.filter((_, i) => i !== index))
  }

  const totalDebe = partidas.reduce((sum, p) => sum + (Number(p.debe) || 0), 0)
  const totalHaber = partidas.reduce((sum, p) => sum + (Number(p.haber) || 0), 0)
  const cuadrado = totalDebe === totalHaber && totalDebe > 0

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!cuadrado) return alert('El Debe y el Haber deben ser iguales')
    
    setGuardando(true)
    try {
      const partidasValidas = partidas.filter(p => p.cuenta_id && (Number(p.debe) > 0 || Number(p.haber) > 0))
      
      await crearAsiento({
        empresaId: empresaActiva.id,
        fecha,
        concepto,
        partidas: partidasValidas.map(p => ({
          cuenta_id: p.cuenta_id,
          descripcion: p.descripcion,
          debe: Number(p.debe) || 0,
          haber: Number(p.haber) || 0
        }))
      })
      
      setMostrarFormulario(false)
      setConcepto('')
      setPartidas([
        { cuenta_id: '', descripcion: '', debe: '', haber: '' },
        { cuenta_id: '', descripcion: '', debe: '', haber: '' }
      ])
      cargarAsientos()
    } catch (err) {
      console.error(err)
      alert('Error al guardar el asiento')
    } finally {
      setGuardando(false)
    }
  }

  // Manejo de anular y eliminar
  const handleEliminar = async (id, numero) => {
    if (!confirm(`¿Estás seguro de eliminar el asiento #${numero}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarAsiento(id)
      cargarAsientos()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar el asiento')
    }
  }

  const handleAnular = async (id, numero) => {
    if (!confirm(`¿Anular el asiento #${numero}? El asiento quedará marcado como ANULADO.`)) return
    try {
      await anularAsiento(id)
      cargarAsientos()
    } catch (err) {
      console.error(err)
      alert('Error al anular el asiento')
    }
  }

  if (!empresaActiva) return <div>Selecciona una empresa.</div>
  if (loading) return <div>Cargando asientos...</div>

  return (
    <div>
      {/* Cabecera */}
      <div className="empresa" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Libro Diario</h2>
          <div className="datos-empresa">
            <span>{empresaActiva.nombre}</span>
            <span>NIT: {empresaActiva.nit || '—'}</span>
          </div>
        </div>
        
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{
            backgroundColor: '#1e3a5f', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: '6px', fontSize: '14px',
            fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo Asiento'}
        </button>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, color: '#1e3a5f' }}>Registrar Nuevo Asiento</h3>
          <form onSubmit={handleGuardar}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Fecha</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} required />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Concepto</label>
                <input type="text" value={concepto} onChange={e => setConcepto(e.target.value)} placeholder="Ej: Pago de servicios" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} required />
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px' }}>
              <thead style={{ backgroundColor: '#f1f5f9' }}>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Cuenta</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Descripción</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', width: '120px' }}>Debe</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', width: '120px' }}>Haber</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {partidas.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}>
                      <select value={p.cuenta_id} onChange={e => actualizarPartida(i, 'cuenta_id', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} required>
                        <option value="">Seleccionar...</option>
                        {cuentas.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input type="text" value={p.descripcion} onChange={e => actualizarPartida(i, 'descripcion', e.target.value)} placeholder="Opcional" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input type="number" step="0.01" value={p.debe} onChange={e => actualizarPartida(i, 'debe', e.target.value)} disabled={p.haber !== ''} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input type="number" step="0.01" value={p.haber} onChange={e => actualizarPartida(i, 'haber', e.target.value)} disabled={p.debe !== ''} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button type="button" onClick={() => eliminarPartida(i)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={agregarPartida} style={{ background: 'none', border: '1px dashed #3b82f6', color: '#3b82f6', padding: '8px', width: '100%', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>
              + Agregar otra partida
            </button>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
              <span>Total Debe: <span style={{ color: cuadrado ? '#166534' : '#b91c1c' }}>{totalDebe.toFixed(2)}</span></span>
              <span>Total Haber: <span style={{ color: cuadrado ? '#166534' : '#b91c1c' }}>{totalHaber.toFixed(2)}</span></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setMostrarFormulario(false)} style={{ padding: '10px 20px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button type="submit" disabled={!cuadrado || guardando} style={{ padding: '10px 20px', background: cuadrado ? '#1e3a5f' : '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: cuadrado ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                {guardando ? 'Guardando...' : 'Guardar Asiento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA DE ASIENTOS */}
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
                <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asientos.map(asiento => {
                const tDebe = asiento.partidas?.reduce((sum, p) => sum + Number(p.debe), 0) || 0
                const tHaber = asiento.partidas?.reduce((sum, p) => sum + Number(p.haber), 0) || 0
                return (
                  <FilaAsiento 
                    key={asiento.id} 
                    asiento={asiento} 
                    totalDebe={tDebe} 
                    totalHaber={tHaber} 
                    onEliminar={handleEliminar} 
                    onAnular={handleAnular}
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

// Componente para la fila expandible con acciones
function FilaAsiento({ asiento, totalDebe, totalHaber, onEliminar, onAnular }) {
  const [expandido, setExpandido] = useState(false)
  return (
    <>
      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: expandido ? '#f8fafc' : 'white' }}>
        <td style={{ padding: '15px', textAlign: 'center' }}>
          <button onClick={() => setExpandido(!expandido)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6' }}>
            {expandido ? '▼' : '▶'}
          </button>
        </td>
        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{asiento.numero}</td>
        <td style={{ padding: '15px', color: '#64748b' }}>{new Date(asiento.fecha).toLocaleDateString('es-ES')}</td>
        <td style={{ padding: '15px', fontWeight: '500' }}>{asiento.concepto}</td>
        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a5f' }}>{totalDebe.toFixed(2)}</td>
        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a5f' }}>{totalHaber.toFixed(2)}</td>
        <td style={{ padding: '15px' }}>
          <span style={{ backgroundColor: asiento.estado === 'ANULADO' ? '#fee2e2' : '#dcfce7', color: asiento.estado === 'ANULADO' ? '#b91c1c' : '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {asiento.estado}
          </span>
        </td>
        
        {/* COLUMNA DE ACCIONES */}
        <td style={{ padding: '15px', textAlign: 'center' }}>
          {asiento.estado !== 'ANULADO' && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button 
                onClick={() => onAnular(asiento.id, asiento.numero)}
                title="Anular asiento"
                style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Anular
              </button>
              <button 
                onClick={() => onEliminar(asiento.id, asiento.numero)}
                title="Eliminar asiento"
                style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Eliminar
              </button>
            </div>
          )}
        </td>
      </tr>
      
      {expandido && asiento.partidas?.map(partida => (
        <tr key={partida.id} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <td></td>
          <td colSpan="2" style={{ padding: '10px 15px', textAlign: 'right', color: '#64748b', fontSize: '12px' }}>
            {partida.cuentas?.codigo} - {partida.cuentas?.nombre}
          </td>
          <td style={{ padding: '10px 15px', color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>{partida.descripcion || '—'}</td>
          <td style={{ padding: '10px 15px', textAlign: 'right', color: '#475569' }}>{Number(partida.debe) > 0 ? Number(partida.debe).toFixed(2) : '-'}</td>
          <td style={{ padding: '10px 15px', textAlign: 'right', color: '#475569' }}>{Number(partida.haber) > 0 ? Number(partida.haber).toFixed(2) : '-'}</td>
          <td colSpan="2"></td>
        </tr>
      ))}
    </>
  )
}