'use client'
import { useEffect, useState } from 'react'
import { authService } from '@/services/auth'
import { habitacionesService } from '@/services/habitaciones'

export function useDashboard() {
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [usuarioActivo, setUsuarioActivo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [mostrarModalIn, setMostrarModalIn] = useState(false)
  const [mostrarModalOut, setMostrarModalOut] = useState(false)
  const [habSeleccionada, setHabSeleccionada] = useState<any>(null)
  const [soloOcupadas, setSoloOcupadas] = useState(false)
  const [verHuespedes, setVerHuespedes] = useState(false)

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
      console.error("Error al cargar habitaciones:", error)
    }
  }

  const manejarSeleccion = (hab: any) => {
    setHabSeleccionada(hab)
    if (hab.estado_actual === 'L') {
      setMostrarModalIn(true)
    } else {
      setMostrarModalOut(true)
    }
  }

  const habitacionesFiltradas = soloOcupadas 
    ? habitaciones.filter(h => h.estado_actual === 'O')
    : habitaciones

  return {
    habitaciones,
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
    cargarHabitaciones
  }
}