// 1. IMPORTANTE: Esta línea falta o está mal escrita
import { supabase } from '@/lib/supabase'; 

export const obtenerRegistrosDelDia = async () => {
  const fechaBolivia = new Date();
  const offset = 4 * 60 * 60 * 1000;
  const hoy = new Date(fechaBolivia.getTime() - offset).toISOString().split('T')[0];
  
  console.log("Consultando registros para el día:", hoy);

  // 2. Ahora 'supabase' ya está definido gracias al import
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
  return data || [];
};