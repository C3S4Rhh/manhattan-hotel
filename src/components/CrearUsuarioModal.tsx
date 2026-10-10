'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface CrearUsuarioProps {
  onClose: () => void;
  onUpdate: () => void;
}

export default function CrearUsuarioModal({ onClose, onUpdate }: CrearUsuarioProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('servicio')
  const [cargando, setCargando] = useState(false)

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      // 1. Crear la cuenta en Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Insertar los datos complementarios en tu tabla 'public.usuarios'
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: authData.user.id,
              nombre: nombre,
              rol: rol
            }
          ])

        if (dbError) throw dbError

        alert('¡Usuario registrado con éxito!')
        onUpdate()
        onClose()
      }
    } catch (error: any) {
      alert(error.message || 'Error al procesar el alta del usuario')
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Contenedor adaptado con altura máxima y scroll interno para celulares */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 w-full max-w-md shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1 uppercase tracking-tighter">
          Nuevo Colaborador
        </h3>
        <p className="text-slate-400 text-[10px] font-bold uppercase mb-6 sm:mb-8 tracking-widest">
          Control de ingresos Manhattan Hotel
        </p>

        <form onSubmit={handleCrearUsuario} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-bold outline-none focus:border-sky-500 text-slate-700 transition-colors"
              placeholder="Ej. Carlos Mendoza"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Correo de Acceso</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-bold outline-none focus:border-sky-500 text-slate-700 transition-colors"
              placeholder="ejemplo@hotelmanhattan.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Contraseña Inicial</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-bold outline-none focus:border-sky-500 text-slate-700 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Rol del Sistema</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 sm:p-4 font-black text-xs text-slate-700 outline-none focus:border-sky-500 transition-colors cursor-pointer"
            >
              <option value="servicio">🧹 Servicio (Limpieza)</option>
              <option value="responsable">🔑 Responsable (Recepción)</option>
              <option value="subadministrador">💼 Subadministrador</option>
              <option value="administrador">👑 Administrador</option>
            </select>
          </div>

          <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 sm:p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-[#0f172a] p-3 sm:p-4 rounded-2xl font-black text-white uppercase text-[10px] tracking-widest shadow-xl hover:bg-sky-600 transition-all disabled:opacity-50"
            >
              {cargando ? 'Registrando...' : 'Dar de Alta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
