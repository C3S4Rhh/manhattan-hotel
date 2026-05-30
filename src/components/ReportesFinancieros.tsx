'use client'
import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Movimiento {
  id: string;
  fecha: string;
  observaciones: string;
  monto_total: number;
}

export function ReportesFinancieros() {
  const [data, setData] = useState<Movimiento[]>([]); 
  const [rango, setRango] = useState({ inicio: '', fin: '' });

  // Lógica para transformar los movimientos en datos para el gráfico (agrupados por mes)
  const datosGrafico = useMemo(() => {
    const resumen: Record<string, number> = {};
    data.forEach(m => {
      const mes = new Date(m.fecha).toLocaleString('es-ES', { month: 'short' });
      resumen[mes] = (resumen[mes] || 0) + Number(m.monto_total);
    });
    return Object.keys(resumen).map(mes => ({ mes, ganancias: resumen[mes] }));
  }, [data]);

  const cargarDatos = async () => {
    let query = supabase.from('caja_movimientos').select('*');
    if (rango.inicio) query = query.gte('fecha', rango.inicio);
    if (rango.fin) query = query.lte('fecha', rango.fin);
    
    const { data: resultados, error } = await query.order('fecha', { ascending: true });
    
    if (error) console.error("Error:", error);
    else setData(resultados || []);
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN DE GRÁFICO */}
      <div className="h-80 w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-700 mb-4 uppercase text-xs tracking-widest">Ganancias por Mes</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="ganancias" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECCIÓN DE TABLA */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-lg font-black uppercase tracking-tight">Reporte de Ingresos</h1>
          <div className="flex gap-2">
            <input type="date" onChange={e => setRango({...rango, inicio: e.target.value})} className="border rounded-xl p-2 text-xs" />
            <input type="date" onChange={e => setRango({...rango, fin: e.target.value})} className="border rounded-xl p-2 text-xs" />
            <button onClick={cargarDatos} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase">Consultar</button>
            <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase">Imprimir</button>
          </div>
        </div>
        
        <table className="w-full text-sm">
          <thead className="text-slate-400 uppercase text-[10px] text-left">
            <tr><th className="pb-4">Fecha</th><th className="pb-4">Concepto</th><th className="pb-4 text-right">Monto</th></tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="py-4">{new Date(m.fecha).toLocaleDateString()}</td>
                <td className="py-4">{m.observaciones}</td>
                <td className="py-4 text-right font-bold text-emerald-600">{Number(m.monto_total || 0).toFixed(2)} Bs.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}