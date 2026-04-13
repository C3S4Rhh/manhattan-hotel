'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [selectedHab, setSelectedHab] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Estados del formulario
  const [huesped, setHuesped] = useState('')
  const [pax, setPax] = useState(1)
  const [precio, setPrecio] = useState(0)
  const [adelanto, setAdelanto] = useState(0)
  const [responsable, setResponsable] = useState('')

  const fetchHabitaciones = async () => {
    const { data } = await supabase
      .from('habitaciones')
      .select('*')
      .order('numero', { ascending: true })
    setHabitaciones(data || [])
  }

  useEffect(() => {
    fetchHabitaciones()
  }, [])

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Registrar el hospedaje
    const { error: errorHospedaje } = await supabase
      .from('hospedajes')
      .insert([{
        id_habitacion: selectedHab.id,
        nombre_huesped: huesped,
        nro_pax: pax,
        precio_acordado: precio,
        a_cuenta: adelanto,
        responsable: responsable,
        cuenta_pendiente: (precio - adelanto) > 0
      }])

    // 2. Cambiar estado de la habitación a 'LO' (Limpia Ocupada)
    if (!errorHospedaje) {
      await supabase
        .from('habitaciones')
        .update({ estado_actual: 'LO' })
        .eq('id', selectedHab.id)
      
      setSelectedHab(null)
      fetchHabitaciones()
      alert('¡Check-in exitoso!')
    }
    setLoading(false)
  }

  return (
    <main className="p-6 bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-8 flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-black">HOTEL MANHATTAN</h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div> Libre</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div> Ocupada</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {habitaciones.map((hab) => (
          <button 
            key={hab.id} 
            onClick={() => {
              if(hab.estado_actual === 'L') {
                setSelectedHab(hab)
                setPrecio(hab.precio_base)
              }
            }}
            className={`p-4 rounded-xl shadow-md transition-all hover:scale-105 text-left border-2 ${
              hab.estado_actual === 'L' ? 'bg-white border-green-500' : 'bg-red-50 border-red-500 opacity-80'
            }`}
          >
            <span className="text-xl font-bold">#{hab.numero}</span>
            <p className="text-sm opacity-70">{hab.tipo}</p>
            <div className={`mt-2 text-xs font-bold px-2 py-1 rounded inline-block ${
              hab.estado_actual === 'L' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {hab.estado_actual === 'L' ? 'DISPONIBLE' : 'OCUPADA'}
            </div>
          </button>
        ))}
      </div>

      {/* MODAL DE CHECK-IN */}
      {selectedHab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Check-in: Hab {selectedHab.numero}</h2>
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nombre del Huésped</label>
                <input required type="text" className="w-full border p-2 rounded mt-1" onChange={e => setHuesped(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">PAX (Personas)</label>
                  <input type="number" className="w-full border p-2 rounded mt-1" value={pax} onChange={e => setPax(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Responsable</label>
                  <input required type="text" className="w-full border p-2 rounded mt-1" onChange={e => setResponsable(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Precio Acordado</label>
                  <input type="number" className="w-full border p-2 rounded mt-1" value={precio} onChange={e => setPrecio(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium">A Cuenta (Adelanto)</label>
                  <input type="number" className="w-full border p-2 rounded mt-1" onChange={e => setAdelanto(Number(e.target.value))} />
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setSelectedHab(null)} className="flex-1 bg-slate-200 py-2 rounded-lg font-bold">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold">
                  {loading ? 'Registrando...' : 'Confirmar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}