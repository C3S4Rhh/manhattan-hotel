"use client";

import { useState, useEffect } from "react";
import { registrarReservaConAdelanto } from "@/services/reservaService";
import { supabase } from "@/lib/supabase";

export function FormularioReserva({ onBack }: { onBack: () => void }) {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [todasLasReservas, setTodasLasReservas] = useState<any[]>([]);
  const [hospedajesActivos, setHospedajesActivos] = useState<any[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<string>("Administrador");

  const [formData, setFormData] = useState({
    huesped_nombre: "",
    huesped_telefono: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    hora_llegada: "14:00",
    ids_habitaciones: [] as string[],
    monto_adelanto: 0,
    tipo_pago: "efectivo",
  });

  const cargarDatos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      let nombreEncontrado = "Administrador";

      if (session.user.user_metadata?.nombre) {
        nombreEncontrado = session.user.user_metadata.nombre;
      } else if (session.user.email) {
        nombreEncontrado = session.user.email;
      }

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nombre")
        .eq("id", session.user.id)
        .single();

      if (perfil?.nombre) {
        nombreEncontrado = perfil.nombre;
      }

      setUsuarioActual(nombreEncontrado);
    }

    const { data: habs } = await supabase
      .from("habitaciones")
      .select("*")
      .order("numero");
    setHabitaciones(habs || []);
    
    const { data: res } = await supabase
      .from("reservas")
      .select("*, habitaciones(id, numero)")
      .neq("estado", "cancelada");
    setTodasLasReservas(res || []);

    const { data: hosp } = await supabase
      .from("hospedajes")
      .select("*, habitaciones(id, numero)")
      .eq("estado", "activo");
    setHospedajesActivos(hosp || []);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cancelarReserva = async (reservaId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reservas")
        .update({ estado: "cancelada" })
        .eq("id", reservaId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("No se pudo actualizar. Verifica las políticas RLS de Supabase para la tabla reservas.");
        return;
      }

      alert("Reserva cancelada exitosamente.");
      await cargarDatos();
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      alert("Hubo un error al intentar cancelar la reserva.");
    }
  };

  const getEstadoHabitacion = (hab: any) => {
    const fechaSeleccionada = new Date(formData.fecha_inicio + "T00:00:00");

    if (hab.estado_actual === "admin" || hab.estado_actual === "alquiler")
      return {
        color: "bg-orange-500",
        label: hab.estado_actual.toUpperCase(),
        disponible: false,
      };

    const hosp = hospedajesActivos.find((h) => h.id_habitacion === hab.id);
    if (hosp) {
      const ingreso = new Date(hosp.fecha_ingreso);
      const salida = new Date(ingreso);
      salida.setDate(ingreso.getDate() + (hosp.cantidad_dias || 1));
      if (fechaSeleccionada >= ingreso && fechaSeleccionada < salida)
        return { color: "bg-red-500", label: "OCUPADO", disponible: false };
    }

    const reserva = todasLasReservas.find(
      (r) =>
        r.id_habitacion === hab.id &&
        fechaSeleccionada >= new Date(r.fecha_inicio + "T00:00:00") &&
        fechaSeleccionada <= new Date(r.fecha_fin + "T00:00:00"),
    );
    if (reserva)
      return { color: "bg-violet-500", label: "RESERVADO", disponible: false };

    return { color: "bg-green-500", label: "LIBRE", disponible: true };
  };

  const toggleSeleccionarHabitacion = (hab: any) => {
    const estado = getEstadoHabitacion(hab);
    if (!estado.disponible) {
      alert("Esta habitación no está disponible para reserva.");
      return;
    }

    setFormData((prev) => {
      const yaSeleccionada = prev.ids_habitaciones.includes(hab.id);
      if (yaSeleccionada) {
        return {
          ...prev,
          ids_habitaciones: prev.ids_habitaciones.filter((id) => id !== hab.id),
        };
      } else {
        return {
          ...prev,
          ids_habitaciones: [...prev.ids_habitaciones, hab.id],
        };
      }
    });
  };

  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cargando) return;

    if (formData.ids_habitaciones.length === 0) {
      alert("Por favor, selecciona al menos una habitación.");
      return;
    }

 // Normalizar fechas limpiando las horas para evitar desfases
    const [anioInicio, mesInicio, diaInicio] = formData.fecha_inicio.split("-").map(Number);
    const [anioFin, mesFin, diaFin] = formData.fecha_fin.split("-").map(Number);

    const inicio = new Date(anioInicio, mesInicio - 1, diaInicio);
    const fin = new Date(anioFin, mesFin - 1, diaFin);

    if (inicio >= fin) {
      alert("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    // Calcular días exactos de diferencia (noches)
    const diffTime = fin.getTime() - inicio.getTime();
    const diasNoches = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Si tu hotel cobra un día extra por llegar temprano (ej. antes de las 13:00)
    const horaInt = parseInt(formData.hora_llegada.split(":")[0]) || 14;
    const dias = horaInt < 13 ? diasNoches + 1 : diasNoches;

    const horaFormateada =
      formData.hora_llegada.length === 5
        ? `${formData.hora_llegada}:00`
        : formData.hora_llegada;

    setCargando(true);
    try {
      const totalHabitaciones = formData.ids_habitaciones.length;
      const adelantoTotal = formData.monto_adelanto;

      const montoBaseEntero = Math.floor(adelantoTotal / totalHabitaciones);
      let acumuladoAdelanto = 0;

      for (let i = 0; i < totalHabitaciones; i++) {
        const idHab = formData.ids_habitaciones[i];
        const habSeleccionada = habitaciones.find((h) => h.id === idHab);
        if (!habSeleccionada) continue;

        let adelantoEstaHab = montoBaseEntero;
        if (i === totalHabitaciones - 1) {
          adelantoEstaHab = adelantoTotal - acumuladoAdelanto;
        } else {
          acumuladoAdelanto += montoBaseEntero;
        }

        const datosReservaIndividual = {
          huesped_nombre: formData.huesped_nombre,
          huesped_telefono: formData.huesped_telefono,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          hora_llegada: horaFormateada,
          id_habitacion: idHab,
          nro_habitacion: String(habSeleccionada.numero),
          responsable: usuarioActual,
        };

        await registrarReservaConAdelanto(
          datosReservaIndividual,
          adelantoEstaHab,
          formData.tipo_pago,
          habSeleccionada.precio_base,
          dias,
        );
      }

      alert("Reservas y movimientos de caja registrados exitosamente.");

      setFormData({
        huesped_nombre: "",
        huesped_telefono: "",
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: "",
        hora_llegada: "14:00",
        ids_habitaciones: [],
        monto_adelanto: 0,
        tipo_pago: "efectivo",
      });

      await cargarDatos();
    } catch (error: any) {
      console.error("Error al registrar reserva:", error);
      alert(
        "Error al procesar la reserva: " +
          (error.message || "Intenta nuevamente"),
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <button
        onClick={onBack}
        className="text-sm font-bold text-slate-400 hover:text-slate-800"
      >
        ← VOLVER
      </button>
      <h2 className="text-3xl font-black text-blue-900 uppercase text-center">
        Sistema de Reservas
      </h2>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200">
        <label className="text-blue-800 font-bold text-sm">
          FECHA DE CONSULTA:
        </label>
        <input
          type="date"
          className="w-full p-2 mt-1 border rounded-lg text-sm"
          value={formData.fecha_inicio}
          onChange={(e) =>
            setFormData({ ...formData, fecha_inicio: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-800 p-4 rounded-xl text-white grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-bold uppercase">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-violet-500 rounded"></div> Reservada
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div> Ocupada
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div> Admin / Alq
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div> Libre
            </div>
          </div>
          <div className="bg-blue-100 p-6 rounded-3xl border border-blue-400 grid grid-cols-4 md:grid-cols-6 gap-3">
            {habitaciones.map((h) => {
              const estado = getEstadoHabitacion(h);
              const estaSeleccionada = formData.ids_habitaciones.includes(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleSeleccionarHabitacion(h)}
                  className={`${estado.color} p-3 text-white rounded-xl flex flex-col items-center transition-all ${
                    estaSeleccionada
                      ? "ring-4 ring-blue-900 scale-105 shadow-lg brightness-110"
                      : "hover:scale-105"
                  }`}
                >
                  <span className="font-black text-sm">#{h.numero}</span>
                  <span className="text-[8px] bg-black/20 px-1 rounded mt-1 truncate w-full">
                    {estaSeleccionada ? "SELECCIONADA" : estado.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-blue-100 p-6 rounded-3xl border border-blue-400 shadow-lg space-y-4"
        >
          <h3 className="font-black text-slate-700 uppercase text-xs mb-2">
            Nueva Reserva ({formData.ids_habitaciones.length} hab. seleccionadas)
          </h3>
          <div className="grid grid-cols-1 gap-4 text-[14px]">
            <input
              className="p-3 border rounded-xl"
              placeholder="Huésped"
              required
              value={formData.huesped_nombre}
              onChange={(e) =>
                setFormData({ ...formData, huesped_nombre: e.target.value })
              }
            />
            <input
              className="p-3 border rounded-xl"
              placeholder="Teléfono"
              required
              value={formData.huesped_telefono}
              onChange={(e) =>
                setFormData({ ...formData, huesped_telefono: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                className="p-3 border rounded-xl"
                required
                value={formData.fecha_inicio}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_inicio: e.target.value })
                }
              />
              <input
                type="date"
                className="p-3 border rounded-xl"
                required
                value={formData.fecha_fin}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_fin: e.target.value })
                }
              />
            </div>
            <input
              type="time"
              className="p-3 border rounded-xl"
              required
              value={formData.hora_llegada}
              onChange={(e) =>
                setFormData({ ...formData, hora_llegada: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-xl"
                value={formData.tipo_pago}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_pago: e.target.value })
                }
              >
                <option value="efectivo">Pago EF.</option>
                <option value="qr">Pago QR.</option>
              </select>
              <input
                type="number"
                className="p-3 border rounded-xl"
                placeholder="Adelanto Total Bs."
                value={formData.monto_adelanto || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monto_adelanto: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={cargando}
            className={`w-full p-4 rounded-xl font-black uppercase ${
              cargando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white"
            }`}
          >
            {cargando ? "Registrando..." : "Confirmar Reservas"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl border">
        <h3 className="font-black text-slate-400 mb-4 uppercase text-xs">
          Reservas próximas
        </h3>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b border-slate-200">
              <th className="pb-3 text-left">huesped</th>
              <th className="pb-3 text-center">hab</th>
              <th className="pb-3 text-left">fecha ingreso</th>
              <th className="pb-3 text-left">fecha E.final</th>
              <th className="pb-3 text-left">hora de entrada</th>
              <th className="pb-3 text-left">Monto</th>
              <th className="pb-3 text-center">estado</th>
              <th className="pb-3 text-center">acciones</th>
            </tr>
          </thead>
          <tbody>
            {todasLasReservas.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-left font-bold">{r.huesped_nombre}</td>
                <td className="p-3 text-center">
                  Hab. {r.habitaciones?.numero}
                </td>
                <td className="p-3 text-left">{r.fecha_inicio}</td>
                <td className="p-3 text-left">{r.fecha_fin}</td>
                <td className="p-3 text-left">{r.hora_llegada}</td>
                <td className="p-3 text-left">{r.monto_adelanto}</td>
                <td className="p-3 text-center text-blue-600 uppercase font-bold text-xs">{r.estado}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => cancelarReserva(r.id)}
                    className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition-all shadow-sm"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
