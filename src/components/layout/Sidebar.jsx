// src/components/layout/Sidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEmpresa } from '../../context/EmpresaContext'

export default function Sidebar() {
  const { empresaActiva, setEmpresaActiva } = useEmpresa()
  const navigate = useNavigate()
  const location = useLocation()

  const handleVolver = () => {
    setEmpresaActiva(null)
    navigate('/')
  }

  if (!empresaActiva) return null

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/cuentas', label: 'Plan de Cuentas' },
    { to: '/asientos', label: 'Libro Diario' },
    { to: '/libros', label: 'Libro Mayor' },
    { to: '/reportes', label: 'Reportes' },
  ]

  return (
    <aside className="sidebar">
      {/* Información de la empresa activa */}
      <div style={{ padding: '0 12px', marginBottom: '20px', borderBottom: '1px solid #294d78', paddingBottom: '15px' }}>
        <p style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', margin: '0 0 5px 0', fontWeight: 'bold' }}>
          Empresa Activa
        </p>
        <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={empresaActiva.nombre}>
          {empresaActiva.nombre}
        </p>
        <button 
          onClick={handleVolver}
          style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 'bold' }}
        >
          ← Cambiar de empresa
        </button>
      </div>

      <nav>
        {links.map(link => {
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                backgroundColor: isActive ? '#294d78' : 'transparent',
                color: isActive ? 'white' : '#e2e8f0'
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}