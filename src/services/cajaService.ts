import { supabase } from '@/lib/supabase';

export const obtenerMovimientosHabitaciones = async (inicio: string, fin: string) => {
  const { data, error } = await supabase
    .from('caja_movimientos')
    .select('*,usuarios(nombre)')
    .gte('fecha', `${inicio}T00:00:00`)
    .lte('fecha', `${fin}T23:59:59`)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data || [];
};