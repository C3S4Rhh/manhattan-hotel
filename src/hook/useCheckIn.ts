/**
 * Hook de check_ins optimizado para Bolivia con validación de edad, nacionalidad y autocompletado
 */
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
  const [diasEstadia, setDiasEstadia] = useState(1);
  const [huespedes, setHuespedes] = useState([
    { nombre: '', documento: '', profesion: '', celular: '', nacionalidad: '', fecha_nacimiento: '',estado_civil: '' }
  ]);
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [precioFinal, setPrecioFinal] = useState(hab?.precio_base || 0);
 
  const [cargando, setCargando] = useState(false);

  const [pagoEfectivo, setPagoEfectivo] = useState(0);
  const [pagoQR, setPagoQR] = useState(0);
  const [estadoLimpieza, setEstadoLimpieza] = useState('limpio');

   const adelanto = Number(pagoEfectivo) + Number(pagoQR);

  useEffect(() => {
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset() * 60000;
    const localISOTime = new Date(ahora.getTime() - offset).toISOString().slice(0, 16);
    setFechaIngreso(localISOTime);
  }, []);
// 1. Agrega un estado para guardar el precio base original (para no perderlo al multiplicar)
const [precioBaseUnitario, setPrecioBaseUnitario] = useState(hab?.precio_base || 0);
const manejarCambioDias = (nuevosDias: number) => {
  setDiasEstadia(nuevosDias);
  // Multiplicas el precio base original por los nuevos días
  setPrecioFinal(precioBaseUnitario * nuevosDias);
};

// 3. (Opcional) Si el usuario edita el precio manualmente, actualiza el precioBaseUnitario
const actualizarPrecioManual = (nuevoPrecio: number) => {
  setPrecioBaseUnitario(nuevoPrecio); // Esto evita que el cálculo se sobrescriba mal
  setPrecioFinal(nuevoPrecio * diasEstadia);
};
  const manejarCambioPersonas = (n: number) => {
    setNumPersonas(n);
    const nuevoArray = [...huespedes];
    if (n > huespedes.length) {
      while (nuevoArray.length < n) {
        nuevoArray.push({ nombre: '', documento: '', profesion: '', celular: '', nacionalidad: '', fecha_nacimiento: '',estado_civil: '' });
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

  const autoCompletarHuesped = (index: number, datosCompletos: any) => {
    const nuevosHuespedes = [...huespedes];
    // Asegurar valores por defecto para evitar bloqueos de validación del navegador
    nuevosHuespedes[index] = { 
      ...datosCompletos,
      nacionalidad: datosCompletos.nacionalidad || 'Boliviana'
    };
    setHuespedes(nuevosHuespedes);
  };

  const registrarIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargando) return;
    
    const edades = huespedes.map(h => calcularEdad(h.fecha_nacimiento));
    const tieneMenorDeEdad = edades.some(edad => edad < 18);
    const tieneAdultoAcompanante = edades.some(edad => edad >= 18);

    if (tieneMenorDeEdad && !tieneAdultoAcompanante) {
      alert("❌ REGISTRO DENEGADO: Los menores de 18 años no pueden ingresar solos.");
      return;
    }

    setCargando(true);
    
    const nombreResponsable = usuario?.nombre || usuario?.user_metadata?.nombre || 'Cesar';
    const saldo = Number(precioFinal) - Number(adelanto);

    try {
      // 1. Registro en tabla 'hospedajes'
      const { data: hospedaje, error: errorIns } = await supabase
        .from('hospedajes')
        .insert([{
          id_habitacion: hab.id,
          id_usuario: usuario?.id,
          nombre_huesped: huespedes[0].nombre,
          nro_pax: numPersonas,
          cantidad_dias: diasEstadia,
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

      // 2. Registro en tabla 'check_ins'
      const { error: errorCheckIn } = await supabase
        .from('check_ins')
        .insert([{
          id_habitacion: hab.id,
          id_usuario: usuario?.id,
          nombre_huesped: huespedes[0].nombre,
          pax: numPersonas,

          precio_acordado: Number(precioFinal),
          adelanto: Number(adelanto),
          pago_efectivo: Number(pagoEfectivo),
        pago_qr: Number(pagoQR),
          saldo_pendiente: saldo,
          fecha_ingreso: fechaIngreso,
          estado: 'activo'
        }]);

      if (errorCheckIn) throw errorCheckIn;

   // 3. REGISTRO EN CAJA (Corregido: Usa precioFinal y formato de observación)
if (Number(adelanto) > 0) {
  const { data: sesionAbierta } = await supabase
    .from('caja_sesiones')
    .select('id')
    .eq('estado', 'abierta')
    .maybeSingle();

  const { error: errorCaja } = await supabase
    .from('caja_movimientos') 
    .insert([{
      id_sesion: sesionAbierta?.id || null,
      id_usuario: usuario?.id,
      id_habitacion: hab.id,
      nro_habitacion: String(hab.numero),
      tipo_movimiento: 'ingreso',
      categoria: 'hospedaje_extra', // Asegúrate de usar la categoría correcta que esperas ver
      monto_total: Number(precioFinal), // Toma el precio total editado
      monto_efectivo: Number(pagoEfectivo), // Nuevo campo
      monto_qr: Number(pagoQR),             // Nuevo campo
      monto_a_cuenta: Number(adelanto), // Toma el adelanto registrado
      monto_saldo: saldo,             // El saldo restante calculado
      huesped_referencia: huespedes[0].nombre,
      // Formato de observación idéntico a tus registros anteriores
      observaciones: `Adelanto Check-In Hab. #${hab?.numero} por ${diasEstadia} día(s).- Con deuda - Queda pendiente un saldo de ${saldo} Bs.`,
      fecha: new Date().toISOString()
    }]);

  if (errorCaja) {
    console.error("Error al registrar en caja_movimientos:", errorCaja);
  }
}

      // 4. Registro de Clientes y Detalle Relacional
      for (const h of huespedes) {
        if (!h.nombre || !h.documento) continue;

        const { data: cliente, error: errorCli } = await supabase
          .from('clientes')
          .upsert({
            nombre: h.nombre,
            documento: h.documento,
            profesion: h.profesion,
            celular: h.celular,
            nacionalidad: h.nacionalidad || 'Boliviana',
            fecha_nacimiento: h.fecha_nacimiento || null,
            estado_civil: h.estado_civil,
            ultima_visita: new Date().toISOString()
          }, { onConflict: 'documento' })
          .select().single();

        if (errorCli) throw errorCli;

        await supabase.from('detalle_hospedaje_huespedes').insert({
          id_hospedaje: hospedaje.id,
          id_cliente: cliente.id,
          estado: 'activo'
        });
      }

      // 5. Actualizar habitación
     const { error: errorHabitacion } = await supabase
  .from('habitaciones')
  .update({
    estado_actual: 'O',          // Cambia a ocupada
    estado_limpieza: estadoLimpieza, // Aquí envías 'limpio' o 'lo'
  })
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
    numPersonas,diasEstadia,      // <--- AÑADE ESTO
  manejarCambioDias, huespedes, fechaIngreso, precioFinal, adelanto, cargando,
    pagoEfectivo, setPagoEfectivo, // Exportar nuevos estados
    pagoQR, setPagoQR,
    estadoLimpieza, setEstadoLimpieza,
    setPrecioFinal,precioBaseUnitario,      // <--- Agrégalo aquí
    setPrecioBaseUnitario, setFechaIngreso,
    manejarCambioPersonas, actualizarHuesped, autoCompletarHuesped, registrarIngreso
    
  };
}