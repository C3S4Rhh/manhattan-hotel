"use client";
import { useState, useRef } from "react";
import { registrarGasto } from "@/services/gastosService";

export function RegistroGasto({ onExito }: { onExito: () => void }) {
  const [cargando, setCargando] = useState(false);
  // Creamos una referencia al formulario para resetearlo de forma segura
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    
    const formData = new FormData(e.currentTarget);
    const nuevoGasto = {
      descripcion: formData.get("descripcion") as string,
      categoria: formData.get("categoria") as string,
      monto: parseFloat(formData.get("monto") as string),
      tipo_pago: formData.get("tipo_pago") as string,
    };

    try {
      await registrarGasto(nuevoGasto);
      
      // Llamamos a onExito para refrescar la lista
      onExito(); 
      
      // Reseteamos el formulario usando la referencia
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar el gasto");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form 
      ref={formRef} 
      onSubmit={handleSubmit} 
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4"
    >
      <h3 className="font-black text-slate-800 uppercase text-sm">Registrar Nuevo Gasto</h3>
      
      <input 
        name="descripcion" 
        placeholder="Ej: Pago mantenimiento ascensor" 
        className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" 
        required 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <select name="categoria" className="p-2 border rounded-lg outline-none" required>
          <option value="Limpieza">Limpieza</option>
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Nómina">Nómina</option>
          <option value="Administrativo">Administrativo</option>
          <option value="otros">otros</option>
        </select>
        
        <input 
          name="monto" 
          type="number" 
          step="0.01" 
          placeholder="Monto (Bs.)" 
          className="p-2 border rounded-lg outline-none focus:border-blue-500" 
          required 
        />
      </div>

      <select name="tipo_pago" className="w-full p-2 border rounded-lg outline-none" required>
        <option value="Efectivo">Efectivo</option>
        <option value="Transferencia">Transferencia</option>
      </select>

      <button 
        type="submit" 
        disabled={cargando} 
        className={`w-full p-2 rounded-lg font-bold text-white transition-all ${
          cargando ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {cargando ? "Guardando..." : "Guardar Gasto"}
      </button>
    </form>
  );
}