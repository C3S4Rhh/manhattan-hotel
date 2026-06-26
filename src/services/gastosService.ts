import { supabase } from '@/lib/supabase';

export const registrarGasto = async (gasto: { 
  descripcion: string; 
  categoria: string; 
  monto: number; 
  tipo_pago: string 
}) => {
  const { data, error } = await supabase
    .from('gastos')
    .insert([gasto]);

  if (error) throw error;
  return data;
};
export const obtenerGastosPorRango = async (inicio: string, fin: string) => {
  // Aseguramos que fin sea el último milisegundo del día
  const fechaFinDate = new Date(fin);
  fechaFinDate.setUTCHours(23, 59, 59, 999);
  
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .gte('fecha', `${inicio}T00:00:00.000Z`) // Inicio del día
    .lte('fecha', fechaFinDate.toISOString()) // Final del día
    .order('fecha', { ascending: false });
    
  return data || [];
};
export const obtenerGastosDelMes = async () => {
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
  
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .gte('fecha', primerDiaMes)
    .order('fecha', { ascending: false });

  if (error) return [];
  return data;
}; 