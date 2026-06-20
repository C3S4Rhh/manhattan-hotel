"use client";
import { useState } from "react";
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
import { PanelCaja } from "@/components/PanelCaja"; // <-- Importamos el nuevo módulo de caja
import { HistorialCajas } from "@/components/HistorialCajas";
import { CajaChica } from "@/components/CajaChica";
import { PanelRegistrosHoy } from "@/components/PanelRegistrosHoy"; // <-- Nuevo import
import { GestionEgresos } from "@/components/GestionEgresos";

export default function Home() {
  // Agregamos 'caja' a los tipos de vista permitidos en el estado
  // En Home.tsx, cambia el tipo del estado a:
  const [vista, setVista] = useState<
    | "mapa"
    | "config"
    | "clientes"
    | "caja"
    | "datos"
    | "historial"
    | "cajachica"
    | "registros"
    | "egresos"
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

  // Hook para huéspedes con estancia activa (usado para el contador)
  const { huespedes } = useListaHuespedes();

  // Hook para TODOS los clientes de la base de datos (usado para la tabla histórica)
  const { todosLosClientes, refrescar: refrescarClientes } =
    useClientesGlobal();

  if (loading) return <div className="bg-slate-900 min-h-screen" />;
  if (!usuarioActivo) return <Login onLoginSuccess={setUsuarioActivo} />;

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Le pasamos onCajaClick a la cabecera. Al presionarse, 
        cambiará el estado interno a la vista del control de turnos 
      */}
      <Navbar
        usuario={usuarioActivo}
        onEgresosClick={() => setVista("egresos")}
        onCajaClick={() => setVista("caja")}
        onDatosClick={() => setVista("datos")}
        onHistorialClick={() => setVista("historial")}
        onCajaChicaClick={() => setVista("cajachica")}
      />

      <div className="p-8">
        {/* 1. VISTA PRINCIPAL: MAPA */}
        {vista === "mapa" && (
          <>
            <DashboardHeader
              verHuespedes={verHuespedes}
              setVerHuespedes={setVerHuespedes}
              soloOcupadas={soloOcupadas}
              setSoloOcupadas={setSoloOcupadas}
              usuarioNombre={usuarioActivo.nombre}
              cantidadHuespedes={huespedes.length}
              onConfigClick={() => setVista("config")}
              onClientesClick={() => {
                refrescarClientes();
                setVista("clientes");
              }}
              onRegistrosClick={() => setVista("registros")}
            />

            <div className="flex gap-6">
              {!verHuespedes ? (
                <div className="grid grid-cols-6 gap-4 flex-1">
                  {habitacionesFiltradas.map((hab) => (
                    <HabitacionCard
                      key={hab.id}
                      hab={hab}
                      onSelect={manejarSeleccion}
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

            {/* Mensaje de vacío solo en modo mapa */}
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
        {/* 3. VISTA: REGISTRO DE CLIENTES */}
        {vista === "clientes" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("mapa")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Mapa de Habitaciones
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
            <HistorialCajas />{" "}
            {/* Asegúrate de que este componente esté importado */}
          </div>
        )}

        {/* 4. VISTA: CONTROL DE CAJA Y TURNOS */}
        {vista === "caja" && (
          <div className="space-y-4">
            <button
              onClick={() => setVista("mapa")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Mapa de Habitaciones
            </button>
            {/* Renderizamos el panel pasándole el usuario logueado en tiempo real */}
            <PanelCaja usuario={usuarioActivo} />
          </div>
        )}
        {/* 6. VISTA: GESTIÓN DE EGRESOS */}
        {vista === "egresos" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <button
              onClick={() => setVista("mapa")}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Mapa de Habitaciones
            </button>
            <GestionEgresos />
          </div>
        )}
        {/* 5. VISTA: CAJA CHICA */}
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
          }}
        />
      )}
    </main>
  );
}
