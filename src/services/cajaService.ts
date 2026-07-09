import { supabase } from '@/lib/supabase';

export const obtenerMovimientosHabitaciones = async (inicio: string, fin: string) => {
  const fechaFinDate = new Date(fin);
  fechaFinDate.setUTCHours(23, 59, 59, 999);
  const inicioISO = `${inicio}T00:00:00`; 
  const finISO = `${fin}T23:59:59`;

  // Fechas para cálculos independientes de calendario
  const fechaActual = new Date();
  const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString();
  const primerDiaAnio = new Date(fechaActual.getFullYear(), 0, 1).toISOString();

  // Ejecutamos las 5 consultas en paralelo
  const [resMov, resGastos, resIngresos, resMensual, resAnual] = await Promise.all([
    supabase.from('caja_movimientos').select('*, usuarios(nombre)').gte('fecha', inicioISO).lte('fecha', finISO).order('fecha', { ascending: false }),
    supabase.from('gastos').select('monto').gte('fecha', inicioISO).lte('fecha', finISO),
    supabase.from('ingresos_extra').select('monto').gte('fecha', inicioISO).lte('fecha', finISO),
    supabase.from('caja_movimientos').select('monto_total').gte('fecha', primerDiaMes),
    supabase.from('caja_movimientos').select('monto_total').gte('fecha', primerDiaAnio)
  ]);

  if (resMov.error) throw resMov.error;

  return {
    movimientos: resMov.data || [],
    totalGastos: (resGastos.data || []).reduce((sum, g) => sum + (Number(g.monto) || 0), 0),
    totalIngresosExtra: (resIngresos.data || []).reduce((sum, i) => sum + (Number(i.monto) || 0), 0),
    totalMensual: (resMensual.data || []).reduce((sum, d) => sum + (Number(d.monto_total) || 0), 0),
    totalAnual: (resAnual.data || []).reduce((sum, d) => sum + (Number(d.monto_total) || 0), 0)
  };
};