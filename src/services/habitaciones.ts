import { supabase } from '@/lib/supabase'

/**
 * Servicio para gestionar la lógica de habitaciones y hospedajes
 * Sincronizado con la estructura de la base de datos de Hotel Manhattan
 */
export const habitacionesService = {
  
  /**
   * Obtiene la lista completa de habitaciones
   */
  async getAll() {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .order('numero', { ascending: true })
    
    if (error) {
      console.error("Error en getAll:", error.message)
      throw error
    }
    return data
  },

  /**
   * Registra un nuevo hospedaje y marca la habitación como ocupada
   * @param datos Objeto con la información del check-in
   */
  async checkIn(datos: {
    id_habitacion: string,
    id_usuario: string,
    huesped: string,
    pax: number,
    precio: number,
    adelanto: number,
    fecha_ingreso?: string // Opcional, si lo envías desde el modal
  }) {
    // 1. Insertar en la tabla 'hospedajes'
    // IMPORTANTE: Se usan los nombres reales 'a_cuenta' y 'saldo_total'
    const { error: errorIns } = await supabase
      .from('hospedajes')
      .insert([{
        id_habitacion: datos.id_habitacion,
        id_usuario: datos.id_usuario,
        nombre_huesped: datos.huesped,
        nro_pax: Number(datos.pax),
        precio_acordado: Number(datos.precio),
        a_cuenta: Number(datos.adelanto),
        saldo_total: Number(datos.precio) - Number(datos.adelanto),
        estado: 'activo',
        fecha_ingreso: datos.fecha_ingreso || new Date().toISOString()
      }])
    
    if (errorIns) {
      console.error("Error al insertar hospedaje:", errorIns.message)
      throw errorIns
    }

    // 2. Cambiar el estado de la habitación a Ocupada ('O')
    const { error: errorUpd } = await supabase
      .from('habitaciones')
      .update({ estado_actual: 'O' })
      .eq('id', datos.id_habitacion)
      
    if (errorUpd) {
      console.error("Error al actualizar estado de habitación:", errorUpd.message)
      throw errorUpd
    }
  },

  /**
   * Finaliza el hospedaje activo y libera la habitación
   * @param id_habitacion UUID de la habitación a liberar
   */
  async checkOut(id_habitacion: string) {
    // 1. Marcar el hospedaje activo como finalizado
    const { error: errorReg } = await supabase
      .from('hospedajes')
      .update({ estado: 'finalizado' })
      .eq('id_habitacion', id_habitacion)
      .eq('estado', 'activo')
    
    if (errorReg) {
      console.error("Error al finalizar hospedaje:", errorReg.message)
      throw errorReg
    }

    // 2. Cambiar el estado de la habitación a Libre ('L')
    const { error: errorHab } = await supabase
      .from('habitaciones')
      .update({ estado_actual: 'L' })
      .eq('id', id_habitacion)
    
    if (errorHab) {
      console.error("Error al liberar habitación:", errorHab.message)
      throw errorHab
    }
  }
}