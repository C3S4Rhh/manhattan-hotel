"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FormularioGasto } from "./FormularioGasto";
import { generarReporteCaja } from "@/utils/reportePdf";

export function GestionCaja({ usuario, onClose }: any) {
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [gastos, setGastos] = useState<any[]>([]);
  const [montoInicial, setMontoInicial] = useState("");
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  const [mostrarGasto, setMostrarGasto] = useState(false);
  const [montoCierre, setMontoCierre] = useState("");
  const [ingresosExtra, setIngresosExtra] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [usuario.id]);

  const cargarDatos = async () => {
    const { data: caja } = await supabase
      .from("cajas")
      .select("*")
      .eq("usuario_id", usuario.id)
      .eq("estado", "abierta")
      .maybeSingle();
    if (caja) {
      setCajaActiva(caja);
      const fechaApertura = caja.fecha_apertura;

      const [movs, gts, extras] = await Promise.all([
        supabase
          .from("caja_movimientos")
          .select("*")
          .eq("id_usuario", usuario.id)
          .gte("fecha", fechaApertura),
        supabase
          .from("gastos")
          .select("*")
          .eq("id_usuario", usuario.id)
          .gte("fecha", fechaApertura),
        // Cambia esto en tu promesa de cargarDatos:
        supabase
          .from("ingresos_extra")
          .select("*")
          .eq("usuario_id", usuario.id)
          .gte("fecha", fechaApertura),
      ]);

      setMovimientos(movs.data || []);
      setGastos(gts.data || []);
      setIngresosExtra(extras.data || []);
    }
  };

  const abrirCaja = async () => {
    if (!montoInicial || parseFloat(montoInicial) < 0) {
      return alert("Ingrese un monto inicial válido");
    }

    const { error } = await supabase.from("cajas").insert([
      {
        usuario_id: usuario.id,
        monto_apertura: parseFloat(montoInicial),
        estado: "abierta",
        fecha_apertura: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error al abrir caja:", error);
      alert("No se pudo abrir la caja.");
    } else {
      cargarDatos(); // Refresca los datos para que aparezca la interfaz de caja activa
    }
  };
  const cerrarCaja = async () => {
    if (!cajaActiva) return;

    const montoFinal = parseFloat(montoCierre);
    if (isNaN(montoFinal)) {
      return alert("Ingrese un monto real contado.");
    }
 if (montoFinal.toFixed(2) !== totalEnCaja.toFixed(2)) {
    return alert(
      `El monto no coincide. El total esperado es ${totalEnCaja.toFixed(2)} Bs.`
    );
  }
    const { error } = await supabase
      .from("cajas")
      .update({
        estado: "cerrada",
        monto_cierre: montoFinal,
        fecha_cierre: new Date().toISOString(),
      })
      .eq("id", cajaActiva.id);

    if (error) {
      console.error("Error al cerrar caja:", error);
      alert("No se pudo cerrar la caja.");
    } else {
      alert("Caja cerrada exitosamente.");
      setMostrarModalCierre(false);
      cargarDatos(); // Esto hará que el componente detecte que ya no hay caja abierta
    }
  };

  const totalIngresos = movimientos.reduce(
    (acc, m) => acc + (Number(m.monto_a_cuenta) || 0),
    0,
  );
  const totalIngresosExtra = ingresosExtra.reduce(
    (acc, i) => acc + Math.abs(Number(i.monto) || 0),
    0,
  );
  const totalGastos = gastos.reduce(
    (acc, g) => acc + Math.abs(Number(g.monto) || 0),
    0,
  );
  const totalEnCaja =
    Number(cajaActiva?.monto_apertura || 0) +
    totalIngresos +
    totalIngresosExtra -
    totalGastos;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {!cajaActiva ? (
          <div className="p-10 text-center space-y-6">
            <h2 className="text-3xl font-black text-slate-800">
              Apertura de Turno
            </h2>
            <input
              type="number"
              className="w-full p-6 text-2xl font-bold bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none"
              placeholder="Monto inicial"
              onChange={(e) => setMontoInicial(e.target.value)}
            />
            <button
              onClick={abrirCaja}
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-lg"
            >
              COMENZAR TURNO
            </button>
          </div>
        ) : (
          <div className="flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  Control de Caja Activa
                </h2>
                <p className="text-xs font-bold text-slate-400">
                  OPERADOR: {usuario.nombre || "admin"}
                </p>
              </div>

              {/* Contenedor de botones con flex y gap para el espacio */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    generarReporteCaja(
                      usuario,
                      movimientos,
                      gastos,
                     ingresosExtra, 
                     Number(cajaActiva.monto_apertura),
      totalIngresos, // 5to argumento
      totalGastos,   // 6to argumento
      totalEnCaja
                    )
                  }
                  className="bg-emerald-800 text-white px-4 py-3 rounded-xl font-black uppercase text-[10px]"
                >
                  Descargar PDF
                </button>

                <button
                  onClick={() => setMostrarGasto(!mostrarGasto)}
                  className="bg-rose-100 text-rose-600 px-4 py-3 rounded-xl font-black uppercase text-[10px]"
                >
                  ingresar Gastos
                </button>

                <button
                  onClick={() => setMostrarModalCierre(true)}
                  className="bg-rose-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px]"
                >
                  Cerrar Caja
                </button>
              </div>

              {/* Título que solo aparece al imprimir */}
              <div className="hidden print:block p-8 text-center">
                <h1 className="text-2xl font-black uppercase">
                  Reporte de Caja - {usuario.nombre}
                </h1>
                <p>Fecha: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            {mostrarGasto && (
              <div className="px-8">
                <FormularioGasto
                  usuario={usuario}
                  onGuardar={() => {
                    setMostrarGasto(false);
                    cargarDatos();
                  }}
                  onCancel={() => setMostrarGasto(false)}
                />
              </div>
            )}
            <div className="p-8 grid grid-cols-4 gap-4">
              <div className="bg-slate-100 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Monto Inicial
                </p>
                <p className=" text-[18px]text-2xl font-black">
                  {Number(cajaActiva.monto_apertura).toFixed(2)}Bs.
                </p>
              </div>
              <div className="bg-emerald-500 p-6 rounded-3xl text-white">
                <p className="text-[10px] font-black opacity-80 uppercase">
                  Ingresos +{" "}
                </p>
                <p className=" text-[18px]text-2xl font-black">
                  {totalIngresos.toFixed(2)}Bs.
                </p>
              </div>
              <div className="bg-red-500 p-6 rounded-3xl text-white">
                <p className="text-[10px] font-black opacity-80 uppercase">
                  egresos -{" "}
                </p>
                <p className=" text-[18px]text-2xl font-black">
                  {totalGastos.toFixed(2)}Bs.
                </p>
              </div>
              <div className="bg-blue-600 p-6 rounded-3xl text-white">
                <p className="text-[10px] font-black opacity-80 uppercase">
                  Total en Caja
                </p>
                <p className="text-[18px] text-2xl font-black">
                  {totalEnCaja.toFixed(2)}Bs.
                </p>
              </div>
            </div>

            <div className="px-8 pb-8 overflow-y-auto">
              <div className="grid grid-cols-5 gap-4 px-4 py-2 text-[10px] font-black text-slate-400 uppercase">
                <div>Cliente</div>
                {/* <div>Habitación</div> */}
                <div>obs</div>
                <div className="text-right">efectivo</div>
                <div className="text-right">qr</div>
                <div className="text-right">Monto</div>
              </div>
              <div className="space-y-3">
                {movimientos.map((m) => (
                  <div
                    key={m.id}
                    className="grid grid-cols-5 gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <p className="font-bold text-slate-800 uppercase text-xs ">
                      {m.huesped_referencia}
                    </p>
                    {/*  <p className="font-bold text-slate-400 uppercase text-xs">Hab. {m.nro_habitacion}</p> */}
                    <p className="font-bold text-slate-400 uppercase text-xs">
                      {m.observaciones}
                    </p>
                    <p className="font-bold text-slate-800 truncate text-right">
                      {m.monto_efectivo}
                    </p>
                    <p className="font-bold text-slate-400 uppercase text-right">
                      {m.monto_qr}
                    </p>
                    <p className="font-black text-emerald-600 text-right">
                      +{Number(m.monto_a_cuenta).toFixed(2)}Bs.
                    </p>
                  </div>
                ))}
                {gastos.map((g) => (
                  <div
                    key={g.id}
                    className="grid grid-cols-5 gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <p className="font-bold text-slate-800 uppercase text-xs ">
                      {g.huesped_referencia || "-"}
                    </p>
                    {/*  <p className="font-bold text-slate-400 uppercase text-xs">Hab. {m.nro_habitacion}</p> */}
                    <p className="font-bold text-slate-400 uppercase text-xs">
                      gasto : {g.descripcion}
                    </p>
                    {/* Si es efectivo, lo mostramos en la columna de efectivo */}
                    <p className="font-bold text-slate-800 text-right">
                      {g.tipo_pago === "efectivo"
                        ? Number(g.monto).toFixed(2)
                        : "-"}
                    </p>

                    {/* Si es QR, lo mostramos en la columna de QR */}
                    <p className="font-bold text-slate-400 text-right">
                      {g.tipo_pago === "qr" ? Number(g.monto).toFixed(2) : "-"}
                    </p>
                    <p className="font-black text-red-600 text-right">
                      -{Number(g.monto).toFixed(2)}Bs.
                    </p>
                  </div>
                ))}
                {/* Reemplaza tu bloque actual de ingresosExtra.map con este: */}
                {ingresosExtra.map((i) => (
                  <div
                    key={i.id}
                    className="grid grid-cols-5 gap-4 items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100"
                  >
                    <p className="font-bold text-slate-800 uppercase text-xs">
                      Extra: {i.descripcion}
                    </p>
                    <p className="font-bold text-emerald-400 uppercase text-xs">
                      {i.categoria}
                    </p>

                    {/* Columna Efectivo: Muestra el monto solo si el tipo_pago es 'efectivo' */}
                    <p className="font-bold text-slate-800 text-right">
                      {i.tipo_pago === "efectivo"
                        ? Number(i.monto).toFixed(2)
                        : "-"}
                    </p>

                    {/* Columna QR: Muestra el monto solo si el tipo_pago es 'qr' */}
                    <p className="font-bold text-slate-400 text-right">
                      {i.tipo_pago === "qr" ? Number(i.monto).toFixed(2) : "-"}
                    </p>

                    {/* Total del ingreso (siempre positivo) */}
                    <p className="font-black text-emerald-600 text-right">
                      +{Number(i.monto).toFixed(2)}Bs.
                    </p>
                  </div>
                ))}
              </div>
              {/*<button onClick={imprimirReportePDF} className="mt-6 w-full py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Descargar Reporte PDF</button> */}
            </div>
          </div>
        )}
      </div>

      {mostrarModalCierre && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-[60]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm">
            <h2 className="text-xl font-black uppercase mb-4">
              Confirmar Cierre
            </h2>
            <input
              type="number"
              placeholder="Monto real contado"
              className="w-full p-4 bg-slate-100 rounded-2xl font-black mb-4"
              onChange={(e) => setMontoCierre(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarModalCierre(false)}
                className="flex-1 py-4 font-bold text-slate-500"
              >
                Cancelar
              </button>
              <button
                onClick={cerrarCaja}
                className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
