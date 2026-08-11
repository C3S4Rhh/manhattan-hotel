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
  
  // Estados para fechas del reporte general y tabla
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);

  // Nuevo estado para la vista visual (mensual / anual) de reposiciones y gastos
  const [modoVisual, setModoVisual] = useState<'mensual' | 'anual'>('mensual');
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(new Date().toISOString().slice(0, 7)); // Formato "YYYY-MM"

  const cargarDatos = async () => {
    let query = supabase.from('caja_chica').select('*').order('fecha', { ascending: false });
    
    // Filtro por fechas para la tabla principal
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
      if (movs.length > 0) setSaldo(movs[0].saldo_actual);
    }
  };

  useEffect(() => { cargarDatos(); }, [fechaDesde, fechaHasta]);

  const registrarMovimiento = async (tipo: 'gasto' | 'reposicion') => {
    const valor = parseFloat(monto);
    if (!valor || valor <= 0) return alert("Ingrese un monto válido");

    setCargando(true);

    const { data: ultimoMov } = await supabase
      .from('caja_chica')
      .select('saldo_actual')
      .order('fecha', { ascending: false })
      .limit(1);

    const saldoRealActual = ultimoMov && ultimoMov.length > 0 ? Number(ultimoMov[0].saldo_actual) : 0;

    if (tipo === 'gasto' && saldoRealActual < valor) {
      setCargando(false);
      return alert("Saldo insuficiente");
    }

    const nuevoSaldo = tipo === 'gasto' ? saldoRealActual - valor : saldoRealActual + valor;

    const { error } = await supabase.from('caja_chica').insert({
      usuario_id: usuarioActual.id,
      descripcion: descripcion || (tipo === 'reposicion' ? 'Reposición' : 'Gasto'),
      monto: valor,
      tipo,
      saldo_actual: nuevoSaldo
    });

    if (error) {
      console.error("Error al registrar:", error);
      alert("No se pudo registrar el movimiento.");
    } else {
      setMonto('');
      setDescripcion('');
      await cargarDatos();
    }
    setCargando(false);
  };

  const totalGastos = movimientos
    .filter(m => m.tipo === 'gasto')
    .reduce((acc, m) => acc + m.monto, 0);

  const totalReposiciones = movimientos
    .filter(m => m.tipo === 'reposicion')
    .reduce((acc, m) => acc + m.monto, 0);

  // --- CÁLCULOS PARA EL RESUMEN VISUAL (MENSUAL / ANUAL) ---
  // Consultamos todos los movimientos de la BD sin el filtro de la tabla para hacer los cálculos globales de barras/tarjetas
  const [todosMovimientos, setTodosMovimientos] = useState<any[]>([]);
  
  useEffect(() => {
    const cargarTodoParaGrafico = async () => {
      const { data } = await supabase.from('caja_chica').select('*');
      if (data) setTodosMovimientos(data);
    };
    cargarTodoParaGrafico();
  }, [movimientos]); // Se recarga cuando cambian los movimientos principales

  // Datos filtrados según la selección visual (mensual o anual)
  const movimientosFiltradosVisual = todosMovimientos.filter(m => {
    if (!m.fecha) return false;
    if (modoVisual === 'mensual') {
      // mesSeleccionado es "YYYY-MM"
      return m.fecha.startsWith(mesSeleccionado);
    } else {
      // anioSeleccionado es un número o string del año ej: 2026
      return m.fecha.startsWith(String(anioSeleccionado));
    }
  });

  const gastosVisual = movimientosFiltradosVisual
    .filter(m => m.tipo === 'gasto')
    .reduce((acc, m) => acc + m.monto, 0);

  const reposicionesVisual = movimientosFiltradosVisual
    .filter(m => m.tipo === 'reposicion')
    .reduce((acc, m) => acc + m.monto, 0);

  // Si es anual, agrupamos por mes para mostrar desglose visual opcional o barras simples
  const mesesAnio = Array.from({ length: 12 }, (_, i) => {
    const mesNum = String(i + 1).padStart(2, '0');
    return `${anioSeleccionado}-${mesNum}`;
  });

  const eliminarMovimiento = async (id: string) => {
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
      await cargarDatos();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 space-y-8">
      <h1 className="text-2xl font-black uppercase">Caja Chica</h1>
      
      {/* Panel de Saldo y Filtros Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-2xl">
          <p className="text-slate-400 text-[10px] uppercase tracking-widest">Saldo Disponible</p>
          <h2 className="text-2xl font-black">{saldo.toFixed(2)} Bs.</h2>
        </div>

        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100">
          <p className="text-rose-400 text-[10px] uppercase tracking-widest">Total Gastos (Filtrados)</p>
          <h2 className="text-2xl font-black">{totalGastos.toFixed(2)} Bs.</h2>
        </div>

        <div className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl border border-emerald-100">
          <p className="text-emerald-400 text-[10px] uppercase tracking-widest">Total Reposiciones (Filtrados)</p>
          <h2 className="text-2xl font-black">{totalReposiciones.toFixed(2)} Bs.</h2>
        </div>
      </div>

      {/* --- NUEVO SECTOR VISUAL: MENSUAL / ANUAL DE REPOSICIÓN Y GASTOS --- */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-700 text-sm uppercase">Resumen Gráfico y Estadístico</h3>
            <p className="text-xs text-slate-400">Visualización específica de Reposiciones y Gastos</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
            <button
              onClick={() => setModoVisual('mensual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${modoVisual === 'mensual' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setModoVisual('anual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${modoVisual === 'anual' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Anual
            </button>
          </div>
        </div>

        {/* Selectores específicos para el bloque visual */}
        <div className="flex flex-wrap items-center gap-4">
          {modoVisual === 'mensual' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Seleccionar Mes</label>
              <input
                type="month"
                value={mesSeleccionado}
                onChange={e => setMesSeleccionado(e.target.value)}
                className="p-2 rounded-xl border text-sm bg-white"
              />
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Seleccionar Año</label>
              <select
                value={anioSeleccionado}
                onChange={e => setAnioSeleccionado(Number(e.target.value))}
                className="p-2 rounded-xl border text-sm bg-white font-bold"
              >
                {[2024, 2025, 2026, 2027, 2028].map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tarjetas de resultados visuales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Reposiciones ({modoVisual === 'mensual' ? mesSeleccionado : anioSeleccionado})</span>
              <h4 className="text-xl font-black text-emerald-700">{reposicionesVisual.toFixed(2)} Bs.</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">↑</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Gastos ({modoVisual === 'mensual' ? mesSeleccionado : anioSeleccionado})</span>
              <h4 className="text-xl font-black text-rose-700">{gastosVisual.toFixed(2)} Bs.</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold">↓</div>
          </div>
        </div>

        {/* Barra de proporción visual rápida */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
            <span>Balance del periodo: {(reposicionesVisual - gastosVisual).toFixed(2)} Bs.</span>
            <span>Total Movido: {(reposicionesVisual + gastosVisual).toFixed(2)} Bs.</span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
            {reposicionesVisual + gastosVisual > 0 ? (
              <>
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${(reposicionesVisual / (reposicionesVisual + gastosVisual)) * 100}%` }}
                  title="Proporción de Reposiciones"
                ></div>
                <div 
                  className="bg-rose-500 h-full transition-all duration-500" 
                  style={{ width: `${(gastosVisual / (reposicionesVisual + gastosVisual)) * 100}%` }}
                  title="Proporción de Gastos"
                ></div>
              </>
            ) : (
              <div className="bg-slate-300 w-full h-full"></div>
            )}
          </div>
        </div>
      </div>
      {/* ------------------------------------------------------------- */}

      {/* Selector de Fechas para Tabla y Reporte PDF */}
      <div className="flex flex-wrap gap-4 items-end bg-slate-50 p-4 rounded-2xl justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block">Desde</label>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="p-2 rounded-xl border bg-white" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block">Hasta</label>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="p-2 rounded-xl border bg-white" />
          </div>
        </div>
        <button onClick={() => generarReporteCajaChica(movimientos, fechaDesde, fechaHasta)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all">
          Generar PDF
        </button>
      </div>

      {/* Formulario de Registro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="number" placeholder="Monto (Bs.)" value={monto} onChange={e => setMonto(e.target.value)} className="border p-3 rounded-xl" />
        <input type="text" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="border p-3 rounded-xl" />
        <button onClick={() => registrarMovimiento('gasto')} disabled={saldo <= 0 || cargando} className="bg-rose-500 text-white p-3 rounded-xl font-bold hover:bg-rose-600 transition-all">Registrar Gasto</button>
        <button onClick={() => registrarMovimiento('reposicion')} disabled={cargando} className="bg-emerald-500 text-white p-3 rounded-xl font-bold hover:bg-emerald-600 transition-all">Registrar Reposición</button>
      </div>

      {/* Tabla de Movimientos */}
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
        <tbody className="divide-y">
          {movimientos.map((m) => (
            <tr key={m.id}>
              <td className="py-3 text-slate-500">{new Date(m.fecha).toLocaleDateString()}</td>
              <td className="py-3 font-bold">{m.nombreOperador}</td>
              <td className="py-3">{m.descripcion}</td>
              <td className={`py-3 text-right font-bold ${m.tipo === 'gasto' ? 'text-rose-500' : 'text-emerald-500'}`}>
                {m.tipo === 'gasto' ? '-' : '+'}{m.monto.toFixed(2)} Bs.
              </td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
