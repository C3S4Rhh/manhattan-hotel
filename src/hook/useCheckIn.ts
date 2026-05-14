/**
 * Hook de check_ins optimizado para Bolivia
 */
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useCheckIn(hab: any, usuario: any, onSuccess: () => void) {
  const [numPersonas, setNumPersonas] = useState(1);
  const [huespedes, setHuespedes] = useState([{ nombre: '', documento: '', profesion: '', celular: '' }]);
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [precioFinal, setPrecioFinal] = useState(hab?.precio_base || 0);
  const [adelanto, setAdelanto] = useState(0); 
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Ajuste de fecha local para Bolivia (UTC-4)
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset() * 60000;
    const localISOTime = new Date(ahora.getTime() - offset).toISOString().slice(0, 16);
    setFechaIngreso(localISOTime);
  }, []);

  const manejarCambioPersonas = (n: number) => {
    setNumPersonas(n);
    const nuevoArray = [...huespedes];
    if (n > huespedes.length) {
      while (nuevoArray.length < n) nuevoArray.push({ nombre: '', documento: '', profesion: '', celular: '' });
    } else {
      nuevoArray.splice(n);
    }
    setHuespedes(nuevoArray);
  };

  const actualizarHuesped = (index: number, campo: string, valor: string) => {
    const nuevosHuespedes = [...huespedes];
    nuevosHuespedes[index] = { ...nuevosHuespedes[index], [campo]: valor };
    setHuespedes(nuevosHuespedes);
  };

  const registrarIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargando) return;
    setCargando(true);
    
    // El "Cesar" del sistema si no hay usuario logueado
    const nombreResponsable = usuario?.nombre || usuario?.user_metadata?.nombre || 'Cesar';
    const saldo = Number(precioFinal) - Number(adelanto);

    try {
      // 1. Registro en tabla 'hospedajes' (Tabla Principal de Operaciones)
      const { data: hospedaje, error: errorIns } = await supabase
        .from('hospedajes')
        .insert([{
          id_habitacion: hab.id,
          id_usuario: usuario?.id,
          nombre_huesped: huespedes[0].nombre,
          nro_pax: numPersonas,
          precio_acordado: Number(precioFinal),
          a_cuenta: Number(adelanto),
          saldo_total: saldo,
          estado: 'activo',
          fecha_ingreso: fechaIngreso,
          responsable: nombreResponsable, // <--- Evita el S/N
          recepcionista: nombreResponsable, // Por compatibilidad con tu esquema
          hora_ingreso: new Date().toLocaleTimeString('en-GB') 
        }])
        .select().single();

      if (errorIns) throw errorIns;

      // 2. Registro en tabla 'check_ins' (Tabla de Auditoría/Historial)
      const { error: errorCheckIn } = await supabase
        .from('check_ins')
        .insert([{
          id_habitacion: hab.id,
          id_usuario: usuario?.id,
          nombre_huesped: huespedes[0].nombre,
          pax: numPersonas,
          precio_acordado: Number(precioFinal),
          adelanto: Number(adelanto),
          saldo_pendiente: saldo,
          fecha_ingreso: fechaIngreso,
          estado: 'activo'
        }]);

      if (errorCheckIn) throw errorCheckIn;

      // 3. Registro de Clientes y Detalle Relacional
      for (const h of huespedes) {
        if (!h.nombre || !h.documento) continue;

        const { data: cliente, error: errorCli } = await supabase
          .from('clientes')
          .upsert({ ...h }, { onConflict: 'documento' })
          .select().single();

        if (errorCli) throw errorCli;

        await supabase.from('detalle_hospedaje_huespedes').insert({
          id_hospedaje: hospedaje.id,
          id_cliente: cliente.id,
          estado: 'activo'
        });
      }

      // 4. Actualizar estado de habitación a 'ocupado'
      await supabase.from('habitaciones')
        .update({ estado_actual: 'O' })
        .eq('id', hab.id);
      
      onSuccess();
    } catch (error: any) {
      console.error("Error detallado:", error);
      alert(error.message || "Error al registrar el ingreso");
    } finally {
      setCargando(false);
    }
  };

  return {
    numPersonas, huespedes, fechaIngreso, precioFinal, adelanto, cargando,
    setPrecioFinal, setAdelanto, setFechaIngreso,
    manejarCambioPersonas, actualizarHuesped, registrarIngreso
  };
}