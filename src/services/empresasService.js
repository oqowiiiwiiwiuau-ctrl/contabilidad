// src/services/empresasService.js
import { supabase } from './supabase'

/**
 * Trae todas las empresas. 
 * NOTA: Si más adelante agregas autenticación (login), aquí deberías 
 * filtrar por el ID del usuario dueño. Por ahora trae todas.
 */
export async function getEmpresas() {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Crea una nueva empresa. (Útil para un modal o formulario de "Nueva Empresa")
 */
export async function crearEmpresa(empresa) {
  const { data, error } = await supabase
    .from('empresas')
    .insert(empresa)
    .select()
    .single()

  if (error) throw error
  return data
}