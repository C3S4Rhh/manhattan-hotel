'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useCaja(usuarioActivo: any) {
  const [sesionActiva, setSesionActiva] = useState<any>(null)
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cargandoAccion, setCargandoAccion] = useState(false)

  // 1. Verificar si hay una caja abierta para el día de hoy o turno actual
  const verificarEstadoCaja = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('caja_sesiones')
        .select('*')
        .eq('estado', 'abierta')
        .maybeSingle()

      if (error) throw error
      setSesionActiva(data)

      if (data) {
        await cargarMovimientos(data.id)
      }
    } catch (error) {
      console.error('Error al verificar el estado de la caja:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 2. Cargar los movimientos de la sesión de caja actual (Soluciona el error de columna inexistente)
  const cargarMovimientos = async (sesionId: string) => {
    try {
      // Traemos todos los campos planos (incluyendo nro_habitacion directo de caja_movimientos)
      // y hacemos el join seguro usando la llave foránea id_habitacion
      const { data, error } = await supabase
        .from('caja_movimientos')
        .select(`
          id,
          id_sesion,
          id_usuario,
          id_habitacion,
          nro_habitacion,
          id_check_in,
          fecha,
          tipo_movimiento,
          categoria,
          monto_total,
          monto_a_cuenta,
          monto_saldo,
          factura_numero,
          huesped_referencia,
          observaciones,
          habitaciones:id_habitacion (
            id,
            estado_actual
          ),usuarios:id_usuario(nombre)
        `)
        .eq('id_sesion', sesionId)
        .order('fecha', { ascending: false })

      if (error) throw error
      setMovimientos(data || [])
    } catch (error) {
      console.error('Error al cargar movimientos de caja:', error)
    }
  };

  // 3. Función para APERTURA de Caja / Turno
  const abrirCaja = async (montoInicial: number) => {
    if (!usuarioActivo?.id) return { success: false, error: 'No hay usuario activo' }
    
    try {
      setCargandoAccion(true)
      const { data, error } = await supabase
        .from('caja_sesiones')
        .insert([
          {
            id_usuario_apertura: usuarioActivo.id,
            monto_inicial: montoInicial,
            estado: 'abierta'
          }
        ])
        .select()
        .single()

      if (error) throw error
      
      setSesionActiva(data)
      setMovimientos([])
      return { success: true }
    } catch (error: any) {
      console.error('Error al abrir la caja:', error)
      return { success: false, error: error.message }
    } finally {
      setCargandoAccion(false)
    }
  };

  // 4. Función para registrar un MOVIMIENTO MANUAL (Cumple con Check Constraints de Supabase)
  const registrarMovimientoManual = async (valores: {
    tipo_movimiento: 'Ingreso' | 'Egreso' | 'ingreso' | 'egreso' // Soporta formatos mixtos de entrada
    monto_total: number
    monto_a_cuenta: number
    monto_saldo: number
    factura_numero?: string
    huesped_referencia?: string
    id_habitacion?: string   
    nro_habitacion?: string  
    fecha?: string           
    id_check_in?: string
    observaciones?: string
    categoria?: string       // Permite asignar categorías específicas personalizadas
  }) => {
    if (!sesionActiva) return { success: false, error: 'La caja está cerrada' }

    try {
      setCargandoAccion(true)
      
      // Normalizamos a Mayúscula Inicial para evitar violaciones de Check Constraint (PostgreSQL)
      const tipoNormalizado = valores.tipo_movimiento.toLowerCase() === 'egreso' ? 'Egreso' : 'Ingreso';

      // Categorías válidas capitalizadas para evitar el error 23514
      const categoriaPorDefecto = valores.categoria || (tipoNormalizado === 'Ingreso' 
        ? 'Hospedaje' 
        : 'Gasto');

      const { error } = await supabase
        .from('caja_movimientos')
        .insert([
          {
            id_sesion: sesionActiva.id,
            id_usuario: usuarioActivo?.id || '59150928-f321-4229-8c06-1abd92c5dad0',
            id_habitacion: valores.id_habitacion || null,
            nro_habitacion: valores.nro_habitacion ? String(valores.nro_habitacion) : null, 
            id_check_in: valores.id_check_in || null,
            tipo_movimiento: tipoNormalizado,
            categoria: categoriaPorDefecto,
            monto_total: valores.monto_total,
            monto_a_cuenta: valores.monto_a_cuenta,
            monto_saldo: valores.monto_saldo,
            factura_numero: valores.factura_numero || null,
            huesped_referencia: valores.huesped_referencia || null,
            observaciones: valores.observaciones || null,
            fecha: valores.fecha || new Date().toISOString() 
          }
        ])

      if (error) throw error

      await cargarMovimientos(sesionActiva.id)
      return { success: true }
    } catch (error: any) {
      console.error('Error al registrar movimiento manual:', error)
      return { success: false, error: error.message }
    } finally {
      setCargandoAccion(false)
    }
  };

  // 5. Función para CIERRE de Caja / Turno
  const cerrarCaja = async (montoEfectivoReal: number, observaciones?: string) => {
    if (!sesionActiva) return { success: false, error: 'No hay ninguna sesión activa para cerrar' }

    try {
      setCargandoAccion(true)
      
      const { error } = await supabase
        .from('caja_sesiones')
        .update({
          id_usuario_cierre: usuarioActivo.id,
          fecha_cierre: new Date().toISOString(),
          monto_final_efectivo: montoEfectivoReal,
          estado: 'cerrada',
          observaciones_cierre: observaciones || null
        })
        .eq('id', sesionActiva.id)

      if (error) throw error

      setSesionActiva(null)
      setMovimientos([])
      return { success: true }
    } catch (error: any) {
      console.error('Error al cerrar la caja:', error)
      return { success: false, error: error.message }
    } finally {
      setCargandoAccion(false)
    }
  };

  useEffect(() => {
    if (usuarioActivo) {
      verificarEstadoCaja()
    }
  }, [usuarioActivo, verificarEstadoCaja])

  return {
    sesionActiva,
    movimientos,
    loading,
    cargandoAccion,
    verificarEstadoCaja,
    openingBox: abrirCaja, // Mantener alias si es requerido por componentes antiguos
    abrirCaja,
    registrarMovimientoManual,
    cerrarCaja
  }
}