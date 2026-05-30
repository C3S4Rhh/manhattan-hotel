'use client'
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export function ReportesFinancieros() {
  const [data, setData] = useState<any[]>([]); 
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
    let query = supabase
      .from('caja_movimientos')
      .select('*, usuarios(nombre)')
      .order('fecha', { ascending: false });

    if (rango.inicio) query = query.gte('fecha', rango.inicio);
    if (rango.fin) query = query.lte('fecha', rango.fin);
    if (responsableId !== 'todos') query = query.eq('id_usuario', responsableId);
    
    const { data: resultados, error } = await query;
    if (error) console.error("Error:", error);
    else setData(resultados || []);
  };

  const totalGeneral = useMemo(() => {
    return data.reduce((sum, item) => sum + Number(item.monto_total || 0), 0);
  }, [data]);

 return (
    <>
      <style jsx global>{`
        @media print {
          /* Eliminamos absolutamente todos los márgenes de página */
          @page { margin: 0; size: auto; }
          
          /*body { margin: 0 !important; padding: 0 !important; }*/
          body { 
      margin: 0 !important; 
      padding: 0 !important; 
      /* Instrucción clave: escala el contenido hacia abajo si es necesario */
      zoom: 85%; 
    }
          .no-print { display: none !important; }
          
          /* Ocultamos todo excepto el reporte */
          body * { visibility: hidden; }
          #reporte-imprimible, #reporte-imprimible * { visibility: visible; }
          
          #reporte-imprimible { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 20px !important; 
          }
          
          /* Evitamos que la tabla o el total fuercen un salto de página */
          table, tr, td, tfoot { break-inside: avoid; }
          
          .print-center { text-align: center; display: block !important; }
        }
      `}</style>

      <div className="p-6 bg-slate-50 min-h-screen">
        <div id="reporte-imprimible" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-6xl mx-auto">
          
          <div className="no-print mb-8 border-b pb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight">Reporte de Ingresos</h1>
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
          
          <div className="hidden print:block print-center mb-8">
             <h1 className="text-2xl font-black uppercase">Reporte de Ingresos</h1>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-200">
                <th className="pb-4 text-left">Fecha</th>
                <th className="pb-4 text-left">Concepto</th>
                <th className="pb-4 text-left">Responsable</th>
                <th className="pb-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((m) => (
                <tr key={m.id}>
                  <td className="py-3">{new Date(m.fecha).toLocaleDateString()}</td>
                  <td className="py-3 text-slate-700">{m.observaciones}</td>
                  <td className="py-3 font-bold text-slate-600 uppercase text-[10px]">{m.usuarios?.nombre || 'Desconocido'}</td>
                  <td className="py-3 text-right font-black text-emerald-600">{Number(m.monto_total || 0).toFixed(2)} Bs.</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-800">
              <tr>
                <td colSpan={3} className="py-4 text-right font-black uppercase tracking-widest text-xs">Total General:</td>
                <td className="py-4 text-right font-black text-emerald-600 text-lg">{totalGeneral.toFixed(2)} Bs.</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}