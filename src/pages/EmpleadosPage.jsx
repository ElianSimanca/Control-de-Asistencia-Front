import { useEffect, useState } from "react";
import api from "../api/axios";
import { Chip, toast } from "@heroui/react";
import { Plus, UserCheck, UserX, Clock, Search } from "lucide-react";

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [cargo, setCargo] = useState("");
  const [horarioId, setHorarioId] = useState("");
  const [editando, setEditando] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resEmpleados, resHorarios] = await Promise.all([
        api.get("/empleados"),
        api.get("/horarios"),
      ]);
      setEmpleados(resEmpleados.data);
      setHorarios(resHorarios.data);
    } catch (err) {
      console.error("Error al obtener los datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setDocumento("");
    setCargo("");
    setHorarioId("");
    setEditando(null);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setIsModalOpen(true);
  };

  const abrirEditar = (empleado) => {
    setEditando(empleado);
    setNombre(empleado.nombre || "");
    setDocumento(empleado.documento || "");
    setCargo(empleado.cargo || "");
    setHorarioId(empleado.horario?.id ? String(empleado.horario.id) : "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editando) {
      const existe = empleados.find((emp) => emp.documento === documento);
      if (existe) {
        toast.warning("Documento duplicado", { description: "Ya existe un empleado con este documento." });
        return;
      }
    }

    try {
      if (editando) {
        await api.put(`/empleados/${editando.id}`, { nombre, documento, cargo, activo: editando.activo });
        if (horarioId) await api.put(`/empleados/${editando.id}/horario/${horarioId}`);
        toast.success("Empleado actualizado", { description: "Los datos se guardaron correctamente." });
      } else {
        const response = await api.post("/empleados", { nombre, documento, cargo, activo: true });
        const nuevoEmpleado = response.data;
        if (horarioId) await api.put(`/empleados/${nuevoEmpleado.id}/horario/${horarioId}`);
        toast.success("Empleado registrado", { description: "El empleado se guardó correctamente." });
      }
      setIsModalOpen(false);
      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar empleado:", err);
      toast.danger("Error", { description: "No se pudo guardar el empleado." });
    }
  };

  const cambiarEstado = async (id) => {
    try {
      await api.put(`/empleados/${id}/estado`);
      await cargarDatos();
      toast.success("Estado cambiado", { description: "El estado del empleado se modificó." });
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      toast.danger("Error", { description: "No se pudo cambiar el estado." });
    }
  };

  const empleadosFiltrados = empleados.filter(
    (emp) => emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || emp.documento?.includes(busqueda)
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Empleados</h1>
          <p className="text-gray-400 mt-2 text-lg">Administra el personal registrado en el sistema</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-brand-blue/20 transition-all">
          <Plus size={18} /> Nuevo Empleado
        </button>
      </div>

      <div className="glass-panel p-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="Buscar por nombre o documento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all" />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Nombre</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Documento</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Cargo</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Horario</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Estado</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {empleadosFiltrados.map((emp) => (
                <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-blue-300 font-bold border border-brand-blue/30 text-sm">{emp.nombre?.charAt(0) || "?"}</div>
                      <span className="font-medium text-white">{emp.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 font-mono">{emp.documento}</td>
                  <td className="p-4 text-gray-300">{emp.cargo}</td>
                  <td className="p-4">
                    {emp.horario ? (
                      <Chip size="sm" variant="flat" className="bg-brand-blue/10 text-blue-300 border border-brand-blue/20">
                        <span className="flex items-center gap-1"><Clock size={12} />{emp.horario.nombre}</span>
                      </Chip>
                    ) : (
                      <span className="text-gray-500 text-sm italic">Sin asignar</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Chip size="sm" variant="flat" className={emp.activo ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}>
                      <div className="flex items-center gap-1">
                        {emp.activo ? <UserCheck size={14} /> : <UserX size={14} />}
                        <span>{emp.activo ? "Activo" : "Inactivo"}</span>
                      </div>
                    </Chip>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditar(emp)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all text-sm">Editar</button>
                      <button onClick={() => cambiarEstado(emp.id)} className={`px-3 py-1.5 rounded-lg border transition-all text-sm ${emp.activo ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"}`}>
                        {emp.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-panel bg-[#0B1120]/95 border border-white/10 w-full max-w-md relative z-10 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">{editando ? "Editar Empleado" : "Registrar Nuevo Empleado"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre completo *</label>
                <input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Documento de identidad *</label>
                <input required value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Ej. 1045123456" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cargo *</label>
                <select required value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50">
                  <option value="" disabled className="bg-[#0B1120]">Seleccionar cargo</option>
                  <option value="Empleado" className="bg-[#0B1120]">Empleado</option>
                  <option value="Administrador" className="bg-[#0B1120]">Administrador</option>
                  <option value="Directivo" className="bg-[#0B1120]">Directivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Horario</label>
                <select value={horarioId} onChange={(e) => setHorarioId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue/50">
                  <option value="" className="bg-[#0B1120]">Seleccionar horario</option>
                  {horarios.map((horario) => (
                    <option key={horario.id} value={String(horario.id)} className="bg-[#0B1120]">{horario.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-brand-blue/20 transition-all text-sm">{editando ? "Guardar Cambios" : "Guardar Empleado"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
