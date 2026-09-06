"use client";
import { useState, useEffect } from "react";
import { useDashboard } from "@/hook/useDashboard";
import { useListaHuespedes } from "@/hook/useListaHuespedes";
import { useClientesGlobal } from "@/hook/useClientesGlobal";
import { Navbar } from "@/components/Navbar";
import { Login } from "@/components/Login";
import { HabitacionCard } from "@/components/HabitacionCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PanelHuespedesActivos } from "@/components/PanelHuespedesActivos";
import { CheckInModal } from "@/components/CheckInModal";
import { CheckOutModal } from "@/components/CheckOutModal";
import { DirectorioHabitaciones } from "@/components/DirectorioHabitaciones";
import { ListaClientesRegistrados } from "@/components/ListaClientesRegistrados";
import { ReportesFinancieros } from "@/components/ReportesFinancieros";
import { PanelCaja } from "@/components/PanelCaja";
import { HistorialCajas } from "@/components/HistorialCajas";
import { CajaChica } from "@/components/CajaChica";
import { PanelRegistrosHoy } from "@/components/PanelRegistrosHoy";
import { GestionEgresos } from "@/components/GestionEgresos";
import { VistaFinanzas } from "@/components/VistaFinanzas";
import { GestionIngresos } from "@/components/GestionIngresos";
import { GestionIngresosHabitaciones } from "@/components/GestionIngresosHabitaciones";
import { VistaReservas } from "@/components/VistaReservas";
import { VistaCentroHistorial } from "@/components/VistaCentroHistorial";
import HistorialHospedajes from "@/components/HistorialHospedajes";
import { supabase } from "@/lib/supabase";
import { EstadoEstancias } from "@/components/EstadoEstancias";

