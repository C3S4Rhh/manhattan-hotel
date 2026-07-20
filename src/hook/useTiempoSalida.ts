// hooks/useTiempoSalida.ts
import { useState, useEffect } from "react";

/**
 * Hook para calcular las horas restantes para la salida de un huésped.
 * Considera la fecha de ingreso, los días contratados y los días extra.
 */
export const useTiempoSalida = (
  fechaIngresoStr?: string, 
  cantidadDias?: number, 
  diasExtra?: number
) => {
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);

  useEffect(() => {
    if (!fechaIngresoStr) {
      setTiempoRestante(0);
      return;
    }

    const calcular = () => {
      try {
        // 1. Parsear fecha de ingreso (formato YYYY-MM-DD)
        const [fechaSolo] = fechaIngresoStr.split('T');
        const [year, month, day] = fechaSolo.split('-').map(Number);
        
        // 2. Crear fecha base de ingreso
        const fechaSalida = new Date(year, month - 1, day);
        
        // 3. Sumar días totales: base + extra
        const totalDias = (cantidadDias || 1) + (diasExtra || 0);
        fechaSalida.setDate(fechaSalida.getDate() + totalDias);
        
        // 4. Configurar hora de check-out a las 13:00
        fechaSalida.setHours(13, 0, 0, 0); 
        
        // 5. Calcular diferencia en horas respecto al momento actual
        const ahora = new Date();
        const diffMs = fechaSalida.getTime() - ahora.getTime();
        const diffHoras = diffMs / (1000 * 60 * 60);
        
        setTiempoRestante(diffHoras);
      } catch (error) {
        console.error("Error al calcular tiempo de salida:", error);
        setTiempoRestante(0);
      }
    };

    calcular();
    
    // Actualizar el cálculo cada minuto para mantener la precisión
    const interval = setInterval(calcular, 60000); 
    
    return () => clearInterval(interval);
  }, [fechaIngresoStr, cantidadDias, diasExtra]);

  return tiempoRestante;
};
