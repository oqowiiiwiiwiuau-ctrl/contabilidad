// src/pages/SeleccionEmpresa.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmpresas } from '../services/empresasService'
import { useEmpresa } from '../context/EmpresaContext'

export default function SeleccionEmpresa() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { setEmpresaActiva } = useEmpresa()

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getEmpresas()
        setEmpresas(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando empresas...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
      <h1 style={{ fontSize: '28px', color: '#1e3a5f', marginBottom: '10px', textAlign: 'center' }}>Mis Empresas</h1>
      <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '40px' }}>Selecciona una empresa para gestionar su contabilidad</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {empresas.map(emp => (
          <div
            key={emp.id}
            onClick={() => {
              setEmpresaActiva(emp)
              navigate('/dashboard')
            }}
            style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', color: '#1e3a5f', fontSize: '18px' }}>{emp.nombre}</h3>
            <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span><strong>NIT:</strong> {emp.nit || 'N/A'}</span>
              <span><strong>Moneda:</strong> {emp.moneda}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}