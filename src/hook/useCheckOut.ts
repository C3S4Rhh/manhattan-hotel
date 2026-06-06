'use client'

import { useState, useEffect } from 'react'

import { supabase } from '@/lib/supabase'

import { habitacionesService } from '@/services/habitaciones'



export function useCheckOut(hab: any, onSuccess: () => void) {

  const [registro, setRegistro] = useState<any>(null)

  const [huespedesDetalle, setHuespedesDetalle] = useState<any[]>([])

  const [cargando, setCargando] = useState(true)

  const [pagoFinal, setPagoFinal] = useState<number>(0)

  const [procesando, setProcesando] = useState(false)



  useEffect(() => {

    const obtenerDatos = async () => {

      const { data: hospedaje, error } = await supabase

        .from('hospedajes')

        .select(`

          *,

          detalle_hospedaje_huespedes (

            id,

            estado,

            clientes ( nombre, documento, profesion )

          )

        `)

        .eq('id_habitacion', hab.id)

        .eq('estado', 'activo')

        .maybeSingle();

     

      if (hospedaje) {

        setRegistro(hospedaje)

       

        const pendiente = (hospedaje.precio_acordado || 0) - (hospedaje.a_cuenta || 0);

        setPagoFinal(pendiente > 0 ? pendiente : 0);



        const activos = hospedaje.detalle_hospedaje_huespedes?.filter(

          (d: any) => d.estado === 'activo'

        ) || [];

        setHuespedesDetalle(activos);

      }

     

      setCargando(false)

    }



    if (hab?.id) obtenerDatos()

  }, [hab.id])



  const pendienteCalculado = (registro?.precio_acordado || 0) - (registro?.a_cuenta || 0);

  const saldoLiquidado = pagoFinal >= pendienteCalculado;



  const retirarHuesped = async (idDetalle: string) => {

    if(!confirm("¿Estás seguro de registrar la salida individual de este huésped?")) return;

   

    const ahora = new Date().toISOString();

    const { error } = await supabase

      .from('detalle_hospedaje_huespedes')

      .update({

        estado: 'retirado',

        fecha_salida_individual: ahora

      })

      .eq('id', idDetalle);



    if (!error) {

      setHuespedesDetalle(prev => prev.filter(h => h.id !== idDetalle));

    } else {

      alert("Error al retirar: " + error.message);

    }

  }



const realizarSalidaTotal = async () => {

    if (!saldoLiquidado) {

      alert("Debe liquidar el saldo pendiente antes de finalizar.");

      return;

    }



    setProcesando(true);

    try {

      // 1. OBTENER EL USUARIO AUTENTICADO

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("Debes iniciar sesión para realizar esta operación.");



      const ahora = new Date().toISOString();

     

      // 2. SI HAY PAGO, REGISTRAMOS EN CAJA

      if (pagoFinal > 0) {

        const { data: sesion, error: errorSesion } = await supabase

          .from('caja_sesiones')

          .select('id')

          .eq('estado', 'abierta')

          .single();



        if (errorSesion) throw new Error("No hay una caja abierta para registrar el pago.");



        const { error: errorCaja } = await supabase

          .from('caja_movimientos')

          .insert([{

            id_sesion: sesion.id,

            id_usuario: user.id, // <--- AHORA SÍ ESTÁ DEFINIDO

            id_habitacion: hab.id,

            nro_habitacion: hab.numero,

            tipo_movimiento: 'ingreso',

            categoria: 'Hospedaje',

            monto_total: pagoFinal,

            monto_a_cuenta: pagoFinal,

            huesped_referencia: registro.detalle_hospedaje_huespedes?.[0]?.clientes?.nombre || 'Checkout Hab. ' + hab.numero,

            observaciones: 'Pago final de checkout - Estancia concluida'

          }]);



        if (errorCaja) throw errorCaja;

      }



      // ... resto del código (actualizar hospedaje, marcar huéspedes, liberar habitación) ...



      // 2. ACTUALIZAR HOSPEDAJE

      const { error: errorHospedaje } = await supabase

        .from('hospedajes')

        .update({

          a_cuenta: (registro.a_cuenta || 0) + pagoFinal,

          saldo_total: 0,

          estado: 'finalizado',

          fecha_salida: ahora

        })

        .eq('id', registro.id);



      if (errorHospedaje) throw errorHospedaje;



      // 3. MARCAR HUESPEDES COMO RETIRADOS

      await supabase

        .from('detalle_hospedaje_huespedes')

        .update({ estado: 'retirado', fecha_salida_individual: ahora })

        .eq('id_hospedaje', registro.id)

        .eq('estado', 'activo');



      // 4. LIBERAR HABITACIÓN

      await habitacionesService.checkOut(hab.id);

     

      onSuccess();

    } catch (e: any) {

      console.error(e);

      alert("Error al procesar la salida: " + e.message);

    } finally {

      setProcesando(false);

    }

  }



  return {

    registro,

    huespedesDetalle,

    cargando,

    pagoFinal,

    procesando,

    saldoLiquidado,

    setPagoFinal,

    retirarHuesped,

    realizarSalidaTotal

  }

} 

