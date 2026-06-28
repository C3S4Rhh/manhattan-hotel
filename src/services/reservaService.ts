import { supabase } from "@/lib/supabase";

export const registrarReservaConAdelanto = async (datosReserva: any, montoAdelanto: number) => {
  
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

  // 2. Si hubo adelanto, registrar en caja_movimientos
  // Usamos el ID de la reserva recién creada para mantener la integridad
  if (montoAdelanto > 0) {
    const { error: cajaError } = await supabase.from('caja_movimientos').insert([{
      tipo_movimiento: 'ingreso',
      categoria: 'Adelanto Reserva',
      monto_total: montoAdelanto,
      monto_efectivo: montoAdelanto, // Puedes ajustar esto si recibes QR
      observaciones: `Adelanto de reserva: ${datosReserva.huesped_nombre}`,
      id_habitacion: datosReserva.id_habitacion, // Enlazamos con la habitación
      nro_habitacion: datosReserva.nro_habitacion, // Asegúrate de pasar este dato
      fecha: new Date().toISOString()
    }]);

    if (cajaError) throw cajaError;
  }
  
  return reserva;
};