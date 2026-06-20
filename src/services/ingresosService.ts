import { supabase } from '@/lib/supabase';

export const registrarIngreso = async (ingreso: any) => {
  const { data, error } = await supabase.from('ingresos_extra').insert([ingreso]);
  if (error) throw error;
  return data;
};

export const obtenerIngresosDelMes = async () => {
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
  const { data, error } = await supabase
    .from('ingresos_extra')
    .select('*')
    .gte('fecha', primerDia)
    .order('fecha', { ascending: false });
  return data || [];
};