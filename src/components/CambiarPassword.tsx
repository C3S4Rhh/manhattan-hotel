'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function CambiarPassword({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleUpdate = async () => {
    setCargando(true)
    // Esto actualiza la contraseña del usuario actualmente autenticado
    const { error } = await supabase.auth.updateUser({ password: password })

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Contraseña actualizada correctamente")
      onClose()
    }
    setCargando(false)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
        <h3 className="font-black text-xl mb-4 uppercase">Cambiar mi contraseña</h3>
        <input 
          type="password" 
          placeholder="Nueva contraseña"
          className="w-full p-4 bg-slate-100 rounded-2xl mb-4 font-bold"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 p-3 text-slate-400 font-black uppercase text-[10px]">Cancelar</button>
          <button onClick={handleUpdate} disabled={cargando} className="flex-1 bg-blue-600 text-white rounded-xl p-3 font-black uppercase text-[10px]">
            {cargando ? 'Guardando...' : 'Cambiar'}
          </button>
        </div>
      </div>
    </div>
  )
}