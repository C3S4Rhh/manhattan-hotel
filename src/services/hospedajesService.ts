import { supabase } from '@/lib/supabase';

export const obtenerRegistrosDelDia = async () => {
  // Obtenemos la fecha exacta en formato YYYY-MM-DD
 
  const fechaBolivia = new Date();
  const offset = 4 * 60 * 60 * 1000;
  const hoy = new Date(fechaBolivia.getTime() - offset).toISOString().split('T')[0];
  
  console.log("Consultando registros para el día:", hoy);
  
  console.log("Filtrando registros para hoy (2026-06-19):", hoy);

  const { data, error } = await supabase
    .from('detalle_hospedaje_huespedes')
    .select(`
      id,
      hospedajes!inner (
        estado,
        precio_acordado,
        a_cuenta,
        fecha_ingreso,
            hora_ingreso,
            fecha_salida,
            responsable,
            recepcionista,
        habitaciones (numero)
      ),
      clientes (*)
    `)
   
    .gte('hospedajes.fecha_ingreso', `${hoy}T00:00:00`)
    .lte('hospedajes.fecha_ingreso', `${hoy}T23:59:59`);

  if (error) {
    console.error("Error al obtener registros:", error);
    return [];
  }
  
  return data || [];
};