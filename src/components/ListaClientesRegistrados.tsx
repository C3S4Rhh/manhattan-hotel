'use client'

export function ListaClientesRegistrados({ clientes }: { clientes: any[] }) {
  return (
    <div className="bg-slate-50 p-8 rounded-3xl shadow-inner min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        {/* Encabezado con estética Slate/Blue */}
        <div className="bg-[#1e293b] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Historial de Clientes</h2>
          </div>
          <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl font-black text-sm border border-blue-500/30">
            {clientes.length} REGISTROS
          </span>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4 text-left">Nombre Completo</th>
                <th className="p-4 text-left">Documento / ID</th>
                <th className="p-4 text-left">País / Origen</th>
                <th className="p-4 text-left">Última Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clientes.map((cliente) => {
                // Validación de seguridad para evitar el error charAt de image_83fd5c.png
                const nombreValido = cliente.nombre && cliente.nombre.trim() !== "" ? cliente.nombre : "Sin Nombre";
                const inicial = nombreValido.charAt(0).toUpperCase();

                return (
                  <tr key={cliente.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar con la inicial segura */}
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                          {inicial}
                        </div>
                        <span className="font-bold text-slate-700">{nombreValido}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {cliente.documento || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600 uppercase text-xs font-bold">
                      {cliente.nacionalidad || 'No especificado'}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-lg">
                        {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : '---'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}