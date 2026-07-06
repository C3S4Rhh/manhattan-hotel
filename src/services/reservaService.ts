import { supabase } from "@/lib/supabase";

export const registrarReservaConAdelanto = async (
  datosReserva: any, 
  montoAdelanto: number, 
  tipoPago: string,
  precioBase: number,     // Precio por día de la habitación
  cantidadDias: number    // Días calculados: (fecha_fin - fecha_inicio)
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
// Si el nombre no está en metadata, podrías usar el email como respaldo
const nombreEmpleado = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Admin";
  // 0. Validar sesión de caja
  const { data: sesion, error: sesionError } = await supabase
    .from('caja_sesiones')
    .select('id')
    .eq('estado', 'abierta')
    .maybeSingle();

  if (sesionError) throw sesionError;
  if (!sesion) throw new Error("No hay una sesión de caja abierta. Por favor, abre caja antes de registrar reservas.");

  // 1. Cálculo de montos
  const montoTotalReserva = precioBase * cantidadDias;
  const saldoPendiente = montoTotalReserva - montoAdelanto;

  // 2. Insertar Reserva
  const { data: reserva, error: resError } = await supabase
    .from('reservas')
    .insert([{
      usuario_id: user?.id,
      nombre_encargado: nombreEmpleado,
      id_habitacion: datosReserva.id_habitacion,
      huesped_nombre: datosReserva.huesped_nombre,
      huesped_telefono: datosReserva.huesped_telefono,
      fecha_inicio: datosReserva.fecha_inicio,
      fecha_fin: datosReserva.fecha_fin,
      hora_llegada: datosReserva.hora_llegada,
      monto_adelanto: montoAdelanto,
      monto_total: montoTotalReserva,
      estado: 'confirmada'
    }])
    .select()
    .single();

  if (resError) throw resError;

  try {
    // 3. Registrar en caja_movimientos
    if (montoAdelanto > 0) {
      const { error: cajaError } = await supabase.from('caja_movimientos').insert([{
        id_sesion: sesion.id,
        id_usuario: user?.id,
        id_reserva: reserva.id, // Enlace clave para integridad de datos
        id_habitacion: datosReserva.id_habitacion,
        tipo_movimiento: 'ingreso',
        categoria: 'Adelanto Reserva',
        monto_total: montoTotalReserva,
        monto_a_cuenta: montoAdelanto,
        monto_saldo: saldoPendiente,
        monto_efectivo: tipoPago === 'efectivo' ? montoAdelanto : 0,
        monto_qr: tipoPago === 'qr' ? montoAdelanto : 0,
        huesped_referencia: datosReserva.huesped_nombre,
        observaciones: `Reserva Hab. ${datosReserva.nro_habitacion}. Total: ${montoTotalReserva}Bs. Saldo: ${saldoPendiente}Bs.`,
        fecha: new Date().toISOString()
      }]);

      if (cajaError) throw cajaError;
    }
  } catch (error: any) {
    // SI FALLA EL REGISTRO EN CAJA, BORRAMOS LA RESERVA PARA MANTENER LIMPIEZA
    // Esto evita que queden reservas "fantasmas" sin su respaldo financiero
    await supabase.from('reservas').delete().eq('id', reserva.id);
    
    console.error("Error crítico en proceso de reserva:", error);
    throw new Error(error.message || "Error desconocido al registrar el pago en caja.");
  }
  
  return reserva;
};