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