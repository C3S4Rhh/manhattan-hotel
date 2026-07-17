"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generarReporteCajaChica } from '@/utils/reporteCajaChica';

export function CajaChica({ usuarioActual }: { usuarioActual: any }) {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);
  
  // Estados para fechas
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);

  const cargarDatos = async () => {
    let query = supabase.from('caja_chica').select('*').order('fecha', { ascending: false });
    
    // Filtro por fechas
    if (fechaDesde && fechaHasta) {
      query = query.gte('fecha', fechaDesde).lte('fecha', fechaHasta + 'T23:59:59');
    }

    const { data: movs } = await query;
    const { data: users } = await supabase.from('usuarios').select('id, nombre');
    
    if (movs) {
      const datosConUsuario = movs.map(m => ({
        ...m,
        nombreOperador: users?.find(u => u.id === m.usuario_id)?.nombre || 'N/A'
      }));
      setMovimientos(datosConUsuario);
      // El saldo siempre se toma del último movimiento global para reflejar la realidad
      if (movs.length > 0) setSaldo(movs[0].saldo_actual);
    }
  };

  useEffect(() => { cargarDatos(); }, [fechaDesde, fechaHasta]);

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
const totalGastos = movimientos
  .filter(m => m.tipo === 'gasto')
  .reduce((acc, m) => acc + m.monto, 0);

const totalReposiciones = movimientos
  .filter(m => m.tipo === 'reposicion')
  .reduce((acc, m) => acc + m.monto, 0);


  const eliminarMovimiento = async (id: string) => {
  // 1. Verificar si es admin
  if (usuarioActual.rol !== 'administrador') {
    return alert("Solo los administradores pueden eliminar movimientos.");
  }

  if (!confirm("¿Estás seguro de que deseas eliminar este movimiento? Esta acción afectará el saldo.")) {
    return;
  }

  const { error } = await supabase
    .from('caja_chica')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo eliminar el movimiento.");
  } else {
    // Recargar datos para actualizar la tabla y el saldo
    await cargarDatos();
  }
};
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-black uppercase mb-8">Caja Chica</h1>
      
      {/* Panel de Saldo y Filtros */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  {/* Saldo Disponible */}
  <div className="bg-slate-900 text-white p-6 rounded-2xl">
    <p className="text-slate-400 text-[10px] uppercase tracking-widest">Saldo Disponible</p>
    <h2 className="text-2xl font-black">{saldo.toFixed(2)} Bs.</h2>
  </div>

  {/* Total Gastos */}
  <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100">
    <p className="text-rose-400 text-[10px] uppercase tracking-widest">Total Gastos</p>
    <h2 className="text-2xl font-black">{totalGastos.toFixed(2)} Bs.</h2>
  </div>

  {/* Total Reposiciones */}
  <div className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl border border-emerald-100">
    <p className="text-emerald-400 text-[10px] uppercase tracking-widest">Total Reposiciones</p>
    <h2 className="text-2xl font-black">{totalReposiciones.toFixed(2)} Bs.</h2>
  </div>
</div>
<div className="md:col-span-2 flex flex-wrap gap-4 items-end bg-slate-50 p-4 rounded-2xl">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block">Desde</label>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="p-2 rounded-xl border" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block">Hasta</label>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="p-2 rounded-xl border" />
          </div>
          <button onClick={() => generarReporteCajaChica(movimientos, fechaDesde, fechaHasta)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs">
            PDF
          </button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input type="number" placeholder="Monto (Bs.)" value={monto} onChange={e => setMonto(e.target.value)} className="border p-3 rounded-xl" />
        <input type="text" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="border p-3 rounded-xl" />
        <button onClick={() => registrarMovimiento('gasto')} disabled={saldo <= 0 || cargando} className="bg-rose-500 text-white p-3 rounded-xl font-bold">Registrar Gasto</button>
        <button onClick={() => registrarMovimiento('reposicion')} disabled={cargando} className="bg-emerald-500 text-white p-3 rounded-xl font-bold">Registrar Reposición</button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 uppercase text-[10px] border-b">
            <th className="pb-2 text-left">Fecha</th>
            <th className="pb-2 text-left">Operador</th>
            <th className="pb-2 text-left">Descripción</th>
            <th className="pb-2 text-right">Monto</th>
            {usuarioActual.rol === 'administrador' && <th className="pb-2 text-center">Acción</th>}
            </tr>
            </thead>
        <tbody className="divide-y">{movimientos.map((m) => (
          <tr key={m.id}>
            <td className="py-3 text-slate-500">{new Date(m.fecha).toLocaleDateString()}</td>
            <td className="py-3 font-bold">{m.nombreOperador}</td>
            <td className="py-3">{m.descripcion}</td>
            <td className={`py-3 text-right font-bold ${m.tipo === 'gasto' ? 'text-rose-500' : 'text-emerald-500'}`}>{m.tipo === 'gasto' ? '-' : '+'}{m.monto.toFixed(2)}</td>
          {/* Botón de eliminar solo para admins */}
        {usuarioActual.rol === 'administrador' && (
          <td className="py-3 text-center">
            <button 
              onClick={() => eliminarMovimiento(m.id)}
              className="text-rose-400 hover:text-rose-600 font-bold text-[10px] uppercase"
            >
              Eliminar
            </button>
          </td>
        )}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
