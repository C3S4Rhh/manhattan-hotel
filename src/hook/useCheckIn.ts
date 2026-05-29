/**
 * Hook de check_ins optimizado para Bolivia con validación de edad, nacionalidad y autocompletado
 */
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Función auxiliar para calcular la edad exacta en base a la fecha de nacimiento
const calcularEdad = (fechaNacimiento: string): number => {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const cumpleanos = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - cumpleanos.getFullYear();
  const mes = hoy.getMonth() - cumpleanos.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
    edad--;
  }
  return edad;
};

export function useCheckIn(hab: any, usuario: any, onSuccess: () => void) {
  const [numPersonas, setNumPersonas] = useState(1);
  const [huespedes, setHuespedes] = useState([
    { nombre: '', documento: '', profesion: '', celular: '', nacionalidad: '', fecha_nacimiento: '' }
  ]);
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
      while (nuevoArray.length < n) {
        nuevoArray.push({ nombre: '', documento: '', profesion: '', celular: '', nacionalidad: '', fecha_nacimiento: '' });
      }
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

  // FUNCIÓN NUEVA: Inyecta los datos del cliente frecuente recuperados desde Supabase
  const autoCompletarHuesped = (index: number, datosCompletos: any) => {
    const nuevosHuespedes = [...huespedes];
    nuevosHuespedes[index] = datosCompletos;
    setHuespedes(nuevosHuespedes);
  };

  const registrarIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargando) return;
    
    // --- LÓGICA DE VALIDACIÓN DE EDAD (REGLA DE NEGOCIO) ---
    const edades = huespedes.map(h => calcularEdad(h.fecha_nacimiento));
    const tieneMenorDeEdad = edades.some(edad => edad < 18);
    const tieneAdultoAcompanante = edades.some(edad => edad >= 18);

    if (tieneMenorDeEdad && !tieneAdultoAcompanante) {
      alert("❌ REGISTRO DENEGADO: Los menores de 18 años no pueden ingresar solos. Es obligatorio que estén acompañados por lo menos de un adulto responsable.");
      return;
    }

    setCargando(true);
    
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
          responsable: nombreResponsable, 
          recepcionista: nombreResponsable, 
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
          .upsert({
            nombre: h.nombre,
            documento: h.documento,
            profesion: h.profesion,
            celular: h.celular,
            nacionalidad: h.nacionalidad,
            fecha_nacimiento: h.fecha_nacimiento
          }, { onConflict: 'documento' })
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
    manejarCambioPersonas, actualizarHuesped, autoCompletarHuesped, registrarIngreso // <-- Exportado con éxito
  };
}