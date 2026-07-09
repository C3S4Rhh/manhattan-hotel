export const generarReporteCaja = async (usuario: any, movimientos: any[], gastos: any[], totalIngresos: number, totalGastos: number, totalEnCaja: number) => {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de Cierre de Caja", 14, 20);
  doc.setFontSize(10);
  doc.text(`Operador: ${usuario.nombre || "de turno"}`, 14, 30);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 35);

  const rowsMovimientos = movimientos.map((m) => [
    "INGRESO", m.huesped_referencia || "-", m.observaciones || "-",
    `${Number(m.monto_efectivo || 0).toFixed(2)}`, `${Number(m.monto_qr || 0).toFixed(2)}`,
    `${Number(m.monto_a_cuenta || 0).toFixed(2)} Bs.`
  ]);

  const rowsGastos = gastos.map((g) => [
    "GASTO", g.huesped_referencia || "-", g.descripcion || "-",
    g.tipo_pago === "efectivo" ? Number(g.monto).toFixed(2) : "-",
    g.tipo_pago === "qr" ? Number(g.monto).toFixed(2) : "-",
    `-${Number(g.monto).toFixed(2)} Bs.`
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Tipo", "Cliente/Ref", "Detalle", "Efectivo", "QR", "Total"]],
    body: [...rowsMovimientos, ...rowsGastos],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total Ingresos: ${totalIngresos.toFixed(2)} Bs.`, 14, finalY);
  doc.text(`Total Gastos: ${totalGastos.toFixed(2)} Bs.`, 14, finalY + 7);
  doc.text(`Balance Final: ${totalEnCaja.toFixed(2)} Bs.`, 14, finalY + 14);

  doc.save(`Cierre_Caja_${new Date().toLocaleDateString()}.pdf`);
};