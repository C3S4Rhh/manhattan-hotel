import { supabase } from '@/lib/supabase';

export const obtenerRegistrosDelDia = async () => {
  const hoy = "2026-06-18"; // Usamos la fecha fija para descartar errores

  const { data, error } = await supabase
    .from('hospedajes')
   .select(`
  *,
  habitaciones (numero),
  detalle_hospedaje_huespedes (
    clientes (*) 
  )
`)
    .gte('fecha_ingreso', `${hoy}T00:00:00`)
    .lte('fecha_ingreso', `${hoy}T23:59:59`);

  if (error) {
    console.error("Error al obtener registros:", error);
    return [];
  }
  return data;
};