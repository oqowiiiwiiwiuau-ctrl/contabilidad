// src/services/asientosService.js
import { supabase } from './supabase'

export async function getAsientosByEmpresa(empresaId) {
  const { data, error } = await supabase
    .from('asientos')
    .select(`
      *,
      partidas (
        id, cuenta_id, descripcion, debe, haber,
        cuentas:cuenta_id ( codigo, nombre )
      )
    `)
    .eq('empresa_id', empresaId) // 👈 FILTRO VITAL
    .order('fecha', { ascending: false })
    .order('numero', { ascending: false })

  if (error) throw error
  return data
}

export async function getAsientoById(asientoId) {
  const { data, error } = await supabase
    .from('asientos')
    .select(`
      *,
      partidas (
        id, cuenta_id, descripcion, debe, haber,
        cuentas:cuenta_id ( codigo, nombre )
      )
    `)
    .eq('id', asientoId)
    .single()
  if (error) throw error
  return data
}

export async function crearAsiento({ empresaId, fecha, concepto, partidas }) {
  const { data, error } = await supabase.rpc('crear_asiento_completo', {
    p_empresa_id: empresaId,
    p_fecha: fecha,
    p_concepto: concepto,
    p_partidas: partidas,
  })
  if (error) throw error
  return data
}

export async function anularAsiento(asientoId) {
  const { data, error } = await supabase
    .from('asientos')
    .update({ estado: 'ANULADO' })
    .eq('id', asientoId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarAsiento(asientoId) {
  const { error } = await supabase.from('asientos').delete().eq('id', asientoId)
  if (error) throw error
}