export default function Home() {
  const [vista, setVista] = useState<
    | "mapa"
    | "config"
    | "clientes"
    | "caja"
    | "datos"
    | "historial"
    | "centrohistorial"
    | "historialhospedajes"
    | "cajachica"
    | "registros"
    | "finanzas"
    | "egresos"
    | "ingresos"
    | "ingresoshabitaciones"
    | "reservas"
    | "estadoestancias"
  >("mapa");

  const {
    habitacionesFiltradas,
    usuarioActivo,
    loading,
    setUsuarioActivo,
    mostrarModalIn,
    setMostrarModalIn,
    mostrarModalOut,
    setMostrarModalOut,
    habSeleccionada,
    soloOcupadas,
    setSoloOcupadas,
    verHuespedes,
    setVerHuespedes,
    manejarSeleccion,
    cargarHabitaciones,
    habitaciones,
  } = useDashboard();
  const [refresh, setRefresh] = useState(0);
  const {
    huespedes,
    cargando,
    refrescar: refrescarHuespedes,
  } = useListaHuespedes();
  const { todosLosClientes, refrescar: refrescarClientes } =
    useClientesGlobal();

  const [cajaAbierta, setCajaAbierta] = useState(false);

  const verificarEstadoCaja = async () => {
    if (!usuarioActivo) {
      setCajaAbierta(false);
      return;
    }
    const { data } = await supabase
      .from("cajas")
      .select("*")
      .eq("usuario_id", usuarioActivo.id)
      .eq("estado", "abierta")
      .maybeSingle();

    setCajaAbierta(!!data);
  };

  useEffect(() => {
    verificarEstadoCaja();
  }, [usuarioActivo]);

  if (loading) return <div className="bg-slate-900 min-h-screen" />;
  if (!usuarioActivo)
    return (
      <Login
        onLoginSuccess={(user) => {
          setUsuarioActivo(user);
          verificarEstadoCaja();
        }}
      />
    );

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar
        usuario={usuarioActivo}
        setVista={setVista}
        onEgresosClick={() => setVista("egresos")}
        onCajaClick={() => setVista("caja")}
        onDatosClick={() => setVista("datos")}
        onHistorialClick={() => setVista("historial")}
        onCajaChicaClick={() => setVista("cajachica")}
        onCajaChange={() => verificarEstadoCaja()}
      />

      <div className="p-8">
        {/* 1. VISTA PRINCIPAL: MAPA */}
        {vista === "mapa" && (
          <>
            <DashboardHeader
              verHuespedes={verHuespedes}
              setVerHuespedes={(val) => {
                setVerHuespedes(val);
                if (val) refrescarHuespedes();
              }}
              soloOcupadas={soloOcupadas}
              setSoloOcupadas={setSoloOcupadas}
              usuarioNombre={usuarioActivo.nombre}
              cantidadHuespedes={huespedes.length}
              onConfigClick={() => setVista("config")}
              onHistorialesClick={() => setVista("centrohistorial")}
              onRegistrosClick={() => setVista("registros")}
              onReservasClick={() => setVista("reservas")}
            />

            <div className="flex gap-6">
              {!verHuespedes ? (
                <div className="grid grid-cols-6 gap-4 flex-1">
                  {habitacionesFiltradas.map((hab) => (
                    <HabitacionCard
                      key={hab.id}
                      hab={hab}
                      onSelect={(h) => {
                        if (!cajaAbierta) {
                          alert("Debes abrir caja primero");
                          return;
                        }
                        manejarSeleccion(h);
                      }}
                      cajaAbierta={cajaAbierta}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-4xl">
                    <PanelHuespedesActivos />
                  </div>
                </div>
              )}
            </div>

            {!verHuespedes &&
              soloOcupadas &&
              habitacionesFiltradas.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                  No hay habitaciones ocupadas en este momento.
                </div>
              )}
          </>
        )}

        {/* 2. VISTA: CONFIGURACIÓN DE HABITACIONES */}
        {vista === "config" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("mapa")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Mapa de Habitaciones
            </button>
            <DirectorioHabitaciones
              habitaciones={habitaciones}
              onUpdate={() => cargarHabitaciones()}
            />
          </div>
        )}

        {vista === "reservas" && (
          <div className="space-y-6">
            <button
              onClick={() => setVista("mapa")}
              className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Volver al mapa de habitaciones
            </button>
            <VistaReservas />
          </div>
        )}

        {vista === "registros" && (
          <div className="space-y-6">
            <button
              onClick={() => setVista("mapa")}
              className="text-[10px] font-black uppercase text-slate-500"
            >
              ← Volver al mapa
            </button>
            <PanelRegistrosHoy />
          </div>
        )}

        {vista === "estadoestancias" && (
          <div className="space-y-6">
            <button
              onClick={() => setVista("mapa")}
              className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Volver al mapa de habitaciones
            </button>
            <EstadoEstancias
              hab={habSeleccionada}
              usuario={usuarioActivo}
              onClose={() => setVista("mapa")}
              onSuccess={() => {
                setVista("mapa");
                cargarHabitaciones();
              }}
            />
          </div>
        )}

        {/* 3. VISTA: CENTRO DE HISTORIALES (Incluye Historial de Hospedajes y Reg. de Clientes) */}
        {vista === "centrohistorial" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("mapa")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Mapa de Habitaciones
            </button>
            <VistaCentroHistorial
              usuario={usuarioActivo}
              onSelect={(v) => {
                if (v === "clientes") refrescarClientes();
                setVista(v);
              }}
            />
          </div>
        )}

        {/* 4. VISTA: HISTORIAL DE HOSPEDAJES */}
        {vista === "historialhospedajes" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("centrohistorial")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Centro de Historiales
            </button>
            <HistorialHospedajes usuario={usuarioActivo} />{" "}
            {/* 👈 Aquí pasas el usuarioactivo */}
          </div>
        )}

        {/* 5. VISTA: REGISTRO DE CLIENTES */}
        {vista === "clientes" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("centrohistorial")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Centro de Historiales
            </button>
            <ListaClientesRegistrados clientes={todosLosClientes} />
          </div>
        )}

        {vista === "historial" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("mapa")}
              className="text-slate-500 font-black uppercase text-[10px] hover:text-slate-800"
            >
              ← Volver al Mapa de habitaciones
            </button>
            <HistorialCajas />
          </div>
        )}

        {/* 6. VISTA: CONTROL DE CAJA Y TURNOS */}
        {vista === "caja" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("mapa")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Mapa de Habitaciones
            </button>
            <PanelCaja usuario={usuarioActivo} />
          </div>
        )}

        {/* Vistas de Finanzas */}
        {vista === "finanzas" && (
          <div className="p-8">
            <button
              onClick={() => setVista("mapa")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al mapa
            </button>
            <VistaFinanzas
              usuario={usuarioActivo}
              onSelect={(v) => setVista(v)}
            />
          </div>
        )}

        {vista === "egresos" && (
          <div className="p-8">
            <button
              onClick={() => setVista("finanzas")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver a Finanzas
            </button>
            <GestionEgresos usuarioActual={usuarioActivo} />
          </div>
        )}

        {vista === "ingresos" && (
          <div className="p-8">
            <button
              onClick={() => setVista("finanzas")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors mb-4"
            >
              ← Volver a Finanzas
            </button>
            <GestionIngresos usuario={usuarioActivo} />
          </div>
        )}

        {vista === "ingresoshabitaciones" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("finanzas")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] ml-8 mt-8"
            >
              ← Volver a Finanzas
            </button>
            <GestionIngresosHabitaciones usuarioActual={usuarioActivo} />
          </div>
        )}

        {/* 7. VISTA: CAJA CHICA */}
        {vista === "cajachica" && (
          <div className="min-h-screen w-full bg-slate-50 p-6 md:p-12 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-6">
              <button
                onClick={() => setVista("mapa")}
                className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-all hover:-translate-x-1"
              >
                ← Volver al Mapa de habitaciones
              </button>
              <CajaChica usuarioActual={usuarioActivo} />
            </div>
          </div>
        )}

        {vista === "datos" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("mapa")}
              className="text-slate-500 font-black uppercase text-[10px] hover:text-slate-800"
            >
              ← Volver al Mapa de Habitaciones
            </button>
            <ReportesFinancieros />
          </div>
        )}
      </div>

      {/* Modales */}
      {mostrarModalIn && (
        <CheckInModal
          hab={habSeleccionada}
          usuario={usuarioActivo}
          clientesHistoricos={todosLosClientes}
          onClose={() => setMostrarModalIn(false)}
          onSuccess={() => {
            setMostrarModalIn(false);
            cargarHabitaciones();
            refrescarClientes();
            refrescarHuespedes();
          }}
        />
      )}
      {mostrarModalOut && (
        <CheckOutModal
          hab={habSeleccionada}
          onClose={() => setMostrarModalOut(false)}
          onSuccess={() => {
            setMostrarModalOut(false);
            cargarHabitaciones();
            refrescarHuespedes();
          }}
          onVerEstado={(h) => {
            setMostrarModalOut(false);
            setVista("estadoestancias");
          }}
        />
      )}
    </main>
  );
}
