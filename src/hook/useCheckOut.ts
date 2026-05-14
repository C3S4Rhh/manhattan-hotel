'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { habitacionesService } from '@/services/habitaciones'

export function useCheckOut(hab: any, onSuccess: () => void) {
  const [registro, setRegistro] = useState<any>(null)
  const [huespedesDetalle, setHuespedesDetalle] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [pagoFinal, setPagoFinal] = useState<number>(0)
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    const obtenerDatos = async () => {
      // 1. Consulta Relacional: Traemos el hospedaje y sus huéspedes activos en una sola petición
      const { data: hospedaje, error } = await supabase
        .from('hospedajes')
        .select(`
          *,
          detalle_hospedaje_huespedes (
            id, 
            estado, 
            clientes ( nombre, documento, profesion )
          )
        `)
        .eq('id_habitacion', hab.id)
        .eq('estado', 'activo')
        .maybeSingle(); // Usamos maybeSingle para evitar errores si no hay registro
      
      if (hospedaje) {
        setRegistro(hospedaje)
        
        // 2. Cálculo dinámico del saldo pendiente: (Precio Acordado - Lo que ya pagó)
        const pendiente = (hospedaje.precio_acordado || 0) - (hospedaje.a_cuenta || 0);
        setPagoFinal(pendiente > 0 ? pendiente : 0);

        // 3. Filtrar solo huéspedes que sigan "activos" en la habitación
        const activos = hospedaje.detalle_hospedaje_huespedes?.filter(
          (d: any) => d.estado === 'activo'
        ) || [];
        setHuespedesDetalle(activos);
      }
      
      setCargando(false)
    }

    if (hab?.id) obtenerDatos()
  }, [hab.id])

  // Lógica de validación: El saldo se considera liquidado si el pago es igual al pendiente
  const pendienteCalculado = (registro?.precio_acordado || 0) - (registro?.a_cuenta || 0);
  const saldoLiquidado = pagoFinal >= pendienteCalculado;

  const retirarHuesped = async (idDetalle: string) => {
    if(!confirm("¿Estás seguro de registrar la salida individual de este huésped?")) return;
    
    const ahora = new Date().toISOString();
    const { error } = await supabase
      .from('detalle_hospedaje_huespedes')
      .update({ 
        estado: 'retirado', 
        fecha_salida_individual: ahora 
      })
      .eq('id', idDetalle);

    if (!error) {
      setHuespedesDetalle(prev => prev.filter(h => h.id !== idDetalle));
    } else {
      alert("Error al retirar: " + error.message);
    }
  }

  const realizarSalidaTotal = async () => {
    if (!saldoLiquidado) {
      alert("Debe liquidar el saldo pendiente antes de finalizar.");
      return;
    }

    setProcesando(true)
    try {
      const ahora = new Date().toISOString();
      const horaActual = new Date().toLocaleTimeString('it-IT'); // Formato HH:mm:ss

      // 1. Actualizar el hospedaje a finalizado y registrar el pago total
      const { error: errorHospedaje } = await supabase
        .from('hospedajes')
        .update({ 
          a_cuenta: (registro.a_cuenta || 0) + pagoFinal, // Se suma el último pago
          saldo_total: 0,
          estado: 'finalizado',
          fecha_salida: ahora,
          hora_salida: horaActual
        })
        .eq('id', registro.id);

      if (errorHospedaje) throw errorHospedaje;

      // 2. Marcar a TODOS los huéspedes restantes como retirados
      await supabase
        .from('detalle_hospedaje_huespedes')
        .update({ estado: 'retirado', fecha_salida_individual: ahora })
        .eq('id_hospedaje', registro.id)
        .eq('estado', 'activo');

      // 3. Liberar la habitación (Cambia estado a 'L' y limpia id_hospedaje_actual)
      await habitacionesService.checkOut(hab.id);
      
      onSuccess();
    } catch (e: any) {
      console.error(e);
      alert("Error al procesar la salida: " + e.message);
    } finally {
      setProcesando(false)
    }
  }

  return {
    registro, 
    huespedesDetalle, 
    cargando, 
    pagoFinal, 
    procesando, 
    saldoLiquidado,
    setPagoFinal, 
    retirarHuesped, 
    realizarSalidaTotal
  }
}