"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function EstadoEstancias({
  hab,
  usuario,
  onClose,
  onSuccess,
}: {
  hab: any;
  usuario: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [cargando, setCargando] = useState(true);
  const [registro, setRegistro] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [historialDias, setHistorialDias] = useState<any[]>([]);

  const displayResponsable =
    usuario?.nombre || usuario?.user_metadata?.nombre || "admin";

  useEffect(() => {
    cargarDetallesHospedaje();
  }, [hab?.id]);

  const cargarDetallesHospedaje = async () => {
    setCargando(true);
    try {
      // 1. Obtener el hospedaje activo de la habitación usando id_habitacion
      const { data: hospedajeData, error: hospError } = await supabase
        .from("hospedajes")
        .select(`
          *,
          medios_dias_extra,
          descuento_monto,
          observaciones,
          fecha_ingreso,
          cantidad_dias
        `)
        .eq("id_habitacion", hab.id)
        .eq("estado", "activo")
        .maybeSingle();

      if (hospError) throw hospError;

      if (hospedajeData) {
        setRegistro(hospedajeData);

        // 2. Obtener clientes asociados mediante detalle_hospedaje_huespedes
        const { data: detallesHuespedes } = await supabase
          .from("detalle_hospedaje_huespedes")
          .select(`
            id,
            estado,
            fecha_salida_individual,
            created_at,
            clientes (
              nombre,
              documento
            )
          `)
          .eq("id_hospedaje", hospedajeData.id);

        if (detallesHuespedes) {
          setClientes(detallesHuespedes);
        }

        // 3. Cálculo de días: cantidad_dias base + días extra (medios_dias_extra o dias_extra)
        const fechaIngresoBase = hospedajeData.fecha_ingreso 
          ? new Date(hospedajeData.fecha_ingreso) 
          : new Date();

        const diasBase = Number(hospedajeData.cantidad_dias || 1);
        const diasExtra = Number(hospedajeData.medios_dias_extra || hospedajeData.dias_extra || 0);
        const totalDias = diasBase + diasExtra;
        
        // Precio unitario por día basado en el precio acordado total y la cantidad de días base
        const precioAcordadoTotal = Number(hospedajeData.precio_acordado || hab?.precio_base || 150);
        const precioUnitarioDia = diasBase > 0 ? precioAcordadoTotal / diasBase : precioAcordadoTotal;

        // Descuento total aplicado que se distribuirá o restará en los saldos diarios
        let descuentoRestante = Number(hospedajeData.descuento_monto || 0);
        let montoACuentaRestante = Number(hospedajeData.a_cuenta || 0);

        const filasGeneradas = Array.from({ length: totalDias }, (_, index) => {
          const fechaDia = new Date(fechaIngresoBase);
          fechaDia.setDate(fechaIngresoBase.getDate() + index);

          // Aplicar adelanto (a cuenta) día por día
          let pagadoEsteDia = 0;
          if (montoACuentaRestante > 0) {
            pagadoEsteDia = Math.min(montoACuentaRestante, precioUnitarioDia);
            montoACuentaRestante -= pagadoEsteDia;
          }

          // Aplicar descuento día por día hasta agotarlo
          let descuentoEsteDia = 0;
          if (descuentoRestante > 0) {
            descuentoEsteDia = Math.min(descuentoRestante, precioUnitarioDia - pagadoEsteDia);
            descuentoRestante -= descuentoEsteDia;
          }

          // Saldo total del día = Precio - Lo pagado - El descuento aplicado
          const saldoDia = precioUnitarioDia - pagadoEsteDia - descuentoEsteDia;

          return {
            id: index + 1,
            fecha: fechaDia.toISOString().split("T")[0],
            numPersonas: hospedajeData.nro_pax || 1,
            precioHabitacion: precioUnitarioDia,
            aCuenta: pagadoEsteDia,
            descuentoDia: descuentoEsteDia,
            saldoTotalDia: saldoDia > 0 ? saldoDia : 0,
            responsableCobro: hospedajeData.responsable || displayResponsable,
          };
        });

        setHistorialDias(filasGeneradas);
      } else {
        setRegistro(null);
        setClientes([]);
        setHistorialDias([]);
      }
    } catch (error) {
      console.error("Error al cargar detalles de la estancia:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función para aumentar otra fila si el cliente decide quedarse otro día
  const agregarOtroDiaEstancia = async () => {
    if (!registro) return;
    
    const diasActualesExtra = Number(registro.medios_dias_extra || registro.dias_extra || 0);
    const nuevosDiasExtra = diasActualesExtra + 1;
    const precioBaseUnitario = (Number(registro.precio_acordado) || 150) / (Number(registro.cantidad_dias) || 1);
    const nuevoPrecioAcordado = Number(registro.precio_acordado || 0) + precioBaseUnitario;

    const { error } = await supabase
      .from("hospedajes")
      .update({
        medios_dias_extra: nuevosDiasExtra,
        precio_acordado: nuevoPrecioAcordado
      })
      .eq("id", registro.id);

    if (!error) {
      cargarDetallesHospedaje();
      onSuccess();
    } else {
      alert("Error al agregar día extra: " + error.message);
    }
  };

  // Cálculo del total ya pagado sumando la columna 'aCuenta' de todas las filas del historial
  const totalYaPagado = historialDias.reduce((acc, curr) => acc + Number(curr.aCuenta || 0), 0);

  if (cargando) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl text-center">
          <p className="font-bold text-slate-500 uppercase text-xs">Cargando estado de la estancia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header con diseño original en slate-950 */}
        <div className="bg-slate-950 p-6 text-white shrink-0 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">
              Estado de Estancias
            </p>
            <h2 className="text-2xl font-black italic">
              HABITACIÓN #{hab?.numero}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 space-y-6 overflow-y-auto">

          {/* Bloque 1: Detalles de Check-In y Check-Out */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Detalles Check-In */}
            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                📥 Detalles de Check-In
              </span>
              <div className="text-xs space-y-1 text-slate-700 font-medium">
                {clientes.length > 0 ? (
                  clientes.map((c, i) => {
                    const horaRegistro = c.created_at 
                      ? new Date(c.created_at).toLocaleTimeString("es-BO", { hour: '2-digit', minute: '2-digit', hour12: true })
                      : (registro?.fecha_ingreso ? new Date(registro.fecha_ingreso).toLocaleTimeString("es-BO", { hour: '2-digit', minute: '2-digit', hour12: true }) : "-");
                    
                    return (
                      <div key={c.id || i} className={i > 0 ? "mt-2 pt-2 border-t border-emerald-200/50" : ""}>
                        <p><strong className="text-slate-900">Nombre:</strong> {c.clientes?.nombre || "Sin registrar"}</p>
                        <p><strong className="text-slate-900">Doc:</strong> {c.clientes?.documento || "S/N"}</p>
                        <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                          🕒 Hora de registro: {horaRegistro}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div>
                    <p><strong className="text-slate-900">Nombres:</strong> {registro?.nombre_huesped || "Sin registrar"}</p>
                    <p><strong className="text-slate-900">Fecha y Hora:</strong> {registro?.fecha_ingreso ? new Date(registro.fecha_ingreso).toLocaleString("es-BO", { hour12: true }) : "-"}</p>
                  </div>
                )}
                <p className="pt-1"><strong className="text-slate-900">Responsable Ingreso:</strong> {registro?.responsable || displayResponsable}</p>
              </div>
            </div>

            {/* Detalles Check-Out */}
            <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider block">
                📤 Detalles de Check-Out
              </span>
              <div className="text-xs space-y-1 text-slate-700 font-medium">
                <p><strong className="text-slate-900">Estado Estancia:</strong> {registro?.estado || "activo"}</p>
                <p><strong className="text-slate-900">Fecha/Hora Salida:</strong> {registro?.fecha_salida ? new Date(registro.fecha_salida).toLocaleString("es-BO", { hour12: true }) : "En curso"}</p>
                <p><strong className="text-slate-900">Responsable Salida:</strong> {registro?.responsable_salida || "Pendiente de cierre"}</p>
              </div>
            </div>

          </div>

          {/* Bloque 1.5: Descuento / Adelanto Registrado y Total Ya Pagado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {registro?.descuento_monto > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                    💡 Descuento / Adelanto Registrado
                  </span>
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    {registro?.observaciones || "Descuento aplicado correctamente a las cuotas diarias."}
                  </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-sm text-right mt-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Descuento Aplicado</span>
                  <span className="text-sm font-black text-amber-600">Bs. {registro?.descuento_monto}</span>
                </div>
              </div>
            )}

            <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl flex flex-col justify-between sm:col-span-1">
              <div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                  💵 Total Ya Pagado (Adelantos / A Cuenta)
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  Suma total acumulada de los montos cubiertos en las cuotas diarias.
                </p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-sm text-right mt-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Pagado</span>
                <span className="text-sm font-black text-emerald-600">Bs. {totalYaPagado.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Bloque 2: Tabla de Control Diario y Saldos */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Seguimiento de Días y Pagos
              </h3>
              {/*<button
                type="button"
                onClick={agregarOtroDiaEstancia}
                className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md"
              >
                + Quedarse otro día
              </button>*/}
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Fecha</th>
                    <th className="p-3 text-center">Nº Personas</th>
                    <th className="p-3 text-right">Precio Hab.</th>
                    <th className="p-3 text-right">A Cuenta</th>
                    <th className="p-3 text-right">Saldo Total</th>
                    <th className="p-3">Responsable Cobro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {historialDias.map((fila, index) => (
                    <tr key={fila.id || index} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold">{fila.fecha}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{fila.numPersonas} Pax</td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={fila.precioHabitacion}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...historialDias];
                            updated[index].precioHabitacion = val;
                            updated[index].saldoTotalDia = Math.max(0, val - updated[index].aCuenta - updated[index].descuentoDia);
                            setHistorialDias(updated);
                          }}
                          className="w-20 p-1 border rounded text-right font-bold text-xs"
                        />
                      </td>
                      <td className="p-3 text-right text-emerald-600 font-bold">
                        {fila.aCuenta > 0 ? `${fila.aCuenta.toFixed(2)} Bs.` : "-"}
                      </td>
                      <td className={`p-3 text-right font-black ${fila.saldoTotalDia > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                        {fila.saldoTotalDia > 0 ? `${fila.saldoTotalDia.toFixed(2)} Bs.` : "Pagado (0.00 Bs.)"}
                      </td>
                      <td className="p-3 text-[10px] text-slate-500">{fila.responsableCobro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-xl uppercase text-xs hover:bg-slate-300 transition-all"
          >
            Cerrar Vista
          </button>
        </div>

      </div>
    </div>
  );
}
