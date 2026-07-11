export const generarReporteCaja = async (
  usuario: any,
  movimientos: any[],
  gastos: any[],
  ingresosExtra: any[],
  montoInicial: number, // Nuevo parámetro
  totalIngresos: number,
  totalGastos: number,
  totalEnCaja: number
) => {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();

  // --- Cálculos de desgloses ---
  const getSubtotal = (items: any[], tipo: 'efectivo' | 'qr') =>
    items.reduce((acc, item) => {
      const monto = Number(item.monto_a_cuenta || item.monto || 0);
      const montoEspecifico = item.monto_efectivo !== undefined
        ? (tipo === 'efectivo' ? item.monto_efectivo : item.monto_qr)
        : (item.tipo_pago === tipo ? monto : 0);
      return acc + Number(montoEspecifico || 0);
    }, 0);

  const efecMov = movimientos.reduce((a, m) => a + Number(m.monto_efectivo || 0), 0);
  const qrMov = movimientos.reduce((a, m) => a + Number(m.monto_qr || 0), 0);
  const efecGastos = getSubtotal(gastos, 'efectivo');
  const qrGastos = getSubtotal(gastos, 'qr');
  const efecExtra = getSubtotal(ingresosExtra, 'efectivo');
  const qrExtra = getSubtotal(ingresosExtra, 'qr');

  // --- Preparación de filas ---
  const rowsMovimientos = movimientos.map((m) => [
    "INGRESO", m.huesped_referencia || "-", m.observaciones || "-",
    Number(m.monto_efectivo || 0).toFixed(2), Number(m.monto_qr || 0).toFixed(2),
    `${Number(m.monto_a_cuenta || 0).toFixed(2)} Bs.`
  ]);

  const rowsGastos = gastos.map((g) => [
    "GASTO", g.huesped_referencia || "-", g.descripcion || "-",
    g.tipo_pago === "efectivo" ? Number(g.monto).toFixed(2) : "-",
    g.tipo_pago === "qr" ? Number(g.monto).toFixed(2) : "-",
    `-${Number(g.monto).toFixed(2)} Bs.`
  ]);

  const rowsExtras = ingresosExtra.map((i) => [
    "EXTRA", i.categoria || "-", i.descripcion || "-",
    i.tipo_pago === "efectivo" ? Number(i.monto).toFixed(2) : "-",
    i.tipo_pago === "qr" ? Number(i.monto).toFixed(2) : "-",
    `+${Number(i.monto).toFixed(2)} Bs.`
  ]);

  // --- Generación PDF ---
  doc.setFontSize(18);
  doc.text("Reporte de Cierre de Caja", 14, 20);
  doc.setFontSize(10);
  doc.text(`Operador: ${usuario.nombre || "de turno"} | Fecha: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [["Tipo", "Ref", "Detalle", "Efectivo", "QR", "Total"]],
    body: [...rowsMovimientos, ...rowsGastos, ...rowsExtras],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

// Resumen de caja limpio
doc.setFontSize(12);
doc.text("Resumen de Caja:", 14, finalY);
doc.setFontSize(10);

// Usamos un incremento de 7 en cada línea para evitar encimarlos
let currentY = finalY + 7;
doc.text(`Monto Inicial: ${Number(montoInicial).toFixed(2)} Bs.`, 14, currentY);

currentY += 7;
doc.text(`Total Ingresos Habitación: ${totalIngresos.toFixed(2)} Bs.`, 14, currentY);

currentY += 7;
const totalExtras = ingresosExtra.reduce((a, i) => a + Number(i.monto || 0), 0);
doc.text(`Total Ingresos Extra: + ${totalExtras.toFixed(2)} Bs.`, 14, currentY);

currentY += 7;
doc.text(`Total Ingresos (Habitación + Extras): ${(totalIngresos + ingresosExtra.reduce((a, i) => a + Number(i.monto), 0)).toFixed(2)} Bs.`, 14, currentY);
  

currentY += 7;
doc.text(`Total Gastos: - ${totalGastos.toFixed(2)} Bs.`, 14, currentY);

// Método de Pago
currentY += 10;
doc.setFontSize(11);
doc.text("--- Detalle por Método de Pago ---", 14, currentY);

doc.setFontSize(10);
currentY += 7;
doc.text(`Efectivo en Caja: ${(montoInicial + efecMov + efecExtra - efecGastos).toFixed(2)} Bs.`, 14, currentY);

currentY += 7;
doc.text(`QR Total: ${(qrMov + qrExtra - qrGastos).toFixed(2)} Bs.`, 14, currentY);

// Balance Final
currentY += 10;
doc.setFontSize(12);
doc.text(`BALANCE FINAL GENERAL: ${totalEnCaja.toFixed(2)} Bs.`, 14, currentY);

doc.save(`Cierre_Caja_${new Date().toLocaleDateString()}.pdf`);
};