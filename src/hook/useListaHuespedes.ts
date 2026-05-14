'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Interfaz ajustada a tu esquema SQL (public.hospedajes y public.clientes)
interface HuespedRelacional {
  id: string;
  estado: string;
  clientes: {
    nombre: string;
    documento: string;
    profesion: string;
    celular: string;
  } | null;
  hospedajes: {
    id: string;
    fecha_ingreso: string;
    hora_ingreso: string; 
    responsable: string;
    recepcionista: string;
    habitaciones: {
      numero: string;
    } | null;
  } | null;
}

export function useListaHuespedes() {
  const [huespedes, setHuespedes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  // Función interna para formatear la hora (HH:mm:ss -> 12h AM/PM)
  const formatearHoraBolivia = (horaDB: string) => {
    if (!horaDB) return 'S/H';
    const [horas, minutos] = horaDB.split(':');
    const hInt = parseInt(horas);
    const ampm = hInt >= 12 ? 'P. M.' : 'A. M.';
    const h12 = hInt % 12 || 12;
    return `${h12}:${minutos} ${ampm}`;
  };

  const obtenerHuespedesActivos = async () => {
    try {
      setCargando(true)
      
      const { data, error } = await supabase
        .from('detalle_hospedaje_huespedes')
        .select(`
          id,
          estado,
          clientes ( nombre, documento, profesion, celular ),
          hospedajes!inner (
            id,
            fecha_ingreso,
            hora_ingreso,
            responsable,
            recepcionista,
            habitaciones!inner ( numero )
          )
        `)
        .eq('estado', 'activo')

      if (error) throw error

      if (data) {
        const datosTyped = data as unknown as HuespedRelacional[];

        // Transformación de datos para el Frontend
        const formateados = datosTyped.map(item => ({
          ...item,
          // 1. Prioridad: Usa 'responsable' de la tabla hospedajes
          responsable_nombre: item.hospedajes?.responsable || item.hospedajes?.recepcionista || 'S/N',
          
          // 2. Extrae el número de habitación
          habitacion_nro: item.hospedajes?.habitaciones?.numero || '??',
          
          // 3. Formatea la hora para evitar desfases de zona horaria
          hora_display: formatearHoraBolivia(item.hospedajes?.hora_ingreso || '')
        }));
        
        setHuespedes(formateados)
      }
    } catch (error: any) {
      console.error("Error en useListaHuespedes:", error.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    obtenerHuespedesActivos()
  }, [])

  return { huespedes, cargando, refrescar: obtenerHuespedesActivos }
}