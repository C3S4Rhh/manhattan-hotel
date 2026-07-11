"use client";

// Función auxiliar idéntica al hook para procesar la edad en la tabla
const calcularEdad = (fechaNacimiento: string): string => {
  if (!fechaNacimiento) return "---";
  const hoy = new Date();
  const cumpleanos = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - cumpleanos.getFullYear();
  const mes = hoy.getMonth() - cumpleanos.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
    edad--;
  }
  return `${edad} años`;
};

export function ListaClientesRegistrados({ clientes }: { clientes: any[] }) {
  return (
    <div className="bg-slate-50 p-4 md:p-8 rounded-3xl shadow-inner min-h-screen">
      <div className="max-w-12xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        {/* Encabezado con estética Manhattan Slate */}
        <div className="bg-[#1e293b] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Historial de Clientes
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Directorio global de huéspedes registrados
            </p>
          </div>
          <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl font-black text-sm border border-blue-500/30">
            {clientes.length} REGISTROS
          </span>
        </div>

        {/* Tabla Responsiva */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4 text-left">Nombre Completo</th>
                <th className="p-4 text-left">País / Origen</th>
                <th className="p-8 text-left">Edad</th>
                 <th className="p-8 text-left">fecha Nac.</th>
                <th className="p-4 text-left">Estado civil</th>
                <th className="p-4 text-left">Profesión</th>   
                <th className="p-4 text-left">Documento / CI</th>
                <th className="p-4 text-left">Celular</th>  
                <th className="p-4 text-left">registro</th>
                <th className="p-4 text-left">Última Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clientes.map((cliente) => {
                // Validación de seguridad para evitar errores de strings vacíos
                const nombreValido =
                  cliente.nombre && cliente.nombre.trim() !== ""
                    ? cliente.nombre
                    : "Sin Nombre";
                const inicial = nombreValido.charAt(0).toUpperCase();

                return (
                  <tr
                    key={cliente.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Nombre completo y Avatar */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                          {inicial}
                        </div>
                        <span className="font-bold text-slate-700 capitalize">
                          {nombreValido.toLowerCase()}
                        </span>
                      </div>
                    </td>

                    {/* Nacionalidad */}
                    <td className="p-4 text-slate-600 uppercase text-xs font-bold">
                      {cliente.nacionalidad ? (
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200/50">
                          {cliente.nacionalidad}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal text-[11px]">
                          No especificado
                        </span>
                      )}
                    </td>

                    {/* Edad Dinámica */}
                    <td className="p-4 text-slate-600 font-semibold text-sm">
                      {calcularEdad(cliente.fecha_nacimiento)}
                    </td>
                    

                       {/* fecha_nacimiento */}
                  
                    <td className="p-1 text-slate-400 uppercase text-xs font-bold">
                      {cliente.fecha_nacimiento ? (
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200/50">
                          {cliente.fecha_nacimiento}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal text-[14px]">
                          No especificado
                        </span>
                      )}
                    </td>
                    
                         {/* ESTADO CIVIL */}
                    <td className="p-4 text-slate-600 font-medium capitalize">
                      {cliente.estado_civil ? (
                        cliente.estado_civil.toLowerCase()
                      ) : (
                        <span className="text-slate-300">---</span>
                      )}
                    </td>

                    {/* Profesión */}
                    <td className="p-4 text-slate-600 font-medium capitalize">
                      {cliente.profesion ? (
                        cliente.profesion.toLowerCase()
                      ) : (
                        <span className="text-slate-300">---</span>
                      )}
                    </td>


                    {/* Documento */}
                    <td className="p-4 text-slate-600 font-mono text-sm">
                      {cliente.documento || "---"}
                    </td>

                    {/* Celular */}
                    <td className="p-4 text-slate-600 font-medium">
                      {cliente.celular ? (
                        <span className="flex items-center gap-1">
                          📞 {cliente.celular}
                        </span>
                      ) : (
                        <span className="text-slate-300">---</span>
                      )}
                    </td>

                    {/* Fecha de Creación */}
                    <td className="p-4">
                      <span className="text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                        {cliente.created_at
                          ? new Date(cliente.created_at).toLocaleDateString(
                              "es-BO",
                            )
                          : "---"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                        {cliente.ultima_visita
                          ? new Date(cliente.ultima_visita).toLocaleDateString(
                              "es-BO",
                            )
                          : cliente.created_at
                            ? new Date(cliente.created_at).toLocaleDateString(
                                "es-BO",
                              )
                            : "---"}
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
  );
}
