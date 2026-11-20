import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Label,
  Modal,
  Chip,
  toast,
} from "@heroui/react";
import { Search, Link as LinkIcon, Unlink, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";

export default function TarjetasPage() {
  const [tarjetas, setTarjetas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null);
  const [empleadoId, setEmpleadoId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const cargarDatos = async () => {
    try {
      const [tarjetasResponse, empleadosResponse] = await Promise.all([
        api.get("/cards"),
        api.get("/empleados"),
      ]);
      setTarjetas(tarjetasResponse.data);
      setEmpleados(empleadosResponse.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirAsignacion = (tarjeta) => {
    setTarjetaSeleccionada(tarjeta);
    setEmpleadoId("");
    setIsOpen(true);
  };

  const asignarTarjeta = async (e) => {
    e.preventDefault();
    if (!tarjetaSeleccionada || !empleadoId) {
      toast.warning("Atención", { description: "Seleccione un empleado." });
      return;
    }

    try {
      await api.put(`/cards/${tarjetaSeleccionada.id}/assign`, { empleadoId: Number(empleadoId) });
      setTarjetaSeleccionada(null);
      setEmpleadoId("");
      setIsOpen(false);
      await cargarDatos();
      toast.success("Tarjeta asignada", { description: "La tarjeta se vinculó al empleado correctamente." });
    } catch (err) {
      console.error("Error al asignar tarjeta:", err);
      if (err.response?.status === 409) {
        toast.warning("Conflicto", { description: "El empleado ya tiene una tarjeta asignada." });
      } else {
        toast.danger("Error", { description: "No se pudo asignar la tarjeta." });
      }
    }
  };

  const desasignarTarjeta = async (tarjeta) => {
    const confirmar = window.confirm(`¿Desasignar la tarjeta ${tarjeta.uid}?`);
    if (!confirmar) return;
    try {
      await api.put(`/cards/${tarjeta.id}/unassign`);
      await cargarDatos();
      toast.success("Tarjeta desasignada", { description: "La tarjeta ha quedado libre." });
    } catch (err) {
      console.error("Error al desasignar:", err);
      toast.danger("Error", { description: "No se pudo desasignar la tarjeta." });
    }
  };

  const cambiarEstado = async (tarjeta) => {
    try {
      const endpoint = tarjeta.activa ? `/cards/${tarjeta.id}/deactivate` : `/cards/${tarjeta.id}/activate`;
      await api.put(endpoint);
      await cargarDatos();
      toast.success("Estado actualizado", { description: "El estado de la tarjeta ha cambiado." });
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      toast.danger("Error", { description: "No se pudo cambiar el estado." });
    }
  };

  const eliminarTarjeta = async (tarjeta) => {
    const confirmar = window.confirm(`¿Eliminar la tarjeta ${tarjeta.uid}?`);
    if (!confirmar) return;
    try {
      await api.delete(`/cards/${tarjeta.id}`);
      await cargarDatos();
      toast.success("Tarjeta eliminada", { description: "La tarjeta se borró del sistema." });
    } catch (err) {
      console.error("Error al eliminar:", err);
      toast.danger("Error", { description: "No se pudo eliminar la tarjeta." });
    }
  };

  const tarjetasFiltradas = tarjetas.filter(
    (t) => t.uid?.toLowerCase().includes(busqueda.toLowerCase()) || t.empleado?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Tarjetas RFID</h1>
          <p className="text-gray-400 mt-2 text-lg">Las tarjetas se registran automáticamente al pasar por el lector.</p>
        </div>
      </div>

      <div className="glass-panel p-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="Buscar por UID o nombre de empleado..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all" />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">UID Tarjeta</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Empleado</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Documento</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando tarjetas...</td></tr>
              ) : tarjetasFiltradas.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No hay tarjetas registradas.</td></tr>
              ) : (
                tarjetasFiltradas.map((tarjeta) => (
                  <tr key={tarjeta.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-white font-medium tracking-widest bg-white/5 px-3 py-1 rounded-md border border-white/10">{tarjeta.uid}</span>
                    </td>
                    <td className="p-4">
                      {tarjeta.empleado?.nombre ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-blue/20 flex items-center justify-center text-blue-300 font-bold border border-brand-blue/30 text-xs">{tarjeta.empleado.nombre.charAt(0)}</div>
                          <span className="text-gray-300">{tarjeta.empleado.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-yellow-500/70 text-sm flex items-center gap-1"><Unlink size={14} /> Sin asignar</span>
                      )}
                    </td>
                    <td className="p-4"><span className="text-gray-400 font-mono">{tarjeta.empleado?.documento || "-"}</span></td>
                    <td className="p-4">
                      <Chip size="sm" variant="flat" className={tarjeta.activa ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}>
                        {tarjeta.activa ? "Activa" : "Inactiva"}
                      </Chip>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {!tarjeta.empleado && (
                          <button 
                            onClick={() => abrirAsignacion(tarjeta)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-brand-blue/20 hover:bg-brand-blue/30 text-blue-400 rounded-lg border border-brand-blue/30 transition-all text-sm font-medium"
                          >
                            <LinkIcon size={14} /> Asignar
                          </button>
                        )}
                        {tarjeta.empleado && (
                          <button 
                            onClick={() => desasignarTarjeta(tarjeta)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg border border-white/10 transition-all text-sm font-medium"
                          >
                            <Unlink size={14} /> Desasignar
                          </button>
                        )}
                        <button 
                          onClick={() => cambiarEstado(tarjeta)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                            tarjeta.activa 
                              ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20" 
                              : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"
                          }`}
                        >
                          {tarjeta.activa ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                          {tarjeta.activa ? "Desactivar" : "Activar"}
                        </button>
                        <button 
                          onClick={() => eliminarTarjeta(tarjeta)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all text-sm font-medium"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NATIVO HTML */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Fondo oscuro con desenfoque */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Contenido del Modal */}
          <div className="glass-panel bg-[#0B1120]/95 border border-white/10 w-full max-w-md relative z-10 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Asignar Tarjeta RFID</h2>
            
            <form onSubmit={asignarTarjeta} className="flex flex-col gap-4">
              {tarjetaSeleccionada && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-400">Tarjeta detectada</p>
                  <p className="font-mono text-xl font-bold text-white tracking-widest mt-1">{tarjetaSeleccionada.uid}</p>
                  <p className="text-xs text-gray-500 mt-2">ID interno: {tarjetaSeleccionada.id}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Empleado</label>
                <select 
                  className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all" 
                  value={empleadoId} 
                  onChange={(e) => setEmpleadoId(e.target.value)} 
                  required
                >
                  <option value="" className="bg-[#0B1120]">Seleccione un empleado</option>
                  {empleados.filter((empleado) => empleado.activo).map((empleado) => (
                    <option key={empleado.id} value={empleado.id} className="bg-[#0B1120]">
                      {empleado.nombre} - {empleado.documento}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-brand-blue/20 transition-all text-sm"
                >
                  Asignar Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
