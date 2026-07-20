"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCheckOut } from "@/hook/useCheckOut";
import { HuespedItem } from "./HuespedItem";
import { CambioHabitacionModal } from "./CambioHabitacionModal";
import { GuestForm } from "./GuestForm";

export function CheckOutModal({
  hab,
  onClose,
  onSuccess,
}: {
  hab: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [huespedesAdicionales, setHuespedesAdicionales] = useState<any[]>([]);
  const [datosHospedaje, setDatosHospedaje] = useState<any>(null);
  const [pagoEfectivo, setPagoEfectivo] = useState(0);
  const [pagoQR, setPagoQR] = useState(0);
  const [abiertoCambio, setAbiertoCambio] = useState(false);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<string>("");
  const [estaAtrasado, setEstaAtrasado] = useState<boolean>(false);
  const [abiertoConfirmarSalida, setAbiertoConfirmarSalida] = useState(false);
  const {
    registro,
    huespedesDetalle,
    cargando,
    procesando,
    saldoLiquidado,
    saldoFinal,
    diasExtra,
    setDiasExtra,
    descuentoMonto,
    setDescuentoMonto,
    retirarHuesped,
    realizarSalidaTotal,
    registrarPagoParcial,
  } = useCheckOut(hab, onSuccess);


  
     // inicio cronometro
useEffect(() => {
  const calcularTiempo = () => {
    if (!registro?.fecha_ingreso) return;

    // 1. Parseo manual para evitar desfase de zona horaria
    const [fechaParte, horaParte] = registro.fecha_ingreso.split("T");
    const [year, month, day] = fechaParte.split("-").map(Number);
    const [hours, minutes] = horaParte.split(":").map(Number);
    
    const fechaIngreso = new Date(year, month - 1, day, hours, minutes);
    const ahora = new Date();

    // 2. Definir salida: 13:00 del mismo día
    const fechaSalida = new Date(year, month - 1, day, 13, 0, 0);

    if (hours < 5) {
  // Entró antes de las 5am: Se cuenta el día actual. No hacemos nada, fechaSalida base es hoy a las 13:00.
} else if (hours >= 5 && hours < 13) {
  // Entró en horario de cortesía: La salida final se desplaza 1 día adicional.
  fechaSalida.setDate(fechaSalida.getDate() + 1);
} else {
  // Entró después de las 13:00: La salida base es mañana a las 13:00.
  fechaSalida.setDate(fechaSalida.getDate() + 1);
}

    // 4. Sumar días totales:
    // Se toma la cantidad contratada (si es 2, sumamos 1 día extra a la base) + días extra manuales
    const diasContratados = Number(registro?.cantidad_dias) || 1;
    const totalDiasASumar = (diasContratados - 1) + (Number(diasExtra) || 0);
    
    fechaSalida.setDate(fechaSalida.getDate() + totalDiasASumar);

    // 5. Cálculo de diferencia
    const diferencia = fechaSalida.getTime() - ahora.getTime();

    // 6. Actualización de estado
    if (diferencia <= 0) {
      setEstaAtrasado(true);
      const excedido = Math.abs(diferencia);
      const horas = Math.floor(excedido / (1000 * 60 * 60));
      const minutos = Math.floor((excedido % (1000 * 60 * 60)) / (1000 * 60));
      setTiempoRestante(`+${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`);
    } else {
      setEstaAtrasado(false);
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
      setTiempoRestante(
        `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`
      );
    }
  };

  calcularTiempo();
  const timer = setInterval(calcularTiempo, 1000);
  
  return () => clearInterval(timer);
}, [registro?.fecha_ingreso, diasExtra, registro?.cantidad_dias]); 

  //fin cronometro

  useEffect(() => {
    const guardarAjustes = async () => {
      if (!registro?.id) return;

      await supabase
        .from("hospedajes")
        .update({
          medios_dias_extra: diasExtra,
          descuento_monto: descuentoMonto,
        })
        .eq("id", registro.id);
    };

    const timer = setTimeout(guardarAjustes, 500);
    return () => clearTimeout(timer);
  }, [diasExtra, descuentoMonto, registro?.id]);

  useEffect(() => {
    if (registro) {
      setDatosHospedaje(registro);
    }
  }, [registro]);

  if (cargando) return null;

  const agregarFicha = () => {
    setHuespedesAdicionales([
      ...huespedesAdicionales,
      { nombre: "", documento: "", celular: "", profesion: "" },
    ]);
  };

  const actualizarHuespedAdicional = (
    index: number,
    campo: string,
    valor: string,
  ) => {
    const nuevos = [...huespedesAdicionales];
    nuevos[index][campo] = valor;
    setHuespedesAdicionales(nuevos);
  };

  const guardarHuespedesAdicionales = async () => {
    if (huespedesAdicionales.length === 0) return;
    setCargandoRegistro(true);

    try {
      for (const h of huespedesAdicionales) {
        const { data: clienteExistente } = await supabase
          .from("clientes")
          .select("id")
          .eq("documento", h.documento)
          .maybeSingle();

        let clienteId;

        if (clienteExistente) {
          clienteId = clienteExistente.id;
        } else {
          const { data: nuevoCliente, error: errorCliente } = await supabase
            .from("clientes")
            .insert({
              nombre: h.nombre,
              documento: h.documento,
              profesion: h.profesion || null,
              nacionalidad: h.nacionalidad || null,
              celular: h.celular || null,
              fecha_nacimiento: h.fecha_nacimiento || null,
              estado_civil: h.estado_civil || null,
            })
            .select()
            .single();

          if (errorCliente) throw errorCliente;
          clienteId = nuevoCliente.id;
        }

        const { error: errorDetalle } = await supabase
          .from("detalle_hospedaje_huespedes")
          .insert({
            id_hospedaje: registro.id,
            id_cliente: clienteId,
            estado: "activo",
          });

        if (errorDetalle) throw errorDetalle;
      }

      alert("Huéspedes registrados correctamente.");
      setHuespedesAdicionales([]);
      onSuccess();
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Hubo un error al guardar los datos.");
    } finally {
      setCargandoRegistro(false);
    }
  };

  // Agrega esto dentro de tu componente CheckOutModal

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-red-600 p-6 text-white text-center shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
            Gestión de Salida
          </p>
          <h2 className="text-3xl font-black italic">HAB. #{hab.numero}</h2>
          <button
            onClick={() => setAbiertoCambio(true)}
            className="text-[14px] font-bold text-white/100 underline mt-2 hover:text-white"
          >
            Cambiar de habitación
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
           
         <div className="grid grid-cols-3 gap-3">
  {/* Cronómetro (ocupa 2 columnas) */}
  <div
    className={`col-span-2 p-3 rounded-xl border text-center ${
      estaAtrasado ? "bg-red-50 border-red-200" : "bg-slate-900 border-slate-700"
    }`}
  >
    <p
      className={`text-[9px] font-black uppercase tracking-widest ${
        estaAtrasado ? "text-red-500" : "text-blue-400"
      }`}
    >
      {estaAtrasado ? "Tiempo excedido" : "Tiempo para Salida"}
    </p>
    <p
      className={`text-2xl font-black font-mono mt-1 ${
        estaAtrasado ? "text-red-600" : "text-white"
      }`}
    >
      {tiempoRestante}
    </p>
  </div>

  {/* Días Contratados (ocupa 1 columna) */}
  <div className="col-span-1 flex flex-col justify-center items-center bg-blue-50 border border-blue-700 rounded-xl p-2 text-center">
    <p className="text-[7px] font-black text-blue-600 uppercase">
      Días
    </p>
    <p className="text-xl font-black text-blue-700">
      {registro?.cantidad_dias || 0}
    </p>
  </div>
</div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Huéspedes en habitación
            </p>
            {huespedesDetalle.map((item) => (
              <HuespedItem
                key={item.id}
                item={item}
                fechaIngreso={registro?.fecha_ingreso}
                onRetirar={retirarHuesped}
              />
            ))}
          </div>

          {/* Sección de huéspedes adicionales */}
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase text-center">
              Huéspedes adicionales
            </p>
            {huespedesAdicionales.map((h, i) => (
              <GuestForm
                key={i}
                index={i}
                huesped={h}
                onChange={actualizarHuespedAdicional}
                onAutoCompletar={() => {}}
              />
            ))}
            {huespedesAdicionales.length > 0 && (
              <button
                type="button"
                onClick={guardarHuespedesAdicionales}
                disabled={cargandoRegistro}
                className={`w-full mt-4 bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition-all uppercase text-xs tracking-widest shadow-lg ${cargandoRegistro ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {cargandoRegistro
                  ? "Registrando..."
                  : "Registrar Huéspedes en Sistema"}
              </button>
            )}
            <button
              type="button"
              onClick={agregarFicha}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase hover:border-blue-400 hover:text-blue-400 transition-all"
            >
              + Agregar ficha de huésped
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase">
                  Dias de hospedaje extra
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={diasExtra}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => setDiasExtra(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase">
                  Descuento BS
                </label>
                <input
                  type="number"
                  value={descuentoMonto}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) =>
                    setDescuentoMonto(
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                  className="w-full p-2 rounded-lg border text-sm font-bold text-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl space-y-2 text-white">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="text-[10px] font-bold uppercase opacity-60">
                Ya pagado
              </span>
              <span className="text-md font-bold text-blue-400">
                Bs. {registro?.a_cuenta || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] font-bold uppercase opacity-60">
                Total a pagar (Final)
              </span>
              <span className="text-xl font-black text-emerald-400">
                Bs. {saldoFinal}
              </span>
            </div>
          </div>

          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
            <span className="text-[10px] font-black text-amber-700 uppercase">
              Saldo tras este pago:
            </span>
            <span
              className={`text-md font-black ${saldoFinal - (pagoEfectivo + pagoQR) > 0 ? "text-amber-600" : "text-emerald-600"}`}
            >
              Bs. {(saldoFinal - (pagoEfectivo + pagoQR)).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase text-emerald-600">
                Efectivo
              </label>
              <input
                type="number"
                value={pagoEfectivo}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => setPagoEfectivo(Number(e.target.value))}
                className="w-full p-2 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-sky-600">
                QR
              </label>
              <input
                type="number"
                value={pagoQR}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => setPagoQR(Number(e.target.value))}
                className="w-full p-2 border rounded-lg font-bold"
              />
            </div>
          </div>

          <button
            onClick={() => registrarPagoParcial(pagoEfectivo, pagoQR)}
            className="bg-blue-600 text-white font-black py-3 rounded-lg w-full"
          >
            Registrar Pago (Abono)
          </button>

          <div className="grid gap-3 pt-2">
            <button
              onClick={() => setAbiertoConfirmarSalida(true)}
              disabled={saldoFinal - (pagoEfectivo + pagoQR) > 0 || procesando}
              className={`font-black py-4 rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest ${
                saldoFinal - (pagoEfectivo + pagoQR) <= 0
                  ? "bg-emerald-600 text-white hover:scale-[1.02]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {procesando ? "Procesando..." : "Finalizar Estancia Total"}
            </button>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 font-bold text-[10px] uppercase tracking-widest py-2 text-center"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
      {abiertoCambio && (
        <CambioHabitacionModal
          hab={hab}
          registro={registro}
          onClose={() => setAbiertoCambio(false)}
          onSuccess={onSuccess}
        />
      )}

      {abiertoConfirmarSalida && (
  <div className="fixed inset-0 bg-slate-900/50 z-[200] flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
      <h3 className="text-lg font-black text-slate-800 mb-2">¿Finalizar estancia?</h3>
      <p className="text-sm text-slate-600 mb-6">
        Esta acción marcará la habitación como disponible y finalizará el registro. ¿Estás seguro de continuar?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setAbiertoConfirmarSalida(false)}
          className="flex-1 py-2 rounded-lg bg-slate-100 font-bold text-slate-600"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            setAbiertoConfirmarSalida(false);
            realizarSalidaTotal();
          }}
          className="flex-1 py-2 rounded-lg bg-emerald-600 font-bold text-white"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
