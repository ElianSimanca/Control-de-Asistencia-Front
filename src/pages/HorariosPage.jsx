import { useEffect, useState } from "react";
import api from "../api/axios";
import { Chip, toast } from "@heroui/react";
import { Plus, RefreshCw, Clock, Trash2 } from "lucide-react";

export default function HorariosPage() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", horaEntrada: "08:00", horaSalida: "17:00", toleranciaMinutos: 15 });

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/horarios");
      setHorarios(response.data);
    } catch (err) {
      console.error("Error al obtener horarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "toleranciaMinutos" ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await api.post("/horarios", formData);
      cargarHorarios();
      setIsOpen(false);
      setFormData({ nombre: "", horaEntrada: "08:00", horaSalida: "17:00", toleranciaMinutos: 15 });
      toast.success("Horario creado", { description: "El turno se guardó correctamente." });
    } catch (err) {
      console.error("Error al crear el horario:", err);
      toast.danger("Error", { description: "No se pudo guardar el horario." });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarHorario = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este horario?")) return;
    try {
      await api.delete(`/horarios/${id}`);
      cargarHorarios();
      toast.success("Horario eliminado", { description: "El turno se borró del sistema." });
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.warning("No se puede eliminar", { description: err.response.data });
      } else {
        toast.danger("Error", { description: "Ocurrió un error inesperado." });
      }
    }
  };

  const formatearHora = (horaString) => {
    if (!horaString) return "-";
    return horaString.substring(0, 5);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2"><Clock className="w-8 h-8 text-brand-blue" />Gestión de Horarios</h1>
          <p className="text-gray-400 mt-2 text-lg">Configuración de turnos y tolerancias de ingreso</p>
        </div>
        <div className="flex gap-3">
          <button onClick={cargarHorarios} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-all font-medium"><RefreshCw size={18} className={loading ? "animate-spin" : ""} />Sincronizar</button>
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-brand-blue/20 transition-all"><Plus size={18} />Nuevo Horario</button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Nombre Turno</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Hora Entrada</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Hora Salida</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Tolerancia</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando horarios...</td></tr>
              ) : horarios.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No hay horarios configurados.</td></tr>
              ) : (
                horarios.map((horario) => (
                  <tr key={horario.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4"><span className="font-medium text-white">{horario.nombre}</span></td>
                    <td className="p-4 text-gray-300 font-mono">{formatearHora(horario.horaEntrada)}</td>
                    <td className="p-4 text-gray-300 font-mono">{formatearHora(horario.horaSalida)}</td>
                    <td className="p-4"><Chip size="sm" variant="flat" className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{horario.toleranciaMinutos} min</Chip></td>
                    <td className="p-4"><button onClick={() => eliminarHorario(horario.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all text-sm font-medium"><Trash2 size={16} />Eliminar</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="glass-panel bg-[#0B1120]/95 border border-white/10 w-full max-w-md relative z-10 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Agregar Nuevo Turno</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Turno *</label><input required name="nombre" placeholder="Ej: Turno Mañana" value={formData.nombre} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Hora Entrada *</label><input required type="time" name="horaEntrada" value={formData.horaEntrada} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50" /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Hora Salida *</label><input required type="time" name="horaSalida" value={formData.horaSalida} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Tolerancia (minutos) *</label><input required type="number" name="toleranciaMinutos" min={0} value={formData.toleranciaMinutos} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50" /></div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-brand-blue/20 transition-all text-sm">{guardando ? "Guardando..." : "Guardar Horario"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
