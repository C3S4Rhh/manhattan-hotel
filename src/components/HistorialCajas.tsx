'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function HistorialCajas() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idsSeleccionados, setIdsSeleccionados] = useState<string[]>([]);
  const [idsOcultos, setIdsOcultos] = useState<string[]>([]);

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
  const sumaTotalEfectivo = cajasSeleccionadas.reduce((acc, c) => acc + (Number(c.monto_apertura || 0) + Number(c.monto_efectivo || 0)), 0);
  // Nuevo cálculo para Monto Final
  const sumaFinal = cajasSeleccionadas.reduce((acc, c) => acc + Number(c.monto_cierre || 0), 0);

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

      <table className="w-full text-sm">
        {/* ... el resto de la tabla se mantiene igual ... */}
        <thead>
          <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-200">
            <th className="pb-4 text-left w-10">Sel</th>
            <th className="pb-4 text-center w-10">Acción</th>
            <th className="pb-4 text-left">Operador</th>
            <th className="pb-4 text-left">Estado</th>
            <th className="pb-4 text-left">Apertura</th>
            <th className="pb-4 text-left">Cierre</th>
            <th className="pb-4 text-right">Monto Inicial</th>
            <th className="pb-4 text-right">Monto gastos</th>
            <th className="pb-4 text-right">Monto efectivo</th>
            <th className="pb-4 text-right">Monto qr</th>
            <th className="pb-4 text-right">Total efectivo</th>
            <th className="pb-4 text-right">Monto Final</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {historial.map((caja) => {
            const estaSeleccionado = idsSeleccionados.includes(caja.id);
            const estaOculto = idsOcultos.includes(caja.id);
            return (
              <tr key={caja.id} className={estaOculto ? 'bg-red-50/60' : (estaSeleccionado ? 'bg-blue-100' : '')}>
                {/* ... (contenido de las celdas igual al que tenías) ... */}
                <td className="py-4">
                  <input type="checkbox" checked={estaSeleccionado} disabled={estaOculto} onChange={() => toggleSeleccion(caja.id)} className={`rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 ${estaOculto ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`} />
                </td>
                <td className="py-4 text-center">
                   <button
                    type="button"
                    onClick={() => toggleOcultar(caja.id)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                    title={estaOculto ? "Mostrar fila para selección" : "Ocultar / Bloquear selección"}
                  >
                    {estaOculto ? (
                      /* Icono Ojo Cerrado (Slash) */
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      /* Icono Ojo Abierto */
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 hover:text-slate-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </td>
                <td className={`py-4 font-bold ${estaOculto ? 'text-red-700' : 'text-slate-700'}`}>{caja.nombreOperador}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${estaOculto ? 'bg-red-100 text-red-700' : (caja.monto_cierre ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-600')}`}>
                    {estaOculto ? 'Oculto / Sumado' : (caja.monto_cierre ? 'Cerrada' : 'Abierta')}
                  </span>
                </td>
                <td className={`py-4 text-xs ${estaOculto ? 'text-red-600/70' : 'text-slate-500'}`}>{new Date(caja.fecha_apertura).toLocaleString()}</td>
                <td className={`py-4 text-xs ${estaOculto ? 'text-red-600/70' : 'text-slate-500'}`}>{caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleString() : '-'}</td>
                <td className="py-4 text-right font-bold">{Number(caja.monto_apertura || 0).toFixed(2)} Bs.</td>
                <td className={`py-4 text-right font-bold ${estaOculto ? 'text-red-600' : 'text-red-500'}`}>{Number(caja.monto_gastos || 0).toFixed(2)} Bs.</td>
                <td className="py-4 text-right font-bold">{Number(caja.monto_efectivo || 0).toFixed(2)} Bs.</td>
                <td className="py-4 text-right font-bold">{Number(caja.monto_qr || 0).toFixed(2)} Bs.</td>
                <td className={`py-4 text-right font-black ${estaOculto ? 'text-red-900' : 'text-slate-800'}`}>{(Number(caja.monto_apertura || 0) + Number(caja.monto_efectivo || 0)).toFixed(2)} Bs.</td>
                <td className={`py-4 text-right font-black ${estaOculto ? 'text-red-700' : 'text-emerald-600'}`}>{caja.monto_cierre ? `${Number(caja.monto_cierre).toFixed(2)} Bs.` : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
