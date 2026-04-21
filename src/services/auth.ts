// src/services/auth.ts
import { supabase } from '@/lib/supabase'

export const authService = {
  login: async (email: string, pass: string) => {
    // 1. Intentar el login oficial
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    })

    if (authError || !authData.user) return null

    // 2. Buscar al usuario en la tabla 'public.usuarios' por el ID
    const { data: userData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authData.user.id) // Buscamos por el ID de autenticación
      .single()

    if (userData) {
      localStorage.setItem('hotel_user', JSON.stringify(userData))
      return userData
    }
    return null
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('hotel_user')
      return user ? JSON.parse(user) : null
    }
    return null
  },

  logout: async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('hotel_user')
  }
}