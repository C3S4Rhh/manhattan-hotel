import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useClientesGlobal() {
  const [todosLosClientes, setTodosLosClientes] = useState<any[]>([])

  const cargarClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setTodosLosClientes(data)
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  return { todosLosClientes, refrescar: cargarClientes }
}