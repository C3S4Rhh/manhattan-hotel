import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Este es el cliente que usaremos para todas las consultas
export const supabase = createClient(supabaseUrl, supabaseAnonKey)