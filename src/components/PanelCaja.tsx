"use client";
import { useState, useEffect } from 'react'
import { useCaja } from '@/hook/useCaja'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/lib/supabase';

export function PanelCaja({ usuario }: { usuario: any }) {
  const {
    sesionActiva,
    movimientos,
    loading,
    cargandoAccion,
    abrirCaja,
    cerrarCaja
  } = useCaja(usuario);

  // Estados locales para los formularios
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [montoCierreReal, setMontoCierreReal] = useState<number>(0);
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  const [ingresosExtras, setIngresosExtras] = useState<any[]>([]);

  // Cargar ingresos extras correspondientes a la sesión activa o fecha actual
  useEffect(() => {
    if (sesionActiva) {
      const fetchIngresosExtras = async () => {
        const { data } = await supabase
          .from('ingresos_extra')
          .select('*')
          .gte('fecha', sesionActiva.fecha_apertura);
        
        setIngresosExtras(data || []);
      };
      fetchIngresosExtras();
    }
  }, [sesionActiva]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="font-black italic text-slate-400 animate-pulse tracking-widest uppercase">Cargando estado de caja...</p>
      </div>
    );
  }

  if (!sesionActiva) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
          <div className="bg-[#1e293b] p-8 text-white text-center">
            <span className="text-3xl">🔒</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter mt-2">Caja de Recepción Cerrada</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Aperture el turno para operar el sistema</p>
          </div>
          <form 
            className="p-8 space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await abrirCaja(montoInicial);
            }}
          >
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Monto Inicial en Efectivo (Bs.)</label>
              <input 
                type="number" 
                required
                min="0"
                value={montoInicial}
                onChange={(e) => setMontoInicial(Number(e.target.value))}
                className="w-full border-2 border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500 bg-slate-50 font-black text-xl text-slate-700"
                placeholder="0.00"
              />
            </div>
            <button
              type="submit"
              disabled={cargandoAccion}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase text-xs tracking-widest"
            >
              {cargandoAccion ? 'Abriendo...' : 'Aperturar Turno / Caja'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const formatearFechaTitulo = (fechaStr?: string) => {
    const d = fechaStr ? new Date(fechaStr) : new Date();
    const dia = String(d.getDate()).padStart(2, '0');
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const mes = meses[d.getMonth()];
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const totalEfectivoIngresos = movimientos
    .filter(m => m.tipo_movimiento === 'ingreso')
    .reduce((acc, current) => acc + Number(current.monto_efectivo || 0), 0);

  const totalQrIngresos = movimientos
    .filter(m => m.tipo_movimiento === 'ingreso')
    .reduce((acc, current) => acc + Number(current.monto_qr || 0), 0);

  const totalEgresos = movimientos
    .filter(m => m.tipo_movimiento === 'egreso')
    .reduce((acc, current) => acc + Number(current.monto_efectivo || 0), 0);

  const totalExtras = ingresosExtras.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  const saldoEnCajaTeorico = Number(sesionActiva.monto_inicial) + totalEfectivoIngresos - totalEgresos;

  return (
    <div className="bg-slate-50 p-4 md:p-8 rounded-3xl shadow-inner min-h-screen space-y-6">
      
      {/* Cards de KPIs Financieros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">💰 Monto Inicial</span>
          <span className="text-2xl font-black text-slate-700 mt-2">{Number(sesionActiva.monto_inicial).toFixed(2)} Bs.</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">💵 Ingresos Efectivo</span>
          <span className="text-2xl font-black text-emerald-600 mt-2">+{totalEfectivoIngresos.toFixed(2)} Bs.</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">📱 Ingresos QR</span>
          <span className="text-2xl font-black text-indigo-600 mt-2">+{totalQrIngresos.toFixed(2)} Bs.</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">✨ Ingresos Extras</span>
          <span className="text-2xl font-black text-amber-600 mt-2">+{totalExtras.toFixed(2)} Bs.</span>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">💼 Efectivo Esperado</span>
          <span className="text-2xl font-black text-blue-400 mt-2">{saldoEnCajaTeorico.toFixed(2)} Bs.</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Encabezado */}
        <div className="bg-[#1e293b] p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-3xl font-black uppercase tracking-tighter">Control de Caja Activa</h2>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Operador actual: {usuario?.nombre || 'Cesar'} — Abierta el: {new Date(sesionActiva.fecha_apertura).toLocaleString('es-BO')}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setMostrarModalCierre(true)}
              className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-700 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              🔒 Cerrar Turno
            </button>
          </div>
        </div>

        {/* Tabla de Movimientos */}
        <div className="p-6 overflow-x-auto">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Planilla Detallada de Movimientos</h3>
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4 text-left">Fecha y Hora</th>
                <th className="p-4 text-left">Recepcionista</th>
                <th className="p-4 text-left">factura</th>
                <th className="p-4 text-left">Huésped</th>
                <th className="p-4 text-left">Hab.</th>      
                <th className="p-4 text-right">Precio Hospedaje</th>
                <th className="p-4 text-right">Efectivo</th>
                <th className="p-4 text-right">QR</th>
                <th className="p-4 text-right">Saldo Restante</th>
                <th className="p-4 text-right">A cuenta</th>
                <th className="p-4 text-left">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-300 font-bold italic text-sm">
                    No se han registrado movimientos en este turno.
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => {
                  const deudeRestante = Number(m.monto_saldo || 0);
                  const numeroDeHabitacion = m.habitaciones?.nro_habitacion || m.nro_habitacion;
                  const montoEfectivoRow = Number(m.monto_efectivo || 0);
                  const montoQrRow = Number(m.monto_qr || 0);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <span className="block font-bold text-slate-700">
                          {new Date(m.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      
                      <td className="p-4 text-xs font-bold text-slate-600 capitalize">
                        {m.usuarios?.nombre || usuario?.nombre || 'Cesar'}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-500">
                        {m.factura_numero || ' '}
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-700 capitalize">
                        {m.huesped_referencia || 'Gasto Operativo'}
                      </td>
                      
                      <td className="p-4 text-sm font-black text-blue-600">
                        {numeroDeHabitacion ? `#${numeroDeHabitacion}` : '---'}
                      </td>

                      <td className="p-4 text-right text-sm font-semibold text-slate-600">
                        {Number(m.monto_total || 0).toFixed(2)} Bs.
                      </td>
                      
                      <td className="p-4 text-right text-sm font-black text-emerald-600">
                        {montoEfectivoRow > 0 ? `+${montoEfectivoRow.toFixed(2)} Bs.` : '0.00 Bs.'}
                      </td>

                      <td className="p-4 text-right text-sm font-black text-indigo-600">
                        {montoQrRow > 0 ? `+${montoQrRow.toFixed(2)} Bs.` : '0.00 Bs.'}
                      </td>
                      
                      <td className="p-4 text-right text-sm font-black text-slate-700 bg-slate-50/50">
                        {deudeRestante > 0 ? `${deudeRestante.toFixed(2)} Bs.` : '0.00 Bs.'}
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-slate-600">
                        {Number(m.monto_a_cuenta || 0).toFixed(2)} Bs.
                      </td>

                      <td className="p-4 text-xs">
                        {deudeRestante > 0 && m.tipo_movimiento === 'ingreso' ? (
                          <span className="px-2 py-1 rounded bg-rose-50 text-rose-600 font-bold uppercase text-[9px] border border-rose-100">
                            🔴 DEBE SALDO
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 font-bold uppercase text-[9px] border border-emerald-100">
                            🟢 PROCESADO
                          </span>
                        )}
                        {m.observaciones && <p className="text-[10px] text-slate-400 mt-1 italic font-medium">{m.observaciones}</p>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CIERRE DE CAJA / TURNO */}
      {mostrarModalCierre && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-rose-900 p-6 text-white text-center">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-xl font-black uppercase tracking-tighter mt-1">Cierre de Caja y Turno</h2>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={async (e) => {
              e.preventDefault();

              const fechaFormatted = formatearFechaTitulo(); 
              const doc = new jsPDF('l', 'mm', 'a4');

              doc.setFontSize(16);
              doc.text(`PLANILLA DE RECEPCION ${fechaFormatted}`, 148.5, 15, { align: 'center' });

              doc.setFontSize(10);
              doc.text(`Fecha de Apertura: ${new Date(sesionActiva.fecha_apertura).toLocaleString('es-BO')}`, 14, 22);
              doc.text(`Fecha de Cierre: ${new Date().toLocaleString('es-BO')}`, 14, 27);
              doc.text(`Operador ADM: ${usuario?.nombre || 'ADM'}`, 14, 32);
              doc.text(`Monto Inicial en Efectivo: ${sesionActiva.monto_inicial} Bs.`, 14, 37);

              autoTable(doc, {
                startY: 42,
                head: [['Fecha', 'Recepcionista', 'Factura', 'Huésped', 'Hab.', 'Precio', 'Efectivo', 'QR', 'A cuenta', 'Obs.']],
                body: movimientos.map(m => [
                  new Date(m.fecha).toLocaleDateString('es-BO'),
                  m.usuarios?.nombre || '-', 
                  m.factura_numero || ' ', 
                  m.huesped_referencia || '-',
                  m.nro_habitacion || '-',
                  `${Number(m.monto_total || 0).toFixed(2)} Bs.`, 
                  `${Number(m.monto_efectivo || 0).toFixed(2)} Bs.`,
                  `${Number(m.monto_qr || 0).toFixed(2)} Bs.`,
                  `${Number(m.monto_a_cuenta || 0).toFixed(2)} Bs.`,
                  m.observaciones || '-'
                ]),
                theme: 'striped',
                headStyles: { fillColor: [30, 41, 59] },
              });

              let currentY = (doc as any).lastAutoTable.finalY + 8;

              if (ingresosExtras.length > 0) {
                doc.setFontSize(11);
                doc.text("Ingresos Extras Registrados:", 14, currentY);
                currentY += 4;

                autoTable(doc, {
                  startY: currentY,
                  head: [['Fecha', 'Descripción', 'Categoría', 'Responsable', 'Monto']],
                  body: ingresosExtras.map(ie => [
                    new Date(ie.fecha).toLocaleDateString('es-BO'),
                    ie.descripcion || '-',
                    ie.categoria || '-',
                    ie.responsable || '-',
                    `${Number(ie.monto || 0).toFixed(2)} Bs.`
                  ]),
                  theme: 'grid',
                  headStyles: { fillColor: [217, 119, 6] },
                });

                currentY = (doc as any).lastAutoTable.finalY + 8;
              }

              const totalGeneralIngresos = totalEfectivoIngresos + totalQrIngresos + totalExtras;

              doc.setFontSize(11);
              doc.text(`Total Ingresos en Efectivo: ${totalEfectivoIngresos.toFixed(2)} Bs.`, 14, currentY);
              doc.text(`Total Ingresos por QR: ${totalQrIngresos.toFixed(2)} Bs.`, 14, currentY + 6);
              doc.text(`total hab: ${(totalEfectivoIngresos - totalQrIngresos).toFixed(2)} Bs.`, 14, currentY + 30);
              if (totalExtras > 0) {
                doc.text(`Total Ingresos Extras: ${totalExtras.toFixed(2)} Bs.`, 14, currentY + 12);
                currentY += 6;
              }

              doc.text(`TOTAL INGRESOS: ${totalGeneralIngresos.toFixed(2)} Bs.`, 14, currentY + 12);

              const signatureY = currentY + 45;
              doc.setLineWidth(0.5);
              doc.line(100, signatureY, 200, signatureY); 

              doc.setFontSize(10);
              doc.text("Firma de Recepcionista", 150, signatureY + 6, { align: 'center' });
              doc.text(`Nombre: `, 150, signatureY + 11, { align: 'center' });
              doc.save(`PLANILLA ${fechaFormatted}.pdf`);

              // 1. Construimos el snapshot detallado con los movimientos, extras y totales del turno actual
              const snapshotDetalle = {
                movimientos,
                ingresosExtra: ingresosExtras,
                totales: {
                  inicial: Number(sesionActiva.monto_inicial),
                  ingresosEfectivo: totalEfectivoIngresos,
                  ingresosQr: totalQrIngresos,
                  egresos: totalEgresos,
                  ingresosExtra: totalExtras,
                  efectivoEsperado: saldoEnCajaTeorico,
                  montoCierreReal: Number(montoCierreReal),
                  diferencia: Number(montoCierreReal) - saldoEnCajaTeorico
                }
              };

              // 2. Enviamos el snapshot y los parámetros de cierre a la función cerrarCaja
              const res = await cerrarCaja(Number(montoCierreReal), {
                monto_teorico: saldoEnCajaTeorico,
                total_efectivo: totalEfectivoIngresos,
                total_qr: totalQrIngresos,
                total_extras: totalExtras,
                diferencia: Number(montoCierreReal) - saldoEnCajaTeorico,
                detalle_snapshot: snapshotDetalle
              });

              if (res.success) {
                setMostrarModalCierre(false);
              } else {
                alert("Error al guardar el cierre: " + res.error);
              }
            }}>
              
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100 space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Efectivo Teórico Esperado</p>
                <p className="text-xl font-black text-slate-800">{saldoEnCajaTeorico.toFixed(2)} Bs.</p>
                <p className="text-[10px] text-indigo-600 font-bold">Total QR en Turno: {totalQrIngresos.toFixed(2)} Bs.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Efectivo Real en Caja (Bs.)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={montoCierreReal || ''}
                  onChange={(e) => setMontoCierreReal(Number(e.target.value))}
                  className="w-full border-2 border-slate-100 p-3 rounded-xl font-black text-lg bg-slate-50 text-center outline-none focus:border-rose-500" 
                />
              </div>

              {montoCierreReal !== saldoEnCajaTeorico && (
                <div className={`p-3 rounded-xl text-center text-xs font-bold ${montoCierreReal > saldoEnCajaTeorico ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {montoCierreReal > saldoEnCajaTeorico 
                    ? `Sobrante detectado: +${(montoCierreReal - saldoEnCajaTeorico).toFixed(2)} Bs.`
                    : `Faltante detectado: ${(montoCierreReal - saldoEnCajaTeorico).toFixed(2)} Bs.`
                  }
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={() => setMostrarModalCierre(false)} className="flex-1 bg-slate-100 text-slate-500 font-bold py-3 rounded-xl text-xs uppercase">Cancelar</button>
                <button type="submit" disabled={cargandoAccion} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider">
                  {cargandoAccion ? 'Cerrando...' : 'Confirmar Cierre y Descargar PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
