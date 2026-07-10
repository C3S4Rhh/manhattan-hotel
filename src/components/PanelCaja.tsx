'use client'
import { useState } from 'react'
import { useCaja } from '@/hook/useCaja'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function PanelCaja({ usuario }: { usuario: any }) {
  const {
    sesionActiva,
    movimientos,
    loading,
    cargandoAccion,
    abrirCaja,
    registrarMovimientoManual,
    cerrarCaja
  } = useCaja(usuario);

  const generarReportePDF = () => {
  const doc = new jsPDF();
  
  // Estilos y encabezado
doc.setFontSize(18);
doc.text("CIERRE DE TURNO / CAJA", 14, 20);
doc.setFontSize(10);
doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 30);
doc.text(`Operador de Cierre: ${usuario?.nombre || 'Recepcionista'}`, 14, 35);
doc.text(`Monto Inicial: ${sesionActiva.monto_inicial} Bs.`, 14, 40);

// Tabla de movimientos ajustada
const tableColumn = ["Fecha", "Recepcionista", "Huésped", "Hab.", "Monto Hab.", "Pago (Bs.)"];

const tableRows = movimientos.map(m => [
  new Date(m.fecha).toLocaleDateString(),
  // Aquí usamos el nombre del recepcionista que registró el movimiento
  m.nombre_recepcionista || "N/A", 
  m.huesped_referencia || m.observaciones || "N/A",
  m.nro_habitacion || "-",
  // Incluimos el monto total de la habitación
  Number(m.monto_total || 0).toFixed(2), 
  // Incluimos el pago efectivamente realizado a cuenta
  Number(m.monto_a_cuenta || 0).toFixed(2)
]);

autoTable(doc, {
  startY: 50,
  head: [tableColumn],
  body: tableRows,
});

  // Totales al final
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total Efectivo Esperado: ${saldoEnCajaTeorico.toFixed(2)} Bs.`, 14, finalY);
  doc.text(`Efectivo Real Recibido: ${montoCierreReal.toFixed(2)} Bs.`, 14, finalY + 7);

  doc.save(`cierre_caja_${new Date().getTime()}.pdf`);
};
  // Estados locales para los formularios
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [montoCierreReal, setMontoCierreReal] = useState<number>(0);
  const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);

  // Estado para un nuevo movimiento manual
  const [nuevoMov, setNuevoMov] = useState({
    tipo: 'ingreso' as 'ingreso' | 'egreso',
    montoTotal: 0,
    montoACuenta: 0,
    facturaNumero: '',
    huespedReferencia: '',
    idHabitacion: '',
    observaciones: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="font-black italic text-slate-400 animate-pulse tracking-widest uppercase">Cargando estado de caja...</p>
      </div>
    );
  }

  // 1. INTERFAZ: CAJA CERRADA (SOLICITAR APERTURA)
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

  // Cálculos rápidos de control financiero en pantalla
  const totalIngresos = movimientos
    .filter(m => m.tipo_movimiento === 'ingreso')
    .reduce((acc, current) => acc + Number(current.monto_a_cuenta), 0);

  const totalEgresos = movimientos
    .filter(m => m.tipo_movimiento === 'egreso')
    .reduce((acc, current) => acc + Number(current.monto_a_cuenta), 0);

  const saldoEnCajaTeorico = Number(sesionActiva.monto_inicial) + totalIngresos - totalEgresos;

  // 2. INTERFAZ: CAJA ABIERTA (PANEL DE CONTROL GENERAL)
  return (
    <div className="bg-slate-50 p-4 md:p-8 rounded-3xl shadow-inner min-h-screen space-y-6">
      
      {/* Cards de KPIs Financieros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">💰 Monto Inicial</span>
          <span className="text-2xl font-black text-slate-700 mt-2">{Number(sesionActiva.monto_inicial).toFixed(2)} Bs.</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">📈 Ingresos Totales</span>
          <span className="text-2xl font-black text-emerald-600 mt-2">+{totalIngresos.toFixed(2)} Bs.</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">📉 Egresos Totales</span>
          <span className="text-2xl font-black text-rose-600 mt-2">-{totalEgresos.toFixed(2)} Bs.</span>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">💼 Efectivo Esperado en Caja</span>
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
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4 text-left">Fecha y Hora</th>
                <th className="p-4 text-left">Recepcionista</th>
                <th className="p-4 text-left">Huésped / Concepto</th>
                <th className="p-4 text-left">Hab.</th>
                <th className="p-4 text-left">Nº Documento</th>
                <th className="p-4 text-right">Precio Hospedaje</th>
                <th className="p-4 text-right">A Cuenta (Efectivo)</th>
                <th className="p-4 text-right">Saldo Restante</th>
                <th className="p-4 text-left">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-300 font-bold italic text-sm">
                    No se han registrado movimientos de efectivo en este turno.
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => {
                  const deudeRestante = Number(m.monto_saldo);
                  
                  // Extraemos de forma inteligente el número de habitación sin colapsar si viene UUID
                  const numeroDeHabitacion = m.habitaciones?.nro_habitacion || m.nro_habitacion;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Fecha y Hora */}
                      <td className="p-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <span className="block font-bold text-slate-700">
                          {new Date(m.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      
                      {/* Recepcionista de la Fila (Si tu tabla caja_movimientos incluye los perfiles, cámbialo por m.usuarios?.nombre) */}
                      <td className="p-4 text-xs font-bold text-slate-600 capitalize">
                        {m.usuarios?.nombre || usuario?.nombre || 'Cesar'}
                      </td>
                      
                      {/* Huésped / Concepto */}
                      <td className="p-4 text-sm font-bold text-slate-700 capitalize">
                        {m.huesped_referencia || 'Gasto Operativo'}
                      </td>
                      
                      {/* Habitación con Fallback Inteligente */}
                      <td className="p-4 text-sm font-black text-blue-600">
                        {numeroDeHabitacion ? `#${numeroDeHabitacion}` : '---'}
                      </td>
                      
                      {/* Factura / Recibo */}
                      <td className="p-4 text-xs font-mono text-slate-500">
                        {m.factura_numero || 'S/F'}
                      </td>
                      
                      {/* Precio Hospedaje */}
                      <td className="p-4 text-right text-sm font-semibold text-slate-600">
                        {Number(m.monto_total).toFixed(2)} Bs.
                      </td>
                      
                      {/* A Cuenta */}
                      <td className={`p-4 text-right text-sm font-black ${m.tipo_movimiento === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.tipo_movimiento === 'ingreso' ? '+' : '-'}{Number(m.monto_a_cuenta).toFixed(2)} Bs.
                      </td>
                      
                      {/* Saldo Restante */}
                      <td className="p-4 text-right text-sm font-black text-slate-700 bg-slate-50/50">
                        {deudeRestante > 0 ? `${deudeRestante.toFixed(2)} Bs.` : '0.00 Bs.'}
                      </td>

                      {/* Observaciones */}
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

        // 1. Lógica para generar el PDF de Cierre
        const doc = new jsPDF('l', 'mm', 'a4');
       doc.setFontSize(18);
doc.text("REPORTE DE CIERRE DE CAJA", 14, 15);
doc.setFontSize(10);
doc.text(`Fecha de Cierre: ${new Date().toLocaleString()}`, 14, 22);
doc.text(`Operador: ${usuario?.nombre || 'Recepcionista'}`, 14, 27);
doc.text(`Monto Inicial: ${sesionActiva.monto_inicial} Bs.`, 14, 32);

// Tabla de movimientos ajustada para horizontal
autoTable(doc, {
  startY: 40,
  head: [['Fecha', 'Recepcionista', 'factura', 'Huésped', 'Hab.', 'Precio Hos.', 'Pago', 'Obs.']],
  body: movimientos.map(m => [
    new Date(m.fecha).toLocaleDateString(),
    m.usuarios?.nombre || '-', 
    m.factura_numero || '-', 
    m.huesped_referencia || '-',
    m.nro_habitacion || '-',
    `${Number(m.monto_total || 0).toFixed(2)} Bs.`, 
    `${Number(m.monto_a_cuenta || 0).toFixed(2)} Bs.`,
    m.observaciones || '-'
  ]),
  theme: 'striped',
  headStyles: { fillColor: [30, 41, 59] },
  // NUEVO: Ajustes de columnas
  columnStyles: {
    7: { cellWidth: 70 }, // La columna 6 (Observaciones) tendrá un ancho fijo
  },
  didParseCell: (data) => {
    // Si es la columna de observaciones (índice 6), forzamos el estilo
    if (data.column.index === 7) {
      data.cell.styles.fontSize = 8; // Texto un poco más pequeño para que quepa mejor
    }
  }
});
// Totales finales posicionados a la derecha (gracias a la hoja horizontal)
const finalY = (doc as any).lastAutoTable.finalY + 10;
doc.setFontSize(12);
doc.text(`Total Efectivo Teórico: ${saldoEnCajaTeorico.toFixed(2)} Bs.`, 14, finalY);
doc.text(`Efectivo Real (Reportado): ${montoCierreReal.toFixed(2)} Bs.`, 14, finalY + 10);
doc.text(`Diferencia: ${(montoCierreReal - saldoEnCajaTeorico).toFixed(2)} Bs.`, 14, finalY + 20);

doc.save(`cierre_caja_${new Date().getTime()}.pdf`);

        // 2. Ejecutar cierre en Base de Datos
        const res = await cerrarCaja(montoCierreReal);
        if (res.success) {
          setMostrarModalCierre(false);
        } else {
          alert("Error al guardar el cierre: " + res.error);
        }
      }}>
        
        {/* ... contenido del formulario igual ... */}
        
        <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase">Monto Teórico Esperado</p>
          <p className="text-xl font-black text-slate-800">{saldoEnCajaTeorico.toFixed(2)} Bs.</p>
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

        {/* Notificación visual de descuadre */}
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