"use client";
import { useState, useEffect } from "react";
import { obtenerMovimientosHabitaciones } from "@/services/cajaService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function GestionIngresosHabitaciones() {
  const [datos, setDatos] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

  const cargarDatos = async () => {
    const data = await obtenerMovimientosHabitaciones(fechaInicio, fechaFin);
    setDatos(data || []);
  };

  useEffect(() => {
    cargarDatos();
  }, [fechaInicio, fechaFin]);

  const total = datos.reduce((sum, d) => sum + parseFloat(d.monto_total || 0), 0);

  const generarPDF = () => {
    const doc = new jsPDF();
    
    // Título y encabezado del reporte
    doc.setFontSize(18);
    doc.text("Reporte de Ingresos por Habitaciones", 14, 15);
    doc.setFontSize(10);
    doc.text(`Periodo: ${fechaInicio} al ${fechaFin}`, 14, 22);

    // Generar tabla en el PDF
    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Recepcionista', 'Huesped', 'Hab.', 'Efectivo', 'QR', 'Total']],
      body: datos.map(d => [
        new Date(d.fecha).toLocaleDateString(),
        d.usuarios?.nombre || 'Desconocido',
        d.huesped_referencia || '-',
        `Hab. ${d.nro_habitacion}`,
        `${parseFloat(d.monto_efectivo || 0).toFixed(2)} Bs.`,
        `${parseFloat(d.monto_qr || 0).toFixed(2)} Bs.`,
        `${parseFloat(d.monto_total || 0).toFixed(2)} Bs.`
      ]),
    });

    // Añadir el total al final de la tabla
    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.text(`Total Recaudado en el periodo: ${total.toFixed(2)} Bs.`, 14, finalY + 10);

    // Abrir vista previa en nueva pestaña
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-8">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Ingresos por Habitaciones</h2>
        <button 
          onClick={generarPDF}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase hover:bg-emerald-700 transition-all shadow-lg"
        >
          PDF / IMPRIMIR
        </button>
      </header>

      <div className="flex gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="p-2 border rounded-xl" />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="p-2 border rounded-xl" />
      </div>

      <div className="bg-blue-600 p-8 rounded-3xl text-white">
        <p className="text-blue-200 text-xs font-black uppercase">Total Recaudado en Habitaciones</p>
        <h2 className="text-4xl font-black">Bs {total.toFixed(2)}</h2>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b uppercase text-[10px] text-slate-400">
            <tr>
              <th className="p-4">Fecha</th>
              <th className="p-4">Recepcionistas</th>
              <th className="p-4">Huesped</th>
              <th className="p-4">Habitación</th>
              <th className="p-4 text-right">Monto efectivo</th>
              <th className="p-4 text-right">Monto qr</th>
              <th className="p-4 text-right">Monto total</th>
              <th className="">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-bold">{new Date(d.fecha).toLocaleDateString()}</td>
                <td className="p-4 font-black">{d.usuarios?.nombre || 'Desconocido'}</td>
                <td className="p-4 font-black">{d.huesped_referencia}</td>
                <td className="p-4 font-bold text-slate-600">Hab. {d.nro_habitacion}</td>
                <td className="p-4 text-right font-black text-blue-600">+{parseFloat(d.monto_efectivo || 0).toFixed(2)}Bs.
                </td>
                <td className="p-4 text-right font-black text-blue-600">+{parseFloat(d.monto_qr || 0).toFixed(2)}Bs.
                </td>
                <td className="p-4 text-right font-black text-green-600">+{parseFloat(d.monto_total || 0).toFixed(2)}Bs.
                </td>
                <td className="p font-black">{d.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}