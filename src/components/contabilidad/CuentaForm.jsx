// src/components/contabilidad/CuentaForm.jsx
import { useState, useEffect } from 'react'

const TIPOS = ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO']
const NATURALEZAS = ['DEUDORA', 'ACREEDORA']

export default function CuentaForm({ cuenta, cuentas, onGuardar, onCerrar, onDesactivar }) {
  const esEdicion = Boolean(cuenta)
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    tipo: 'ACTIVO',
    naturaleza: 'DEUDORA',
    cuenta_padre_id: '',
    permite_movimientos: true,
  })

  useEffect(() => {
    if (cuenta) {
      setForm({
        codigo: cuenta.codigo || '',
        nombre: cuenta.nombre || '',
        tipo: cuenta.tipo || 'ACTIVO',
        naturaleza: cuenta.naturaleza || 'DEUDORA',
        cuenta_padre_id: cuenta.cuenta_padre_id || '',
        permite_movimientos: cuenta.permite_movimientos ?? true,
      })
    }
  }, [cuenta])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onGuardar({
      ...form,
      cuenta_padre_id: form.cuenta_padre_id || null,
    })
  }

  const handleDesactivar = async () => {
    if (!confirm('¿Desactivar esta cuenta?')) return
    await onDesactivar(cuenta.id)
    onCerrar()
  }

  const posiblesPadres = cuentas.filter(c => c.id !== cuenta?.id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">
          {esEdicion ? 'Editar cuenta' : 'Nueva cuenta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Código</label>
            <input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Naturaleza</label>
              <select name="naturaleza" value={form.naturaleza} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                {NATURALEZAS.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Cuenta padre (opcional)</label>
            <select
              name="cuenta_padre_id"
              value={form.cuenta_padre_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">— Sin padre —</option>
              {posiblesPadres.filter(c => !c.permite_movimientos).map(c => (
                <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="permite_movimientos"
              checked={form.permite_movimientos}
              onChange={handleChange}
            />
            <span className="text-sm">Permite movimientos</span>
          </label>

          <div className="flex justify-between pt-4 border-t">
            <div>
              {esEdicion && (
                <button type="button" onClick={handleDesactivar} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded">
                  Desactivar
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onCerrar} className="px-4 py-2 border rounded">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                {esEdicion ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}