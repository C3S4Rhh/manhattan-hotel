'use client'
import { useState } from 'react'
import { authService } from '@/services/auth'

interface Props {
  onLoginSuccess: (user: any) => void
}

export function Login({ onLoginSuccess }: Props) {
  const [loginName, setLoginName] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const user = await authService.login(loginName, loginPin)
    if (user) {
      onLoginSuccess(user)
    } else {
      alert('Credenciales incorrectas')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl rotate-3 mb-4 shadow-lg">
            <span className="text-white text-3xl font-black italic">M</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter text-center">Hotel Manhattan</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Control de Acceso</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Correo Electrónico</label>
            <input 
              required
              type="email" 
              placeholder="cesar@manhattan.com"
              className="w-full border-2 p-3 rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-slate-50 transition-all"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contraseña</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              className="w-full border-2 p-3 rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-slate-50 transition-all"
              value={loginPin}
              onChange={(e) => setLoginPin(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all transform active:scale-95 shadow-xl shadow-blue-100 mt-2"
          >
            {loading ? 'Verificando...' : 'ENTRAR AL SISTEMA'}
          </button>
        </div>
      </form>
    </div>
  )
}