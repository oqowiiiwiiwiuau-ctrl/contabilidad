// src/services/asientosService.js
import { supabase } from './supabase'

/**
 * Trae todos los asientos de una empresa, ordenados por fecha desc.
 */
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
    .eq('empresa_id', empresaId)
    .order('fecha', { ascending: false })
    .order('numero', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Trae un asiento específico con sus partidas.
 */
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

/**
 * Crea un asiento completo con sus partidas.
 * Llama a la función RPC que valida debe = haber.
 */
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

/**
 * Anula un asiento (cambia estado a ANULADO).
 */
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

/**
 * Elimina un asiento (borra partidas también por CASCADE).
 */
export async function eliminarAsiento(asientoId) {
  const { error } = await supabase
    .from('asientos')
    .delete()
    .eq('id', asientoId)

  if (error) throw error
}