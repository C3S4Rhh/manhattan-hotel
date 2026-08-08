"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function HistorialCajas() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idsSeleccionados, setIdsSeleccionados] = useState<string[]>([]);
  const [idsOcultos, setIdsOcultos] = useState<string[]>([]);
  const [cajaSeleccionadaDetalle, setCajaSeleccionadaDetalle] = useState<any | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      
      const { data: cajas, error: errorCajas } = await supabase
        .from('cajas')
        .select('*')
        .order('fecha_apertura', { ascending: false });

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nombre');

      if (errorCajas) {
        console.error("Error al cargar:", errorCajas);
      } else {
        const historialConOperador = (cajas || []).map(caja => ({
          ...caja,
          nombreOperador: usuarios?.find(u => u.id === caja.usuario_id)?.nombre || 'Sin operador'
        }));
        setHistorial(historialConOperador);
      }
      setCargando(false);
    };

    cargarDatos();
  }, []);

  const toggleSeleccion = (id: string) => {
    if (idsOcultos.includes(id)) return;
    setIdsSeleccionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleOcultar = (id: string) => {
    setIdsOcultos(prev => {
      const estaOculto = prev.includes(id);
      if (estaOculto) {
        return prev.filter(i => i !== id);
      } else {
        setIdsSeleccionados(sel => sel.filter(i => i !== id));
        return [...prev, id];
      }
    });
  };

  const cajasSeleccionadas = historial.filter(c => idsSeleccionados.includes(c.id));
  const sumaGastos = cajasSeleccionadas.reduce((acc, c) => acc + Number(c.monto_gastos || 0), 0);
  const sumaEfectivo = cajasSeleccionadas.reduce((acc, c) => acc + Number(c.monto_efectivo || 0), 0);
  const sumaQr = cajasSeleccionadas.reduce((acc, c) => acc + Number(c.monto_qr || 0), 0);

  if (cargando) return <div className="p-8 text-slate-500">Cargando...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">Historial de Cajas</h1>
        
        {idsSeleccionados.length > 0 && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-700">Seleccionados: {idsSeleccionados.length}</p>
              <p className="text-xs font-bold text-emerald-900">Suma de Seleccionados</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Gastos:</span>
                <span className="font-bold text-red-500">{sumaGastos.toFixed(2)} Bs.</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Efectivo:</span>
                <span className="font-bold text-slate-700">{sumaEfectivo.toFixed(2)} Bs.</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">QR:</span>
                <span className="font-bold text-slate-700">{sumaQr.toFixed(2)} Bs.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-200">
              <th className="pb-4 text-left w-10 px-2">Sel</th>
              <th className="pb-4 text-center w-16 px-2">Acción</th>
              <th className="pb-4 text-center w-16 px-2">Detalle</th>
              <th className="pb-4 text-left px-4">Operador</th>
              <th className="pb-4 text-left px-2">Estado</th>
              <th className="pb-4 text-left px-2">Apertura</th>
              <th className="pb-4 text-left px-2">Cierre</th>
              <th className="pb-4 text-right px-2">Monto Inicial</th>
              <th className="pb-4 text-right px-2">Monto gastos</th>
              <th className="pb-4 text-right px-2">Monto efectivo</th>
              <th className="pb-4 text-right px-2">Monto qr</th>
              <th className="pb-4 text-right px-2">Total efectivo</th>
              <th className="pb-4 text-right px-2">Monto Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {historial.map((caja) => {
              const estaSeleccionado = idsSeleccionados.includes(caja.id);
              const estaOculto = idsOcultos.includes(caja.id);
              const tieneSnapshot = !!caja.detalle_snapshot;

              return (
                <tr key={caja.id} className={estaOculto ? 'bg-red-50/60' : (estaSeleccionado ? 'bg-blue-100' : '')}>
                  <td className="py-4 px-2">
                    <input type="checkbox" checked={estaSeleccionado} disabled={estaOculto} onChange={() => toggleSeleccion(caja.id)} className={`rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 ${estaOculto ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`} />
                  </td>
                  <td className="py-4 text-center px-2">
                     <button
                      type="button"
                      onClick={() => toggleOcultar(caja.id)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 inline-block"
                      title={estaOculto ? "Mostrar fila para selección" : "Ocultar / Bloquear selección"}
                    >
                      {estaOculto ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 hover:text-slate-700">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </td>
                  
                  {/* Botón para ver el Snapshot detallado */}
                  <td className="py-4 text-center px-2">
                    <button
                      type="button"
                      disabled={!tieneSnapshot}
                      onClick={() => setCajaSeleccionadaDetalle(caja)}
                      className={`p-1.5 rounded-lg transition-colors inline-block ${tieneSnapshot ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'text-slate-300 cursor-not-allowed'}`}
                      title={tieneSnapshot ? "Ver detalle exacto del cierre" : "Sin snapshot disponible"}
                    >
                      📋
                    </button>
                  </td>

                  <td className={`py-4 px-4 font-bold ${estaOculto ? 'text-red-700' : 'text-slate-700'}`}>{caja.nombreOperador}</td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${estaOculto ? 'bg-red-100 text-red-700' : (caja.monto_cierre ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-600')}`}>
                      {estaOculto ? 'Oculto / Sumado' : (caja.monto_cierre ? 'Cerrada' : 'Abierta')}
                    </span>
                  </td>
                  <td className={`py-4 px-2 text-xs ${estaOculto ? 'text-red-600/70' : 'text-slate-500'}`}>{new Date(caja.fecha_apertura).toLocaleString()}</td>
                  <td className={`py-4 px-2 text-xs ${estaOculto ? 'text-red-600/70' : 'text-slate-500'}`}>{caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleString() : '0'}</td>
                  <td className="py-4 px-2 text-right font-bold">{Number(caja.monto_apertura || 0).toFixed(2)} Bs.</td>
                  <td className={`py-4 px-2 text-right font-bold ${estaOculto ? 'text-red-600' : 'text-red-500'}`}>{Number(caja.monto_gastos || 0).toFixed(2)} Bs.</td>
                  <td className="py-4 px-2 text-right font-bold">{Number(caja.monto_efectivo || 0).toFixed(2)} Bs.</td>
                  <td className="py-4 px-2 text-right font-bold">{Number(caja.monto_qr || 0).toFixed(2)} Bs.</td>
                  <td className={`py-4 px-2 text-right font-black ${estaOculto ? 'text-red-900' : 'text-slate-800'}`}>{(Number(caja.monto_apertura || 0) + Number(caja.monto_efectivo || 0)).toFixed(2)} Bs.</td>
                  <td className={`py-4 px-2 text-right font-black ${estaOculto ? 'text-red-700' : 'text-emerald-600'}`}>{caja.monto_cierre ? `${Number(caja.monto_cierre).toFixed(2)} Bs.` : '0'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL PARA VISUALIZAR EL DETALLE SNAPSHOT */}
      {cajaSeleccionadaDetalle && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
                  Resumen de Turno (Snapshot)
                </h2>
                <p className="text-xs text-slate-400">
                  Operador: <span className="font-bold text-slate-600">{cajaSeleccionadaDetalle.nombreOperador}</span> | Cierre: {new Date(cajaSeleccionadaDetalle.fecha_cierre).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setCajaSeleccionadaDetalle(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Desglose de Totales del Snapshot */}
            {cajaSeleccionadaDetalle.detalle_snapshot?.totales && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Inicial</span>
                  <span className="text-base font-black text-slate-700">{Number(cajaSeleccionadaDetalle.detalle_snapshot.totales.inicial || 0).toFixed(2)} Bs.</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Ingresos</span>
                  <span className="text-base font-black text-emerald-700">{Number(cajaSeleccionadaDetalle.detalle_snapshot.totales.ingresos || 0).toFixed(2)} Bs.</span>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <span className="text-[10px] uppercase font-bold text-red-600 block">Gastos</span>
                  <span className="text-base font-black text-red-700">{Number(cajaSeleccionadaDetalle.detalle_snapshot.totales.gastos || 0).toFixed(2)} Bs.</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Total en Caja</span>
                  <span className="text-base font-black text-blue-700">{Number(cajaSeleccionadaDetalle.detalle_snapshot.totales.enCaja || 0).toFixed(2)} Bs.</span>
                </div>
              </div>
            )}

            {/* Sección de Gastos Registrados en el Snapshot */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Gastos del Turno</h3>
              {/* Total acumulado de Gastos */}
                  <div className="flex justify-between items-center bg-red-50/70 p-3 rounded-xl border border-red-100 mt-2">
                    <span className="text-xs font-black uppercase text-red-800">Total Gastos:</span>
                    <span className="text-xs font-black text-red-700">
                      -{cajaSeleccionadaDetalle.detalle_snapshot.gastos.reduce((acc: number, g: any) => acc + Number(g.monto || 0), 0).toFixed(2)} Bs.
                    </span>
                  </div>
              {cajaSeleccionadaDetalle.detalle_snapshot?.gastos?.length > 0 ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-40 overflow-y-auto space-y-2">
                  {cajaSeleccionadaDetalle.detalle_snapshot.gastos.map((g: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">{g.descripcion || g.motivo || 'Gasto sin descripción'}</span>
                      <span className="font-bold text-red-500">-{Number(g.monto || 0).toFixed(2)} Bs.</span>
                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">No se registraron gastos en este turno.</p>
              )}
            </div>

            {/* Sección de Movimientos de Hospedaje */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Movimientos de Hospedaje</h3>
              {/* Total acumulado de Movimientos de Hospedaje */}
                  <div className="flex justify-between items-center bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 mt-2">
                    <span className="text-xs font-black uppercase text-emerald-800">Total Movimientos Hospedaje:</span>
                    <span className="text-xs font-black text-emerald-700">
                      {cajaSeleccionadaDetalle.detalle_snapshot.movimientos.reduce((acc: number, m: any) => acc + Number(m.monto_efectivo || 0) + Number(m.monto_qr || 0), 0).toFixed(2)} Bs.
                    </span>
                  </div>
              {cajaSeleccionadaDetalle.detalle_snapshot?.movimientos?.length > 0 ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-52 overflow-y-auto space-y-2">
                  {cajaSeleccionadaDetalle.detalle_snapshot.movimientos.map((m: any, index: number) => {
                    const abonoReal = Number(m.monto_efectivo || 0) + Number(m.monto_qr || 0);
                    return (
                      <div key={index} className="text-xs bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700">Hab. #{m.nro_habitacion || '---'} - {m.huesped_referencia || 'Sin huésped'}</span>
                          <span className="font-black text-emerald-600">Abono: {abonoReal.toFixed(2)} Bs.</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">{m.observaciones || m.categoria}</p>
                        <div className="flex gap-4 mt-1 pt-1 border-t border-slate-50 text-[10px] text-slate-400 font-semibold">
                          <span>Efectivo: <strong className="text-slate-700">{Number(m.monto_efectivo || 0).toFixed(2)} Bs.</strong></span>
                          <span>QR: <strong className="text-slate-700">{Number(m.monto_qr || 0).toFixed(2)} Bs.</strong></span>
                        </div>
                      </div>
                    );
                  })}
                  
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">No hay movimientos de hospedaje registrados.</p>
              )}
            </div>

            {/* Sección de Ingresos Extra */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Ingresos Extra / Consumos</h3>
              {/* Total acumulado de Ingresos Extra */}
                  <div className="flex justify-between items-center bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 mt-2">
                    <span className="text-xs font-black uppercase text-emerald-800">Total Ingresos Extra:</span>
                    <span className="text-xs font-black text-emerald-700">
                      +{cajaSeleccionadaDetalle.detalle_snapshot.ingresosExtra.reduce((acc: number, extra: any) => acc + Number(extra.monto || 0), 0).toFixed(2)} Bs.
                    </span>
                  </div>
              {cajaSeleccionadaDetalle.detalle_snapshot?.ingresosExtra?.length > 0 ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-40 overflow-y-auto space-y-2">
                  {cajaSeleccionadaDetalle.detalle_snapshot.ingresosExtra.map((extra: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-700 block">{extra.descripcion || extra.categoria}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Pago: {extra.tipo_pago} | Resp: {extra.responsable}</span>
                      </div>
                      <span className="font-bold text-emerald-600">+{Number(extra.monto || 0).toFixed(2)} Bs.</span>
                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">No hay ingresos extra registrados en este turno.</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setCajaSeleccionadaDetalle(null)}
                className="bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
