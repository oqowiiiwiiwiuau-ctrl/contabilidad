// src/services/cuentasService.js
import { supabase } from './supabase'

// ============================================================
// EMPRESAS
// ============================================================

/**
 * Trae los datos de una empresa por su ID.
 */
export async function getEmpresaById(empresaId) {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', empresaId)
    .single()

  if (error) throw error
  return data
}

// ============================================================
// CUENTAS DE LA EMPRESA
// ============================================================

/**
 * Trae todas las cuentas de una empresa, ordenadas por código.
 */
export async function getCuentasByEmpresa(empresaId) {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('codigo', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Crea una cuenta nueva (personalizada por la empresa).
 */
export async function crearCuenta(cuenta) {
  const { data, error } = await supabase
    .from('cuentas')
    .insert(cuenta)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Actualiza una cuenta existente.
 */
export async function actualizarCuenta(id, cambios) {
  const { data, error } = await supabase
    .from('cuentas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Desactiva una cuenta (soft delete).
 */
export async function desactivarCuenta(id) {
  const { data, error } = await supabase
    .from('cuentas')
    .update({ activa: false })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// CATÁLOGO MAESTRO
// ============================================================

/**
 * Trae TODO el catálogo maestro (PUC Bolivia).
 */
export async function getCatalogoCompleto() {
  const { data, error } = await supabase
    .from('catalogo_cuentas')
    .select('*')
    .order('codigo', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Trae el catálogo con una columna `ya_activada` para saber qué cuentas
 * ya tiene la empresa.
 */
export async function getCatalogoConEstado(empresaId) {
  // Primero obtenemos el catalogo_id de la empresa
  const { data: empresa, error: errEmp } = await supabase
    .from('empresas')
    .select('catalogo_id')
    .eq('id', empresaId)
    .single()

  if (errEmp) throw errEmp
  if (!empresa?.catalogo_id) return []

  // Traemos el catálogo
  const { data: catalogo, error: errCat } = await supabase
    .from('catalogo_cuentas')
    .select('*')
    .eq('catalogo_id', empresa.catalogo_id)
    .eq('activo', true)
    .order('codigo', { ascending: true })

  if (errCat) throw errCat

  // Traemos las cuentas activadas por la empresa
  const { data: activadas, error: errAct } = await supabase
    .from('cuentas')
    .select('catalogo_cuenta_id')
    .eq('empresa_id', empresaId)

  if (errAct) throw errAct

  const activadasSet = new Set(activadas.map(a => a.catalogo_cuenta_id))

  return catalogo.map(c => ({
    ...c,
    ya_activada: activadasSet.has(c.id),
  }))
}

// ============================================================
// FUNCIONES RPC (llaman a funciones SQL en Supabase)
// ============================================================

/**
 * Carga el plan completo del catálogo para la empresa (538 cuentas).
 */
export async function cargarPlanCompleto(empresaId) {
  const { data, error } = await supabase.rpc('cargar_plan_completo', {
    p_empresa_id: empresaId,
  })
  if (error) throw error
  return data
}

/**
 * Activa un conjunto de cuentas seleccionadas del catálogo.
 */
export async function activarCuentas(empresaId, catalogoCuentaIds) {
  const { data, error } = await supabase.rpc('activar_cuentas_empresa', {
    p_empresa_id: empresaId,
    p_catalogo_cuenta_ids: catalogoCuentaIds,
  })
  if (error) throw error
  return data
}