'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function HistorialCajas() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      
      // 1. Obtenemos las cajas
      const { data: cajas, error: errorCajas } = await supabase
        .from('cajas')
        .select('*')
        .order('fecha_apertura', { ascending: false });

      // 2. Obtenemos los usuarios para hacer el cruce manual
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nombre');

      if (errorCajas) {
        console.error("Error al cargar:", errorCajas);
      } else {
        // 3. Cruzamos los datos usando usuario_id
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

  if (cargando) return <div className="p-8 text-slate-500">Cargando...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[80vh]">
      <h1 className="text-2xl font-black uppercase tracking-tight mb-8">Historial de Cajas</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-200">
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
          {historial.map((caja) => (
            <tr key={caja.id}>
              {/* Aquí usamos el nombre que cruzamos manualmente */}
              <td className="py-4 font-bold text-slate-700">{caja.nombreOperador}</td>
              <td className="py-4">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${caja.monto_cierre ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {caja.monto_cierre ? 'Cerrada' : 'Abierta'}
                </span>
              </td>
              <td className="py-4 text-slate-500 text-xs">{new Date(caja.fecha_apertura).toLocaleString()}</td>
              <td className="py-4 text-slate-500 text-xs">{caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleString() : '-'}</td>
              <td className="py-4 text-right font-bold">{Number(caja.monto_apertura || 0).toFixed(2)} Bs.</td>
              <td className="py-4 text-right font-bold text-red-500">{Number(caja.monto_gastos || 0).toFixed(2)} Bs.</td>
              <td className="py-4 text-right font-bold">{Number(caja.monto_efectivo || 0).toFixed(2)} Bs.</td>
              <td className="py-4 text-right font-bold">{Number(caja.monto_qr || 0).toFixed(2)} Bs.</td>
              <td className="py-4 text-right font-black text-slate-800">{(Number(caja.monto_apertura || 0) + Number(caja.monto_efectivo || 0)).toFixed(2)} Bs.</td>
              <td className="py-4 text-right font-black text-emerald-600">{caja.monto_cierre ? `${Number(caja.monto_cierre).toFixed(2)} Bs.` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
