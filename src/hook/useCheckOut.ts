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
 const [descuentoMonto, setDescuentoMonto] = useState(0);

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: hospedaje } = await supabase
        .from('hospedajes')
        .select(`
          *,medios_dias_extra,
    descuento_monto,
    fecha_ingreso,
          detalle_hospedaje_huespedes (
            id,
            estado,
            clientes ( nombre, documento, profesion,ultima_visita )
          )
        `)
        .eq('id_habitacion', hab.id)
        .eq('estado', 'activo')
        .maybeSingle();

      if (hospedaje) {
        setDiasExtra(hospedaje.medios_dias_extra || 0);
  setDescuentoMonto(hospedaje.descuento_monto || 0);
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
 const precioBase = Number(registro?.precio_acordado || 0);
  
  // 2. Aumento por medios días (si decides seguir usando el input)
 const precioPorDia = precioBase / (registro?.cantidad_dias || 1); 
  const aumento = diasExtra * precioPorDia;
  
  // 3. Subtotal
  const subtotal = precioBase + aumento;
  
  // 4. Descuento
 const totalConDescuento = subtotal - descuentoMonto;
  
  // 5. Saldo final
  const aCuenta = Number(registro?.a_cuenta || 0);
  return totalConDescuento - aCuenta;
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
const registrarCargaDiaExtra = async (montoBaseHabitacion: number) => {
  setProcesando(true);
  try {
    // Calculamos el valor del cargo (mitad o entero) basado en el precio base real
    const cargo = montoBaseHabitacion; 
    
    // Sumamos este cargo al precio_acordado actual para mantener la deuda actualizada
    const nuevoPrecioAcordado = Number(registro.precio_acordado || 0) + cargo;
    
    await supabase.from('hospedajes')
      .update({ precio_acordado: nuevoPrecioAcordado })
      .eq('id', registro.id);
      
    onSuccess(); 
  } catch (e: any) {
    alert("Error: " + e.message);
  } finally {
    setProcesando(false);
  }
};
// En tu useCheckOut.ts, añade/actualiza esta función:
const registrarPagoParcial = async (efectivo: number, qr: number) => {
  const montoTotal = Number(efectivo) + Number(qr);
  if (montoTotal <= 0) return;
  
  setProcesando(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const nuevoSaldo = Number(saldoFinal) - montoTotal;
    // 1. Obtener sesión abierta
    const { data: sesionAbierta } = await supabase
      .from('caja_sesiones')
      .select('id')
      .eq('estado', 'abierta')
      .maybeSingle();

    // 2. Registrar en caja (Igual que en el CheckIn)
    const { error: errorCaja } = await supabase
      .from('caja_movimientos')
      .insert([{
        id_sesion: sesionAbierta?.id || null,
        id_usuario: user?.id,
        id_habitacion: hab.id,
        nro_habitacion: String(hab.numero),
        tipo_movimiento: 'ingreso',
        categoria: 'hospedaje_extra',
        monto_total: Number(registro.precio_acordado),
        monto_efectivo: Number(efectivo),
        monto_qr: Number(qr),
        monto_saldo: nuevoSaldo,
        monto_a_cuenta: montoTotal,
        huesped_referencia: registro.nombre_huesped || 'Huésped',
        observaciones: `Abono Hab. #${hab.numero} - ${registro.nombre_huesped}. Saldo restante: ${nuevoSaldo} Bs.`,
        fecha: new Date().toISOString()
      }]);

    if (errorCaja) throw errorCaja;

    // 3. Actualizar saldo en hospedajes
    await supabase
      .from('hospedajes')
      .update({ a_cuenta: (registro.a_cuenta || 0) + montoTotal })
      .eq('id', registro.id);

    onSuccess(); // Esto refrescará los datos del modal
  } catch (e: any) {
    console.error("Error en pago:", e);
    alert("Error al registrar el pago: " + e.message);
  } finally {
    setProcesando(false);
  }
};

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
          observaciones: `Checkout. Extra: ${diasExtra} medios días. Desc: ${descuentoMonto}%`
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
    registrarCargaDiaExtra,
    registrarPagoParcial,
    retirarHuesped,
    realizarSalidaTotal,
    // Nuevos estados para el modal
    diasExtra,
    setDiasExtra,
    descuentoMonto,
    setDescuentoMonto
  }
}
