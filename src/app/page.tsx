'use client'
import { useEffect, useState } from 'react'
import { authService } from '@/services/auth'
import { habitacionesService } from '@/services/habitaciones'
import { HabitacionCard } from '@/components/HabitacionCard'
import { Navbar } from '@/components/Navbar'
import { Login } from '@/components/Login'
import { CheckInModal } from '@/components/CheckInModal'

export default function Home() {
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [usuarioActivo, setUsuarioActivo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [mostrarModal, setMostrarModal] = useState(false)
  const [habSeleccionada, setHabSeleccionada] = useState<any>(null)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user) setUsuarioActivo(user)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (usuarioActivo) cargarHabitaciones()
  }, [usuarioActivo])

  const cargarHabitaciones = async () => {
    try {
      const data = await habitacionesService.getAll()
      setHabitaciones(data || [])
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const manejarSeleccion = (hab: any) => {
    if (hab.estado_actual === 'L') {
      setHabSeleccionada(hab)
      setMostrarModal(true)
    } else {
      alert("Habitación ocupada")
    }
  }

  if (loading) return <div className="bg-slate-900 min-h-screen" />
  if (!usuarioActivo) return <Login onLoginSuccess={setUsuarioActivo} />

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar usuario={usuarioActivo} />
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Estado de Habitaciones
          </h1>
          <div className="flex gap-4 text-[10px] font-bold uppercase">
             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-full" /> Libre</span>
             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded-full" /> Ocupada</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {habitaciones.map(hab => (
            <HabitacionCard 
              key={hab.id} 
              hab={hab} 
              onSelect={manejarSeleccion} 
            />
          ))}
        </div>
      </div>

      {mostrarModal && (
        <CheckInModal 
          hab={habSeleccionada}
          usuario={usuarioActivo}
          onClose={() => setMostrarModal(false)}
          onSuccess={() => {
            setMostrarModal(false)
            cargarHabitaciones()
          }}
        />
      )}
    </main>
  )
}