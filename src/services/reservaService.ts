import { supabase } from "@/lib/supabase";

export const registrarReservaConAdelanto = async (datosReserva: any, montoAdelanto: number, tipoPago: string) => {
  // 1. Insertar la reserva
  const { data: reserva, error: resError } = await supabase
    .from('reservas')
    .insert([{
      id_habitacion: datosReserva.id_habitacion,
      huesped_nombre: datosReserva.huesped_nombre,
      huesped_telefono: datosReserva.huesped_telefono,
      fecha_inicio: datosReserva.fecha_inicio,
      fecha_fin: datosReserva.fecha_fin,
      hora_llegada: datosReserva.hora_llegada,
      monto_adelanto: montoAdelanto,
      estado: 'confirmada'
    }])
    .select();

  if (resError) throw resError;

  // 2. Registrar en caja_movimientos
  if (montoAdelanto > 0) {
    const { error: cajaError } = await supabase.from('caja_movimientos').insert([{
      tipo_movimiento: 'ingreso',
      categoria: 'Adelanto Reserva',
      monto_total: montoAdelanto,
      monto_efectivo: tipoPago === 'efectivo' ? montoAdelanto : 0,
      monto_qr: tipoPago === 'qr' ? montoAdelanto : 0,
      observaciones: `Adelanto (${tipoPago}): ${datosReserva.huesped_nombre}`,
      id_habitacion: datosReserva.id_habitacion,
      nro_habitacion: String(datosReserva.nro_habitacion || 'N/A'),
      fecha: new Date().toISOString()
    }]);

    if (cajaError) throw cajaError;
  }
  
  return reserva;
};