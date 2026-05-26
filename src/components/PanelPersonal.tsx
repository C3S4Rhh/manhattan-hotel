'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import CrearUsuarioModal from './CrearUsuarioModal'

export default function PanelPersonal() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [rolUsuarioLogueado, setRolUsuarioLogueado] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)

  const cargarUsuarios = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (!error && data) {
      setUsuarios(data)
    }
  }

  useEffect(() => {
    cargarUsuarios()

    // Extraemos el rol guardado en la sesión activa
    const usuarioGuardado = localStorage.getItem('hotel_user')
    if (usuarioGuardado) {
      try {
        const datosUser = JSON.parse(usuarioGuardado)
        setRolUsuarioLogueado(datosUser.rol)
      } catch (e) {
        console.error("Error al leer sesión", e)
      }
    }
  }, [])

  // FUNCIÓN CRÍTICA: Eliminar usuario de la base de datos
  const handleEliminarUsuario = async (idUsuario: string, nombreUsuario: string) => {
    const confirmar = window.confirm(`¿Estás completamente seguro de dar de baja a ${nombreUsuario}? Esta acción no se puede deshacer.`)
    
    if (!confirmar) return

    setEliminandoId(idUsuario)
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', idUsuario)

      if (error) throw error

      alert('Usuario eliminado correctamente de la planta.')
      cargarUsuarios() // Recarga la tabla de inmediato
    } catch (error: any) {
      alert(error.message || 'No se pudo eliminar al usuario. Verifica tus permisos de administrador.')
    } finally {
      setEliminandoId(null)
    }
  }

  const esAdmin = rolUsuarioLogueado === 'administrador'

  return (
    <div className="bg-slate-50 p-8 rounded-3xl shadow-inner min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="bg-[#0f172a] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Control de Personal</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
              Roles y Accesos de la Planta
            </p>
          </div>
          
          {esAdmin && (
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              ➕ Nuevo Usuario
            </button>
          )}
        </div>

        {/* Tabla de Usuarios */}
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4 text-left">Nombre del Empleado</th>
                <th className="p-4 text-left">Rol Asignado</th>
                <th className="p-4 text-left">Fecha de Alta</th>
                {esAdmin && <th className="p-4 text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usuarios.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 font-black text-slate-700">{usr.nombre}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase border ${
                      usr.rol === 'administrador' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                      usr.rol === 'subadministrador' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      usr.rol === 'responsable' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {usr.rol}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-bold text-xs">
                    {usr.created_at ? new Date(usr.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  
                  {/* Celda de acciones exclusivas para el Administrador */}
                  {esAdmin && (
                    <td className="p-4 text-center">
                      {/* Evitamos que el administrador se elimine a sí mismo por accidente */}
                      {localStorage.getItem('hotel_user') && JSON.parse(localStorage.getItem('hotel_user') || '{}').id === usr.id ? (
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider italic">Tu Cuenta</span>
                      ) : (
                        <button
                          onClick={() => handleEliminarUsuario(usr.id, usr.nombre)}
                          disabled={eliminandoId === usr.id}
                          className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border border-rose-100 disabled:opacity-40"
                        >
                          {eliminandoId === usr.id ? 'Borrando...' : '🗑️ Eliminar'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <CrearUsuarioModal 
          onClose={() => setModalAbierto(false)} 
          onUpdate={cargarUsuarios} 
        />
      )}
    </div>
  )
}