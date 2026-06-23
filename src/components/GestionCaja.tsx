'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { jsPDF } from "jspdf";
import autotable from "jspdf-autotable";

// Esta declaración es necesaria para que TypeScript reconozca autoTable en jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export function GestionCaja({ usuario, onClose }: any) {
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [montoInicial, setMontoInicial] = useState<string>('');
  const [mostrarModalCierre, setMostrarModalCierre] = useState<boolean>(false);
  const [montoCierre, setMontoCierre] = useState<string>('');

  useEffect(() => {
    cargarDatos();
  }, [usuario.id]);

  const cargarDatos = async () => {
    const { data: caja } = await supabase
      .from('cajas')
      .select('*')
      .eq('usuario_id', usuario.id)
      .eq('estado', 'abierta')
      .maybeSingle();

    if (caja) {
      setCajaActiva(caja);
      const { data: movs } = await supabase
        .from('caja_movimientos')
        .select('*, monto_a_cuenta, huesped_referencia, nro_habitacion')
        .eq('id_usuario', usuario.id)
        .gte('fecha', caja.fecha_apertura); 
      
      setMovimientos(movs || []);
    }
  };

  const imprimirReportePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Reporte de Cierre de Caja", 14, 20);
    doc.setFontSize(10);
    doc.text(`Operador: ${usuario.nombre || 'Cesar'}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 35);

    const columns = ["Cliente", "Habitación", "Monto"];
    const rows = movimientos.map(m => [
      m.huesped_referencia, 
      `Hab. ${m.nro_habitacion || 'N/A'}`, 
      `${Number(m.monto_a_cuenta || 0).toFixed(2)} Bs.`
    ]);

    // Usamos el método ahora que está correctamente tipado e importado
    doc.autoTable({ 
      startY: 45, 
      head: [columns], 
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }
    });

    doc.save(`Cierre_Caja_${new Date().toLocaleDateString()}.pdf`);
  };

  const abrirCaja = async () => {
    if (!montoInicial || parseFloat(montoInicial) < 0) return alert("Ingrese un monto inicial válido");
    const { error } = await supabase.from('cajas').insert([{
      usuario_id: usuario.id,
      monto_apertura: parseFloat(montoInicial),
      estado: 'abierta',
      fecha_apertura: new Date().toISOString()
    }]);
    if (!error) cargarDatos();
  };

  const cerrarCaja = async () => {
    const montoFinal = parseFloat(montoCierre);
    if (isNaN(montoFinal)) return alert("Ingrese monto real contado.");

    const { error } = await supabase.from('cajas').update({ 
      estado: 'cerrada', monto_cierre: montoFinal, fecha_cierre: new Date().toISOString() 
    }).eq('id', cajaActiva.id);
    
    if (!error) {
      alert("Caja cerrada.");
      onClose();
    }
  };

  const totalIngresos = movimientos.reduce((acc, mov) => acc + (Number(mov.monto_a_cuenta) || 0), 0);
  const totalEnCaja = Number(cajaActiva?.monto_apertura || 0) + totalIngresos;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {!cajaActiva ? (
          <div className="p-10 text-center space-y-6">
            <h2 className="text-3xl font-black text-slate-800">Apertura de Turno</h2>
            <input type="number" className="w-full p-6 text-2xl font-bold bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none" placeholder="Monto inicial" onChange={(e) => setMontoInicial(e.target.value)} />
            <button onClick={abrirCaja} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-lg">COMENZAR TURNO</button>
          </div>
        ) : (
          <div className="flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Control de Caja Activa</h2>
                <p className="text-xs font-bold text-slate-400">OPERADOR: {usuario.nombre || 'Cesar'}</p>
              </div>
              <button onClick={() => setMostrarModalCierre(true)} className="bg-rose-600 text-white px-6 py-3 rounded-xl font-black uppercase">Cerrar Caja</button>
            </div>

            <div className="p-8 grid grid-cols-3 gap-4">
              <div className="bg-slate-100 p-6 rounded-3xl"><p className="text-[10px] font-black text-slate-400 uppercase">Monto Inicial</p><p className="text-2xl font-black">{Number(cajaActiva.monto_apertura).toFixed(2)} Bs.</p></div>
              <div className="bg-emerald-500 p-6 rounded-3xl text-white"><p className="text-[10px] font-black opacity-80 uppercase">Ingresos</p><p className="text-2xl font-black">+ {totalIngresos.toFixed(2)} Bs.</p></div>
              <div className="bg-blue-600 p-6 rounded-3xl text-white"><p className="text-[10px] font-black opacity-80 uppercase">Total en Caja</p><p className="text-2xl font-black">{totalEnCaja.toFixed(2)} Bs.</p></div>
            </div>

            <div className="px-8 pb-8 overflow-y-auto">
              <div className="grid grid-cols-5 gap-4 px-4 py-2 text-[10px] font-black text-slate-400 uppercase">
                <div>Cliente</div><div>Habitación</div><div>qr</div><div>efectivo</div><div className="text-right">Monto</div>
              </div>
              <div className="space-y-3">
                {movimientos.map((m) => (
                  <div key={m.id} className="grid grid-cols-5 gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-800 truncate">{m.huesped_referencia}</p>
                    <p className="font-bold text-slate-400 uppercase text-xs">Hab. {m.nro_habitacion}</p>
                    <p className="font-bold text-slate-800 truncate">{m.monto_efectivo}</p>
                    <p className="font-bold text-slate-400 uppercase text-xs">. {m.monto_qr}</p>
                    <p className="font-black text-emerald-600 text-right">+{Number(m.monto_a_cuenta).toFixed(2)}Bs.</p>
                  </div>
                ))}
              </div>
           {/*<button onClick={imprimirReportePDF} className="mt-6 w-full py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Descargar Reporte PDF</button> */}
            </div>
          </div>
        )}
      </div>

      {mostrarModalCierre && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm">
            <h2 className="text-xl font-black uppercase mb-4">Confirmar Cierre</h2>
            <input type="number" placeholder="Monto real contado" className="w-full p-4 bg-slate-100 rounded-2xl font-black mb-4" onChange={(e) => setMontoCierre(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setMostrarModalCierre(false)} className="flex-1 py-4 font-bold text-slate-500">Cancelar</button>
              <button onClick={cerrarCaja} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black">Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}