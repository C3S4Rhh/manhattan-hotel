/**
 * Componente de formulario de huésped con autocompletado por CI/Documento
 */
import { supabase } from "@/lib/supabase";

interface GuestFormProps {
  index: number;
  huesped: any;
  onChange: (index: number, campo: string, valor: string) => void;
  onAutoCompletar: (index: number, datosCompletos: any) => void;
}

export function GuestForm({
  index,
  huesped,
  onChange,
  onAutoCompletar,
}: GuestFormProps) {
  // Función para buscar al cliente en Supabase cuando se introduce el documento
  const buscarClienteExistente = async (documento: string) => {
    onChange(index, "documento", documento);

    // Solo buscamos si el documento tiene una longitud razonable (evita consultas vacías)
    if (documento.trim().length > 4) {
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select("nombre, profesion, celular, nacionalidad, fecha_nacimiento")
          .eq("documento", documento.trim())
          .maybeSingle(); // Trae un registro o null si no existe

        if (!error && data) {
          // Si encontramos al cliente, enviamos todos sus datos al estado padre
          onAutoCompletar(index, {
            documento: documento.trim(),
            nombre: data.nombre || "",
            profesion: data.profesion || "",
            celular: data.celular || "",
            nacionalidad: data.nacionalidad || "",
            fecha_nacimiento: data.fecha_nacimiento || "",
          });
        }
      } catch (err) {
        console.error("Error al buscar cliente frecuente:", err);
      }
    }
  };

  // Función para mostrar visualmente si es Adulto o Menor en tiempo real
  const calcularEstadoEdad = (fecha: string) => {
    if (!fecha) return "";
    const hoy = new Date();
    const cumpleanos = new Date(fecha);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const mes = hoy.getMonth() - cumpleanos.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    return edad >= 18 ? "🧑 Adulto" : "🧒 Menor de edad";
  };

  const estadoEdad = calcularEstadoEdad(huesped.fecha_nacimiento);

  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider">
          Huésped #{index + 1} {index === 0 ? "(Titular)" : ""}
        </p>
        {estadoEdad && (
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
              estadoEdad.includes("Adulto")
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}
          >
            {estadoEdad}
          </span>
        )}
      </div>

      {/* CI / Pasaporte (Lo movemos arriba para que sea lo primero que llenen) */}
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="CI / Pasaporte"
          value={huesped.documento}
          onChange={(e) => buscarClienteExistente(e.target.value)}
          className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-xs placeholder:font-normal text-blue-600"
        />
        <input
          placeholder="Profesión"
          value={huesped.profesion}
          onChange={(e) => onChange(index, "profesion", e.target.value)}
          className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-xs placeholder:font-normal"
        />
      </div>

      {/* Nombre Completo */}
      <input
        required
        placeholder="Nombre Completo"
        value={huesped.nombre}
        onChange={(e) => onChange(index, "nombre", e.target.value)}
        className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-sm placeholder:font-normal"
      />

      {/* Nacionalidad y Fecha de Nacimiento */}
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Nacionalidad (Ej. Boliviana)"
          value={huesped.nacionalidad || ""}
          onChange={(e) => onChange(index, "nacionalidad", e.target.value)}
          className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-xs placeholder:font-normal"
        />
        <div className="relative flex flex-col justify-end">
          <span className="text-[8px] font-bold text-slate-400 uppercase ml-1 mb-0.5">
            F. de Nacimiento
          </span>
          <input
            required
            type="date"
            value={huesped.fecha_nacimiento || ""}
            onChange={(e) =>
              onChange(index, "fecha_nacimiento", e.target.value)
            }
            className="w-full border-b border-slate-200 bg-transparent p-0.5 outline-none focus:border-blue-500 font-bold text-xs text-slate-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Celular de Referencia */}
      <input
        type="tel"
        placeholder="Celular de Referencia"
        value={huesped.celular}
        onChange={(e) => onChange(index, "celular", e.target.value)}
        className="w-full border-b border-slate-200 bg-transparent p-1 outline-none focus:border-blue-500 font-bold text-xs placeholder:font-normal"
      />
    </div>
  );
}
