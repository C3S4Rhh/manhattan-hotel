'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export function ReportesFinancieros() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [rango, setRango] = useState({ inicio: '', fin: '' });
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [responsableId, setResponsableId] = useState('todos');

  useEffect(() => {
    const fetchUsuarios = async () => {
      const { data } = await supabase.from('usuarios').select('id, nombre');
      setUsuarios(data || []);
    };
    fetchUsuarios();
  }, []);

  const cargarDatos = async () => {
    // 1. Cargar movimientos de caja
    let queryMov = supabase
      .from('caja_movimientos')
      .select('*, usuarios(nombre)')
      .order('fecha', { ascending: false });

    if (rango.inicio) queryMov = queryMov.gte('fecha', rango.inicio);
    if (rango.fin) queryMov = queryMov.lte('fecha', `${rango.fin}T23:59:59`);
    if (responsableId !== 'todos') queryMov = queryMov.eq('id_usuario', responsableId);
    
    const { data: movs, error: errMov } = await queryMov;
    if (errMov) {
      console.error("Error cargando movimientos:", errMov);
      return;
    }

    // 2. Cargar ingresos extras filtrados por fecha
    let queryExtras = supabase
      .from('ingresos_extra')
      .select('*')
      .order('fecha', { ascending: false });

    if (rango.inicio) queryExtras = queryExtras.gte('fecha', rango.inicio);
    if (rango.fin) queryExtras = queryExtras.lte('fecha', `${rango.fin}T23:59:59`);

    const { data: ext, error: errExt } = await queryExtras;
    if (errExt) {
      console.error("Error cargando ingresos extra:", errExt);
      return;
    }

    // Enriquecer movimientos con datos de hospedaje y habitación
    const movsEnriquecidos = await Promise.all(
      (movs || []).map(async (m) => {
        let hospedajeData = null;
        if (m.id_habitacion) {
          const { data: hosp } = await supabase
            .from('hospedajes')
            .select('medios_dias_extra, descuento_monto, cantidad_dias, id_habitacion(id, numero)')
            .eq('id_habitacion', m.id_habitacion)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          hospedajeData = hosp;
        }
        return { ...m, hospedajes: hospedajeData };
      })
    );

    setMovimientos(movsEnriquecidos);
    setExtras(ext || []);
  };

  const totales = useMemo(() => {
    const totalMovEfectivo = movimientos.reduce((acc, m) => acc + Number(m.monto_efectivo || 0), 0);
    const totalMovQr = movimientos.reduce((acc, m) => acc + Number(m.monto_qr || 0), 0);
    const totalMovGeneral = movimientos.reduce((acc, m) => acc + Number(m.monto_a_cuenta || m.monto_total || 0), 0);

    const totalExtras = extras.reduce((acc, e) => acc + Number(e.monto || 0), 0);

    return {
      movEfectivo: totalMovEfectivo,
      movQr: totalMovQr,
      movGeneral: totalMovGeneral,
      extras: totalExtras,
      general: totalMovGeneral + totalExtras
    };
  }, [movimientos, extras]);

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 1cm; size: auto; }
          body { 
            margin: 0 !important; 
            padding: 0 !important; 
            zoom: 85%; 
          }
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #reporte-imprimible, #reporte-imprimible * { visibility: visible; }
          #reporte-imprimible { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0 !important; 
          }
          table, tr, td, tfoot { break-inside: avoid; }
          .print-header { display: block !important; }
          .print-firmas { display: flex !important; justify-content: space-around; margin-top: 80px; }
        }
      `}</style>

      <div className="p-6 bg-slate-50 min-h-screen">
        <div id="reporte-imprimible" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-[90rem] mx-auto">
          
          <div className="no-print mb-8 border-b pb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight">Reporte de Ingresos y Movimientos</h1>
            <div className="flex gap-2 mt-4 flex-wrap">
              <input type="date" onChange={e => setRango({...rango, inicio: e.target.value})} className="border rounded-xl p-2 text-xs" />
              <input type="date" onChange={e => setRango({...rango, fin: e.target.value})} className="border rounded-xl p-2 text-xs" />
              <select className="border p-2 rounded-xl text-xs font-bold bg-slate-50" onChange={(e) => setResponsableId(e.target.value)}>
                <option value="todos">Todos los responsables</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
              <button onClick={cargarDatos} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-blue-700">Consultar</button>
              <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-black">Imprimir</button>
            </div>
          </div>
          
          <div className="hidden print-header mb-6 text-center">
            <h1 className="text-2xl font-black uppercase">Reporte Financiero de Ingresos</h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Período: {rango.inicio ? rango.inicio : 'Inicio'} al {rango.fin ? rango.fin : 'Presente'}
            </p>
          </div>
          {/* SECCIÓN DE TOTALES GENERALES */}
<div className="border-t-2 border-slate-800 pt-6 mt-8 bg-slate-50/50 p-6 rounded-2xl flex flex-row justify-between items-center gap-8">
  {/* Columna Izquierda: Detalles */}
  <div className="flex flex-col gap-2">
    <span className="font-black uppercase tracking-widest text-xs text-slate-500 mb-2">Resumen Consolidado</span>
    
    <div className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
      <div className="flex justify-between w-64">
        <span>Efectivo Caja:</span>
        <strong className="text-slate-800 text-base">{totales.movEfectivo.toFixed(2)} Bs.</strong>
      </div>
      <div className="flex justify-between w-64">
        <span>QR Caja:</span>
        <strong className="text-sky-700 text-base">{totales.movQr.toFixed(2)} Bs.</strong>
      </div>
      <div className="flex justify-between w-64   border-slate-200">
        <span>Total Extras:</span>
        <strong className="text-indigo-700 text-base">{totales.extras.toFixed(2)} Bs.</strong>
      </div>
    </div>
  </div>

  {/* Columna Derecha: Total General */}
  <div className="text-right border-l pl-8 border-slate-200">
    <span className="text-xs uppercase font-black text-slate-400 block mb-1">Total General Acumulado</span>
    <span className="text-4xl font-black text-emerald-600">
      {totales.general.toFixed(2)} Bs.
    </span>
  </div>
</div>
          {/* TABLA 1: MOVIMIENTOS DE CAJA */}
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-700 mb-4">Movimientos de Caja</h2>
          <table className="w-full text-sm border-collapse mb-8">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-200">
                <th className="pb-4 text-left px-2">Fecha</th>
                <th className="pb-4 text-left px-2">Responsable</th>
                <th className="pb-4 text-left px-2">Cliente</th>
                <th className="pb-4 text-center px-2">N° Hab.</th>
                                
                <th className="pb-4 text-right px-2">Efectivo</th>
                <th className="pb-4 text-right px-2">QR</th>
                <th className="pb-4 text-right px-2">A cuenta / Total</th>
                <th className="pb-4 text-left px-2">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-4 text-center text-xs text-slate-400">No hay movimientos registrados en este período.</td>
                </tr>
              ) : (
                movimientos.map((m) => {
                  const diasExtra = m.hospedajes?.medios_dias_extra || 0;
                  const descuento = m.hospedajes?.descuento_monto || 0;
                  const efectivo = Number(m.monto_efectivo || 0);
                  const qr = Number(m.monto_qr || 0);
                  const montoTotal = Number(m.monto_a_cuenta || m.monto_total || 0);
                  const nroHabitacion = m.hospedajes?.id_habitacion?.numero || '-';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <span className="block font-bold text-slate-700">
                          {new Date(m.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-600 uppercase text-[10px]">{m.usuarios?.nombre || 'Desconocido'}</td>
                      <td className="py-3 px-2 text-sm font-bold text-slate-700 capitalize">
                        {m.huesped_referencia || 'Gasto Operativo'} 
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-blue-600 text-xs">
                        {nroHabitacion}
                      </td>
                      
                     
                      <td className="py-3 px-2 text-right font-bold text-slate-700 text-xs">
                        {efectivo > 0 ? `${efectivo.toFixed(2)} Bs.` : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-sky-600 text-xs">
                        {qr > 0 ? `${qr.toFixed(2)} Bs.` : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-black text-emerald-600 text-xs">
                        {montoTotal.toFixed(2)} Bs.
                      </td>
                      <td className="py-3 px-2 text-slate-700 text-xs max-w-xs">{m.observaciones}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* TABLA 2: INGRESOS EXTRAS */}
          <h2 className="text-lg font-black uppercase tracking-tight text-indigo-700 mb-4">Ingresos Extras Detallados</h2>
          <table className="w-full text-sm border-collapse mb-8">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-200">
                <th className="pb-4 text-left px-2">Fecha</th>
                <th className="pb-4 text-left px-2">Categoría</th>
                <th className="pb-4 text-left px-2">Concepto / Descripción</th>
                <th className="pb-4 text-right px-2">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {extras.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-xs text-slate-400">No hay ingresos extras registrados en este período.</td>
                </tr>
              ) : (
                extras.map((e) => {
                  const montoExtra = Number(e.monto || 0);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <span className="block font-bold text-slate-700">
                          {new Date(e.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(e.fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-indigo-600 uppercase text-[10px]">{e.categoria || 'General'}</td>
                      <td className="py-3 px-2 text-sm font-bold text-slate-700 capitalize">
                        {e.concepto || e.descripcion || 'Sin concepto'}
                      </td>
                      <td className="py-3 px-2 text-right font-black text-indigo-600 text-xs">
                        {montoExtra.toFixed(2)} Bs.
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

       

          <div className="hidden print-firmas">
            <div className="text-center border-t border-black w-56 pt-2 text-xs font-bold uppercase">
              Firma Responsable / Caja
            </div>
            <div className="text-center border-t border-black w-56 pt-2 text-xs font-bold uppercase">
              Administración
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
