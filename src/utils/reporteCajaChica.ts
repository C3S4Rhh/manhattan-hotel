
// caja chica reporte en pdf



export const generarReporteCajaChica = async (movimientos: any[], desde: string, hasta: string) => {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Reporte de Caja Chica", 14, 20);
  doc.setFontSize(10);
  doc.text(`Periodo: ${desde} al ${hasta}`, 14, 28);

  const totalGastos = movimientos.filter(m => m.tipo === 'gasto').reduce((acc, m) => acc + m.monto, 0);
  const totalReposiciones = movimientos.filter(m => m.tipo === 'reposicion').reduce((acc, m) => acc + m.monto, 0);

  autoTable(doc, {
    startY: 35,
    head: [["Fecha", "Operador", "Descripción", "Tipo", "Monto"]],
    body: movimientos.map(m => [
      new Date(m.fecha).toLocaleDateString(),
      m.nombreOperador,
      m.descripcion,
      m.tipo.toUpperCase(),
      m.tipo === 'gasto' ? `-${m.monto.toFixed(2)}` : `+${m.monto.toFixed(2)}`
    ]),
    theme: "grid"
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total Gastos: ${totalGastos.toFixed(2)} Bs.`, 14, finalY);
  doc.text(`Total Reposiciones: ${totalReposiciones.toFixed(2)} Bs.`, 14, finalY + 7);
  
  doc.save(`Reporte_CajaChica_${desde}_${hasta}.pdf`);
};