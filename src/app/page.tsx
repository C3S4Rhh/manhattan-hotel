'use client'
import { useDashboard } from '@/hook/useDashboard'
import { useListaHuespedes } from '@/hook/useListaHuespedes'
import { Navbar } from '@/components/Navbar'
import { Login } from '@/components/Login'
import { HabitacionCard } from '@/components/HabitacionCard'
import { DashboardHeader } from '@/components/DashboardHeader'
import { PanelHuespedesActivos } from '@/components/PanelHuespedesActivos'
import { CheckInModal } from '@/components/CheckInModal'
import { CheckOutModal } from '@/components/CheckOutModal'

export default function Home() {
  const {
    habitacionesFiltradas, usuarioActivo, loading, setUsuarioActivo,
    mostrarModalIn, setMostrarModalIn, mostrarModalOut, setMostrarModalOut,
    habSeleccionada, soloOcupadas, setSoloOcupadas, verHuespedes, setVerHuespedes,
    manejarSeleccion, cargarHabitaciones
  } = useDashboard()

  const { huespedes } = useListaHuespedes()

  if (loading) return <div className="bg-slate-900 min-h-screen" />
  if (!usuarioActivo) return <Login onLoginSuccess={setUsuarioActivo} />

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar usuario={usuarioActivo} />
      
      <div className="p-8">
        <DashboardHeader 
          verHuespedes={verHuespedes}
          setVerHuespedes={setVerHuespedes}
          soloOcupadas={soloOcupadas}
          setSoloOcupadas={setSoloOcupadas}
          usuarioNombre={usuarioActivo.nombre}
          cantidadHuespedes={huespedes.length}
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
        
        {!verHuespedes && soloOcupadas && habitacionesFiltradas.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
            No hay habitaciones ocupadas en este momento.
          </div>
        )}
      </div>

      {mostrarModalIn && (
        <CheckInModal 
          hab={habSeleccionada} usuario={usuarioActivo}
          onClose={() => setMostrarModalIn(false)}
          onSuccess={() => { setMostrarModalIn(false); cargarHabitaciones(); }}
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