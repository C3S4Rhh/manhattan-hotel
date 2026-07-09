import { supabase } from '@/lib/supabase';

export const obtenerMovimientosHabitaciones = async (inicio: string, fin: string) => {
  // 1. Usar formato YYYY-MM-DD simple para evitar desfases de zona horaria
  const inicioISO = `${inicio}T00:00:00`;
  const finISO = `${fin}T23:59:59`;

  const fechaActual = new Date();
  // Formato: 2026-07-01
  const primerDiaMes = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-01`;
  // Formato: 2026-01-01
  const primerDiaAnio = `${fechaActual.getFullYear()}-01-01`;

  const [resMov, resGastos, resIngresos, resMensual, resAnual] = await Promise.all([
    supabase.from('caja_movimientos').select('*, usuarios(nombre)').gte('fecha', inicioISO).lte('fecha', finISO).order('fecha', { ascending: false }),
    supabase.from('gastos').select('monto').gte('fecha', inicioISO).lte('fecha', finISO),
    supabase.from('ingresos_extra').select('monto').gte('fecha', inicioISO).lte('fecha', finISO),
    // Al enviar el string '2026-07-01', Postgres lo compara correctamente con el inicio del día local
    supabase.from('caja_movimientos').select('monto_total').gte('fecha', primerDiaMes),
    supabase.from('caja_movimientos').select('monto_total').gte('fecha', primerDiaAnio)
  ]); 

  // ... resto del código igual

  if (resMov.error) throw resMov.error;

  return {
    movimientos: resMov.data || [],
    totalGastos: (resGastos.data || []).reduce((sum, g) => sum + (Number(g.monto) || 0), 0),
    totalIngresosExtra: (resIngresos.data || []).reduce((sum, i) => sum + (Number(i.monto) || 0), 0),
    totalMensual: (resMensual.data || []).reduce((sum, d) => sum + (Number(d.monto_total) || 0), 0),
    totalAnual: (resAnual.data || []).reduce((sum, d) => sum + (Number(d.monto_total) || 0), 0)
  };
};