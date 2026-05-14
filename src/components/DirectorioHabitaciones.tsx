'use client'
import { useState } from 'react'
import EditarHabitacionModal from './EditarHabitacionModal'

// Es recomendable tener esta config en un archivo separado para importar en ambos componentes
const CONFIG_ESTADOS: Record<string, { border: string, bg: string, text: string, label: string, shadow: string, hex: string }> = {
    'reserva': { border: 'border-violet-500', bg: 'bg-violet-50', text: 'text-violet-600', label: 'Reserva', shadow: 'shadow-violet-100/50', hex: '#8b5cf6' },
    'ingreso': { border: 'border-sky-500', bg: 'bg-sky-50', text: 'text-sky-600', label: 'Ingreso', shadow: 'shadow-sky-100/50', hex: '#0ea5e9' },
    'permanente': { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Permanente', shadow: 'shadow-emerald-100/50', hex: '#10b981' },
    'sucio': { border: 'border-rose-300', bg: 'bg-rose-50', text: 'text-rose-500', label: 'Sucio', shadow: 'shadow-rose-100/50', hex: '#f43f5e' },
    'alquiler': { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', label: 'Alquiler', shadow: 'shadow-orange-100/50', hex: '#f97316' },
    'admin': { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', label: 'Admin', shadow: 'shadow-orange-100/50', hex: '#f97316' },
    'o': { border: 'border-rose-500', bg: 'bg-white', text: 'text-rose-600', label: 'Ocupada', shadow: 'shadow-rose-100/50', hex: '#e11d48' },
    'l': { border: 'border-emerald-500', bg: 'bg-white', text: 'text-emerald-600', label: 'Libre', shadow: 'shadow-emerald-100/50', hex: '#10b981' }
};

export function DirectorioHabitaciones({ habitaciones, onUpdate }: { habitaciones: any[], onUpdate: () => void }) {
  const [habitacionParaEditar, setHabitacionParaEditar] = useState<any>(null);

  return (
    <div className="bg-slate-50 p-8 rounded-3xl shadow-inner min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="bg-[#0f172a] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Configuración de Habitaciones</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Gestión administrativa de activos</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl font-black text-sm border border-emerald-500/30">
            {habitaciones.length} TOTAL
          </span>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4 text-left">Habitación</th>
                <th className="p-4 text-left">Tipo y Estado Actual</th>
                <th className="p-4 text-left">Precio Base</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {habitaciones.map((hab) => {
                // Buscamos la configuración según el estado actual
                const estadoKey = hab.estado_actual?.toLowerCase() || 'l';
                const config = CONFIG_ESTADOS[estadoKey] || CONFIG_ESTADOS['l'];

                return (
                  <tr key={hab.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="bg-[#1e293b] text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <span className="text-[10px] font-bold opacity-50">#</span>
                        <span className="text-xl font-black leading-none">{hab.numero}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Círculo de color dinámico */}
                        <div 
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${estadoKey !== 'l' ? 'animate-pulse' : ''}`} 
                          style={{ backgroundColor: config.hex }}
                        />
                        <div>
                          <p className="font-black text-slate-700 uppercase text-sm leading-none mb-1">{hab.tipo}</p>
                          <div className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${config.border} ${config.bg} ${config.text}`}>
                            Estado: {config.label}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tarifa Diaria</span>
                        <span className="font-black text-slate-600 text-lg">Bs. {hab.precio_base}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setHabitacionParaEditar(hab)}
                        className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-white hover:shadow-lg hover:shadow-sky-200 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {habitacionParaEditar && (
        <EditarHabitacionModal 
          habitacion={habitacionParaEditar} 
          onClose={() => setHabitacionParaEditar(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  )
}