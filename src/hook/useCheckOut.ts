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

  // NUEVOS ESTADOS PARA DÍAS EXTRA Y DESCUENTOS
  const [diasExtra, setDiasExtra] = useState(0)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0)

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: hospedaje } = await supabase
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
        .maybeSingle();

      if (hospedaje) {
        setRegistro(hospedaje)
        const pendiente = (hospedaje.precio_acordado || 0) - (hospedaje.a_cuenta || 0);
        setPagoFinal(pendiente > 0 ? pendiente : 0);
        const activos = hospedaje.detalle_hospedaje_huespedes?.filter(
          (d: any) => d.estado === 'activo'
        ) || [];
        setHuespedesDetalle(activos);
      }
      setCargando(false)
    }
    if (hab?.id) obtenerDatos()
  }, [hab.id])

  // LÓGICA DE CÁLCULO DINÁMICO
  const calcularSaldoFinal = () => {
    const precioBase = registro?.precio_acordado || 0;
    const aCuenta = registro?.a_cuenta || 0;
    // Aumento: cada medio día extra es la mitad del precio base
    const aumento = diasExtra * (precioBase / 2);
    const subtotal = precioBase + aumento;
    // Aplicar descuento
    const descuento = subtotal * (descuentoPorcentaje / 100);
    return (subtotal - descuento) - aCuenta;
  };

  const saldoFinal = calcularSaldoFinal();
  const saldoLiquidado = pagoFinal >= saldoFinal;

  const retirarHuesped = async (idDetalle: string) => {
    if(!confirm("¿Estás seguro de registrar la salida individual de este huésped?")) return;
    const ahora = new Date().toISOString();
    const { error } = await supabase
      .from('detalle_hospedaje_huespedes')
      .update({ estado: 'retirado', fecha_salida_individual: ahora })
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
    setProcesando(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Debes iniciar sesión.");
      
      const ahora = new Date().toISOString();

      if (pagoFinal > 0) {
        const { data: sesion } = await supabase.from('caja_sesiones').select('id').eq('estado', 'abierta').single();
        if (!sesion) throw new Error("No hay una caja abierta.");
        
        await supabase.from('caja_movimientos').insert([{
          id_sesion: sesion.id,
          id_usuario: user.id,
          id_habitacion: hab.id,
          nro_habitacion: hab.numero,
          tipo_movimiento: 'ingreso',
          categoria: 'Hospedaje',
          monto_total: pagoFinal,
          monto_a_cuenta: pagoFinal,
          huesped_referencia: registro.detalle_hospedaje_huespedes?.[0]?.clientes?.nombre || 'Checkout Hab. ' + hab.numero,
          observaciones: `Checkout. Extra: ${diasExtra} medios días. Desc: ${descuentoPorcentaje}%`
        }]);
      }

      await supabase.from('hospedajes').update({
        a_cuenta: (registro.a_cuenta || 0) + pagoFinal,
        saldo_total: 0,
        estado: 'finalizado',
        fecha_salida: ahora
      }).eq('id', registro.id);

      await supabase.from('detalle_hospedaje_huespedes').update({ estado: 'retirado', fecha_salida_individual: ahora }).eq('id_hospedaje', registro.id).eq('estado', 'activo');
      await habitacionesService.checkOut(hab.id);
      
      onSuccess();
      // ... dentro de realizarSalidaTotal ...

// 4. LIBERAR HABITACIÓN Y PONER EN ESTADO SUCIO
// Modificamos la llamada para actualizar el estado_limpieza a 'sucio'
await supabase
  .from('habitaciones')
  .update({ 
    estado_actual: 'sucio',        // Cambia a Libre
    estado_limpieza: 'sucio'   // Automáticamente se pone en Sucio
  })
  .eq('id', hab.id);

onSuccess(); 
// ...
    } catch (e: any) {
      console.error(e);
      alert("Error al procesar la salida: " + e.message);
    } finally {
      setProcesando(false);
    }
  }

  return {
    registro,
    huespedesDetalle,
    cargando,
    pagoFinal,
    procesando,
    saldoLiquidado,
    saldoFinal, // Nuevo valor calculado
    setPagoFinal,
    retirarHuesped,
    realizarSalidaTotal,
    // Nuevos estados para el modal
    diasExtra,
    setDiasExtra,
    descuentoPorcentaje,
    setDescuentoPorcentaje
  }
}
