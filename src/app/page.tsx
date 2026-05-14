'use client'
import { useState } from 'react'
import { useDashboard } from '@/hook/useDashboard'
import { useListaHuespedes } from '@/hook/useListaHuespedes'
import { useClientesGlobal } from '@/hook/useClientesGlobal' // Importamos el nuevo hook
import { Navbar } from '@/components/Navbar'
import { Login } from '@/components/Login'
import { HabitacionCard } from '@/components/HabitacionCard'
import { DashboardHeader } from '@/components/DashboardHeader'
import { PanelHuespedesActivos } from '@/components/PanelHuespedesActivos'
import { CheckInModal } from '@/components/CheckInModal'
import { CheckOutModal } from '@/components/CheckOutModal'
import { DirectorioHabitaciones } from '@/components/DirectorioHabitaciones'
import { ListaClientesRegistrados } from '@/components/ListaClientesRegistrados'

export default function Home() {
  const [vista, setVista] = useState<'mapa' | 'config' | 'clientes'>('mapa');
  
  const {
    habitacionesFiltradas, usuarioActivo, loading, setUsuarioActivo,
    mostrarModalIn, setMostrarModalIn, mostrarModalOut, setMostrarModalOut,
    habSeleccionada, soloOcupadas, setSoloOcupadas, verHuespedes, setVerHuespedes,
    manejarSeleccion, cargarHabitaciones, habitaciones 
  } = useDashboard()

  // Hook para huéspedes con estancia activa (usado para el contador)
  const { huespedes } = useListaHuespedes()
  
  // Hook para TODOS los clientes de la base de datos (usado para la tabla histórica)
  const { todosLosClientes, refrescar: refrescarClientes } = useClientesGlobal()

  if (loading) return <div className="bg-slate-900 min-h-screen" />
  if (!usuarioActivo) return <Login onLoginSuccess={setUsuarioActivo} />

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar usuario={usuarioActivo} />
      
      <div className="p-8">
        
        {/* 1. VISTA PRINCIPAL: MAPA */}
        {vista === 'mapa' && (
          <>
            <DashboardHeader 
              verHuespedes={verHuespedes}
              setVerHuespedes={setVerHuespedes}
              soloOcupadas={soloOcupadas}
              setSoloOcupadas={setSoloOcupadas}
              usuarioNombre={usuarioActivo.nombre}
              cantidadHuespedes={huespedes.length} // Mantiene el conteo de activos
              onConfigClick={() => setVista('config')}
              onClientesClick={() => {
                refrescarClientes(); // Refresca la lista global antes de cambiar de vista
                setVista('clientes');
              }}
            />

            <div className="flex gap-6">
              {!verHuespedes ? (
                <div className="grid grid-cols-6 gap-4 flex-1">
                  {habitacionesFiltradas.map(hab => (
                    <HabitacionCard key={hab.id} hab={hab} onSelect={manejarSeleccion} />
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
            {!verHuespedes && soloOcupadas && habitacionesFiltradas.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                No hay habitaciones ocupadas en este momento.
              </div>
            )}
          </>
        )}

        {/* 2. VISTA: CONFIGURACIÓN DE HABITACIONES */}
        {vista === 'config' && (
          <div className="space-y-4">
            <button 
              onClick={() => setVista('mapa')}
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

        {/* 3. VISTA: REGISTRO DE CLIENTES (CORREGIDA) */}
        {vista === 'clientes' && (
          <div className="space-y-4">
            <button 
              onClick={() => setVista('mapa')}
              className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] hover:text-slate-800 transition-colors"
            >
              ← Volver al Mapa de Habitaciones
            </button>
            {/* Pasamos todosLosClientes en lugar de huespedes para ver los datos de Supabase */}
            <ListaClientesRegistrados clientes={todosLosClientes} />
          </div>
        )}

      </div>

      {/* Modales */}
      {mostrarModalIn && (
        <CheckInModal 
          hab={habSeleccionada} usuario={usuarioActivo}
          onClose={() => setMostrarModalIn(false)}
          onSuccess={() => { 
            setMostrarModalIn(false); 
            cargarHabitaciones(); 
            refrescarClientes(); // Actualiza la lista si se crea un cliente nuevo
          }}
        />
      )}
      {mostrarModalOut && (
        <CheckOutModal 
          hab={habSeleccionada}
          onClose={() => setMostrarModalOut(false)}
          onSuccess={() => { setMostrarModalOut(false); cargarHabitaciones(); }}
        />
      )}
    </main>
  )
}