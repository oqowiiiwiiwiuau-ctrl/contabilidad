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

  // 👇 Agregamos íconos a cada opción
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/cuentas', label: 'Plan de Cuentas', icon: '📒' },
    { to: '/asientos', label: 'Libro Diario', icon: '📝' },
    { to: '/libros', label: 'Libro Mayor', icon: '📖' }, // 👈 Ahora apunta correctamente al Mayor
    { to: '/reportes', label: 'Reportes', icon: '📈' },
  ]

  return (
    <aside className="sidebar">
      {/* Información de la empresa activa */}
      <div style={{ padding: '0 12px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <p style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', margin: '0 0 5px 0', fontWeight: 'bold' }}>
          Empresa Activa
        </p>
        <p style={{ color: '#0f172a', fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={empresaActiva.nombre}>
          {empresaActiva.nombre}
        </p>
        <button 
          onClick={handleVolver}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 'bold' }}
        >
          ← Cambiar de empresa
        </button>
      </div>

      {/* Menú de navegación */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map(link => {
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px', // 👈 Espacio entre ícono y texto
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                color: isActive ? '#2563eb' : '#475569',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#f1f5f9'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {/* 👇 Aquí mostramos el ícono */}
              <span style={{ fontSize: '18px', opacity: isActive ? 1 : 0.7 }}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}