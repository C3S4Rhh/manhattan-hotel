import { supabase } from '@/lib/supabase'

export const habitacionesService = {
  // Obtener todas las habitaciones
  async getAll() {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .order('numero', { ascending: true })
    if (error) throw error
    return data
  },

  // Registrar un Check-In
  async checkIn(datos: {
    id_habitacion: string,
    id_usuario: string,
    huesped: string,
    pax: number,
    precio: number,
    adelanto: number
  }) {
    // 1. Insertar registro
    const { error: errorIns } = await supabase
      .from('check_ins')
      .insert([{
        id_habitacion: datos.id_habitacion,
        id_usuario: datos.id_usuario,
        nombre_huesped: datos.huesped,
        pax: datos.pax,
        precio_acordado: datos.precio,
        adelanto: datos.adelanto,
        saldo_pendiente: datos.precio - datos.adelanto,
        estado: 'activo'
      }])
    
    if (errorIns) throw errorIns

    // 2. Cambiar estado de habitación a 'LO' (Ocupada)
    const { error: errorUpd } = await supabase
      .from('habitaciones')
      .update({ estado_actual: 'LO' })
      .eq('id', datos.id_habitacion)
      
    if (errorUpd) throw errorUpd
  }
}