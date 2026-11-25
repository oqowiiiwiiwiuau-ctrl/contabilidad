// src/pages/PlanCuentas.jsx
import { useEffect, useState } from 'react'
import { useEmpresa } from '../context/EmpresaContext'
import { getCuentasByEmpresa, cargarPlanCompleto } from '../services/cuentasService'
import CuentaTree from '../components/contabilidad/CuentaTree'

export default function PlanCuentas() {
  const { empresaActiva } = useEmpresa()
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [cargandoPlan, setCargandoPlan] = useState(false)

  useEffect(() => {
    if (!empresaActiva) return

    // EL TRUCO ESTÁ AQUÍ: Limpiamos las cuentas antes de buscar las nuevas
    setCuentas([]) 
    setLoading(true)

    async function cargar() {
      try {
        console.log("Buscando cuentas para la empresa ID:", empresaActiva.id)
        
        // Llamamos al servicio (que debe tener el .eq('empresa_id', id))
        const data = await getCuentasByEmpresa(empresaActiva.id)
        
        console.log("Cuentas encontradas:", data)
        
        // FILTRO DE SEGURIDAD EN REACT (Por si Supabase devuelve todo por error)
        // Nos aseguramos de que SOLO se guarden las cuentas que pertenecen a esta empresa
        const cuentasFiltradas = (data || []).filter(c => c.empresa_id === empresaActiva.id)
        
        setCuentas(cuentasFiltradas)
      } catch (err) {
        console.error("Error cargando cuentas:", err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [empresaActiva])

  const handleCargarPlan = async () => {
    if (!confirm('¿Cargar el plan completo de 538 cuentas para esta empresa?')) return
    setCargandoPlan(true)
    try {
      await cargarPlanCompleto(empresaActiva.id)
      const data = await getCuentasByEmpresa(empresaActiva.id)
      const cuentasFiltradas = (data || []).filter(c => c.empresa_id === empresaActiva.id)
      setCuentas(cuentasFiltradas)
    } catch (err) {
      console.error(err)
      alert('Error al cargar el plan')
    } finally {
      setCargandoPlan(false)
    }
  }

  if (!empresaActiva) return <div style={{ padding: 20 }}>Selecciona una empresa.</div>
  if (loading) return <div style={{ padding: 20 }}>Cargando cuentas...</div>

  return (
    <div style={{ padding: 20 }}>
      {/* CABECERA CON EL NOMBRE DE LA EMPRESA */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Plan de Cuentas</h1>
        <p style={{ color: 'blue', fontWeight: 'bold' }}>EMPRESA ACTUAL: {empresaActiva.nombre}</p>
        <p style={{ color: 'gray', fontSize: 12 }}>ID de empresa: {empresaActiva.id}</p>
        <p style={{ color: 'gray', fontSize: 12 }}>Cuentas encontradas: {cuentas.length}</p>
      </div>

      {/* BOTÓN PARA CARGAR PLAN (Solo si no hay cuentas) */}
      {cuentas.length === 0 && (
        <button
          onClick={handleCargarPlan}
          disabled={cargandoPlan}
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 5, marginBottom: 20, cursor: 'pointer' }}
        >
          {cargandoPlan ? 'Cargando...' : 'Cargar Plan Completo (PUC)'}
        </button>
      )}

      {/* SI NO HAY CUENTAS, MENSAJE CLARO */}
      {cuentas.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#f3f4f6', borderRadius: 8 }}>
          <p>Esta empresa no tiene cuentas activadas.</p>
        </div>
      ) : (
        /* SI HAY CUENTAS, MOSTRAMOS EL ÁRBOL */
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
          <CuentaTree 
            cuentas={cuentas} 
            onSelect={(cuenta) => console.log('Seleccionaste:', cuenta)} 
            showBadge={true} 
          />
        </div>
      )}
    </div>
  )
}