'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function CajaChica({ usuarioActual }: { usuarioActual: any }) {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    const { data: movs } = await supabase.from('caja_chica').select('*').order('fecha', { ascending: false });
    const { data: users } = await supabase.from('usuarios').select('id, nombre');
    
    if (movs) {
      const datosConUsuario = movs.map(m => ({
        ...m,
        nombreOperador: users?.find(u => u.id === m.usuario_id)?.nombre || 'N/A'
      }));
      setMovimientos(datosConUsuario);
      setSaldo(movs.length > 0 ? movs[0].saldo_actual : 0);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const registrarMovimiento = async (tipo: 'gasto' | 'reposicion') => {
    const valor = parseFloat(monto);
    if (!valor || valor <= 0) return alert("Ingrese un monto válido");
    if (tipo === 'gasto' && saldo < valor) return alert("Saldo insuficiente");

    setCargando(true);
    await supabase.from('caja_chica').insert({
      usuario_id: usuarioActual.id,
      descripcion: descripcion || (tipo === 'reposicion' ? 'Reposición' : 'Gasto'),
      monto: valor,
      tipo,
      saldo_actual: tipo === 'gasto' ? saldo - valor : saldo + valor
    });
    setMonto(''); setDescripcion('');
    await cargarDatos();
    setCargando(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[80vh]">
      <h1 className="text-2xl font-black uppercase tracking-tight mb-8">Caja Chica</h1>
      <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8 flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-widest">Saldo Disponible</p>
          <h2 className="text-4xl font-black">{saldo.toFixed(2)} Bs.</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input type="number" placeholder="Monto (Bs.)" value={monto} onChange={e => setMonto(e.target.value)} className="border p-3 rounded-xl" />
        <input type="text" placeholder="Descripción del gasto" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="border p-3 rounded-xl" />
        <button onClick={() => registrarMovimiento('gasto')} disabled={saldo <= 0 || cargando} className="bg-rose-500 text-white p-3 rounded-xl font-bold hover:bg-rose-600 disabled:opacity-50">Registrar Gasto</button>
        <button onClick={() => registrarMovimiento('reposicion')} disabled={cargando} className="bg-emerald-500 text-white p-3 rounded-xl font-bold hover:bg-emerald-600">Registrar Reposición</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-slate-400 uppercase text-[10px] border-b"><th className="pb-2 text-left">Fecha</th><th className="pb-2 text-left">Operador</th><th className="pb-2 text-left">Descripción</th><th className="pb-2 text-right">Monto</th></tr></thead>
        <tbody className="divide-y">{movimientos.map((m) => (
          <tr key={m.id}>
            <td className="py-3 text-slate-500">{new Date(m.fecha).toLocaleDateString()}</td>
            <td className="py-3 font-bold">{m.nombreOperador}</td>
            <td className="py-3">{m.descripcion}</td>
            <td className={`py-3 text-right font-bold ${m.tipo === 'gasto' ? 'text-rose-500' : 'text-emerald-500'}`}>{m.tipo === 'gasto' ? '-' : '+'}{m.monto.toFixed(2)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}