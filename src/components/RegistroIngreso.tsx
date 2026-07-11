"use client";
import { useState, useRef } from "react";
import { registrarIngreso } from "@/services/ingresosService";


export function RegistroIngreso({ onExito, usuario }: { onExito: () => void, usuario: any }) {
  const [cargando, setCargando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await registrarIngreso({
        descripcion: formData.get("descripcion"),
        categoria: formData.get("categoria"),
        monto: parseFloat(formData.get("monto") as string),
        tipo_pago: formData.get("tipo_pago"),
        usuario_id: usuario.id,
        responsable: usuario.nombre,
      });
      onExito();
      formRef.current?.reset();
   } catch (error) {
  console.error("Detalle del error:", error); // Esto imprimirá el error real en la consola
  alert("Error al guardar: " + (error as any).message); // Esto te dirá en pantalla qué falta
} finally {
      setCargando(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
      <h3 className="font-black text-emerald-800 uppercase text-xs tracking-widest">Nuevo Ingreso Extra</h3>
      <input name="descripcion" placeholder="Ej: Pago por daño de lámpara" className="w-full p-2 bg-slate-50 rounded-xl" required />
      <select name="categoria" className="w-full p-2 bg-slate-50 rounded-xl" required>
        <option>Lavandería</option>
        <option>Daños a propiedad</option>
        <option>Desayunos extras</option>
        <option>Otros</option>
      </select>
      
      <input name="monto" type="number" placeholder="Monto Bs." className="w-full p-2 bg-slate-50 rounded-xl" required />
      {/* Selector añadido */}
      <select name="tipo_pago" className="w-full p-2 bg-slate-50 rounded-xl" required>
        <option value="efectivo">Efectivo</option>
        <option value="qr">QR</option>
      </select>
      <button disabled={cargando} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-black uppercase text-[10px]">
        {cargando ? "Guardando..." : "Registrar Ingreso"}
      </button>
    </form>
  );
}