import { supabase } from '@/lib/supabase';

export const registrarIngreso = async (ingreso: any) => {
  const { data, error } = await supabase.from('ingresos_extra').insert([ingreso]);
  if (error) throw error;
  return data;
};

export const obtenerIngresosPorRango = async (inicio: string, fin: string) => {
// inicio y fin son strings como "2026-06-19"
  
  // Convertimos las fechas a un rango que cubra todo el día (desde 00:00 hasta 23:59)
  const fechaInicio = `${inicio}T00:00:00Z`;
  const fechaFin = `${fin}T23:59:59Z`;

  const { data, error } = await supabase
    .from('ingresos_extra')
    .select('*')
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin)
    .order('fecha', { ascending: false });
    
  if (error) {
    console.error("Error Supabase:", error);
    throw error;
  }
  return data || [];
};