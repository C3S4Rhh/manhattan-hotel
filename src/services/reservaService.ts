import { supabase } from "@/lib/supabase";

export const registrarReservaConAdelanto = async (
  datosReserva: any, 
  montoAdelanto: number, 
  tipoPago: string,
  precioBase: number,     // Precio por día de la habitación
  cantidadDias: number    // Días calculados: (fecha_fin - fecha_inicio)
) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: sesion } = await supabase
    .from('caja_sesiones')
    .select('id')
    .eq('estado', 'abierta')
    .maybeSingle();

  // 1. Cálculo de montos
  const montoTotalReserva = precioBase * cantidadDias;
  const saldoPendiente = montoTotalReserva - montoAdelanto;

  // 2. Insertar Reserva
  const { data: reserva, error: resError } = await supabase
    .from('reservas')
    .insert([{
      id_habitacion: datosReserva.id_habitacion,
      huesped_nombre: datosReserva.huesped_nombre,
      fecha_inicio: datosReserva.fecha_inicio,
      fecha_fin: datosReserva.fecha_fin,
      hora_llegada: datosReserva.hora_llegada,
      monto_adelanto: montoAdelanto,
      monto_total: montoTotalReserva, // Total según días
      estado: 'confirmada'
    }])
    .select()
    .single();

  if (resError) throw resError;

  // 3. Registrar en caja_movimientos
  if (montoAdelanto > 0) {
    const { error: cajaError } = await supabase.from('caja_movimientos').insert([{
      id_sesion: sesion?.id,
      id_usuario: user?.id,
      id_habitacion: datosReserva.id_habitacion,
      tipo_movimiento: 'ingreso',
      categoria: 'Adelanto Reserva',
      monto_total: montoTotalReserva,     // El total que debe pagar el cliente
      monto_a_cuenta: montoAdelanto,      // Lo que efectivamente ingresa hoy
      monto_saldo: saldoPendiente,        // Lo que falta pagar
      monto_efectivo: tipoPago === 'efectivo' ? montoAdelanto : 0,
      monto_qr: tipoPago === 'qr' ? montoAdelanto : 0,
      huesped_referencia: datosReserva.huesped_nombre,
      observaciones: `Reserva Hab. ${datosReserva.nro_habitacion}. Total: ${montoTotalReserva}Bs. Saldo pendiente: ${saldoPendiente}Bs.`,
      fecha: new Date().toISOString()
    }]);

    if (cajaError) throw cajaError;
  }
  
  return reserva;
};