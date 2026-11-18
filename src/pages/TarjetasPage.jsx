import { addToast } from "@heroui/react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Button,
  Label,
  Modal,
  Chip,
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
      alert("Seleccione un empleado.");
      return;
    }

    try {
      await api.put(`/cards/${tarjetaSeleccionada.id}/assign`, {
        empleadoId: Number(empleadoId),
      });
      setTarjetaSeleccionada(null);
      setEmpleadoId("");
      setIsOpen(false);
      await cargarDatos();
    } catch (err) {
      console.error("Error al asignar tarjeta:", err);
      if (err.response?.status === 409) {
        alert("El empleado ya tiene una tarjeta asignada.");
      } else {
        alert("No se pudo asignar la tarjeta.");
      }
    }
  };

  const desasignarTarjeta = async (tarjeta) => {
    const confirmar = window.confirm(`¿Desasignar la tarjeta ${tarjeta.uid}?`);
    if (!confirmar) return;

    try {
      await api.put(`/cards/${tarjeta.id}/unassign`);
      await cargarDatos();
    } catch (err) {
      console.error("Error al desasignar:", err);
      alert("No se pudo desasignar la tarjeta.");
    }
  };

  const cambiarEstado = async (tarjeta) => {
    try {
      const endpoint = tarjeta.activa
        ? `/cards/${tarjeta.id}/deactivate`
        : `/cards/${tarjeta.id}/activate`;
      await api.put(endpoint);
      await cargarDatos();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo cambiar el estado.");
    }
  };

  const eliminarTarjeta = async (tarjeta) => {
    const confirmar = window.confirm(`¿Eliminar la tarjeta ${tarjeta.uid}?`);
    if (!confirmar) return;

    try {
      await api.delete(`/cards/${tarjeta.id}`);
      await cargarDatos();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar la tarjeta.");
    }
  };

  const tarjetasFiltradas = tarjetas.filter(
    (t) =>
      t.uid?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.empleado?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Gestión de Tarjetas RFID
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Las tarjetas se registran automáticamente al pasar por el lector.
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="glass-panel p-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por UID o nombre de empleado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all"
          />
        </div>
      </div>

      {/* TABLA NATIVA (SIN HEROUI) */}
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
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Cargando tarjetas...
                  </td>
                </tr>
              ) : tarjetasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No hay tarjetas registradas.
                  </td>
                </tr>
              ) : (
                tarjetasFiltradas.map((tarjeta) => (
                  <tr key={tarjeta.id} className="hover:bg-white/5 transition-colors group">
                    
                    {/* UID */}
                    <td className="p-4">
                      <span className="font-mono text-white font-medium tracking-widest bg-white/5 px-3 py-1 rounded-md border border-white/10">
                        {tarjeta.uid}
                      </span>
                    </td>

                    {/* EMPLEADO */}
                    <td className="p-4">
                      {tarjeta.empleado?.nombre ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-blue/20 flex items-center justify-center text-blue-300 font-bold border border-brand-blue/30 text-xs">
                            {tarjeta.empleado.nombre.charAt(0)}
                          </div>
                          <span className="text-gray-300">{tarjeta.empleado.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-yellow-500/70 text-sm flex items-center gap-1">
                          <Unlink size={14} /> Sin asignar
                        </span>
                      )}
                    </td>

                    {/* DOCUMENTO */}
                    <td className="p-4">
                      <span className="text-gray-400 font-mono">
                        {tarjeta.empleado?.documento || "-"}
                      </span>
                    </td>

                    {/* ESTADO */}
                    <td className="p-4">
                      <Chip
                        size="sm"
                        variant="flat"
                        className={
                          tarjeta.activa
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }
                      >
                        {tarjeta.activa ? "Activa" : "Inactiva"}
                      </Chip>
                    </td>

                    {/* ACCIONES */}
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {!tarjeta.empleado && (
                          <Button
                            size="sm"
                            className="bg-brand-blue/10 hover:bg-brand-blue/20 text-blue-400 border border-brand-blue/20 transition-all"
                            onPress={() => abrirAsignacion(tarjeta)}
                          >
                            <LinkIcon size={14} className="mr-1" /> Asignar
                          </Button>
                        )}

                        {tarjeta.empleado && (
                          <Button
                            size="sm"
                            className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
                            onPress={() => desasignarTarjeta(tarjeta)}
                          >
                            <Unlink size={14} className="mr-1" /> Desasignar
                          </Button>
                        )}

                        <Button
                          size="sm"
                          className={
                            tarjeta.activa
                              ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 transition-all"
                              : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all"
                          }
                          onPress={() => cambiarEstado(tarjeta)}
                        >
                          {tarjeta.activa ? <ShieldAlert size={14} className="mr-1" /> : <ShieldCheck size={14} className="mr-1" />}
                          {tarjeta.activa ? "Desactivar" : "Activar"}
                        </Button>

                        <Button
                          size="sm"
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                          onPress={() => eliminarTarjeta(tarjeta)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ASIGNACIÓN */}
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          className="backdrop-blur-sm bg-black/60"
        >
          <Modal.Container placement="center">
            <Modal.Dialog className="glass-panel bg-[#0B1120]/90 border border-white/10">
              {({ close }) => (
                <form onSubmit={asignarTarjeta}>
                  
                  <Modal.Header>
                    <Modal.Heading className="text-white text-xl font-bold">
                      Asignar Tarjeta RFID
                    </Modal.Heading>
                  </Modal.Header>

                  <Modal.Body className="flex flex-col gap-4 py-6">
                    {tarjetaSeleccionada && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-sm text-gray-400">Tarjeta detectada</p>
                        <p className="font-mono text-xl font-bold text-white tracking-widest mt-1">
                          {tarjetaSeleccionada.uid}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          ID interno: {tarjetaSeleccionada.id}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-gray-300 font-medium mb-1">Empleado</Label>
                      <select
                        className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all"
                        value={empleadoId}
                        onChange={(e) => setEmpleadoId(e.target.value)}
                        required
                      >
                        <option value="" className="bg-[#0B1120]">Seleccione un empleado</option>
                        {empleados
                          .filter((empleado) => empleado.activo)
                          .map((empleado) => (
                            <option key={empleado.id} value={empleado.id} className="bg-[#0B1120]">
                              {empleado.nombre} - {empleado.documento}
                            </option>
                          ))}
                      </select>
                    </div>
                  </Modal.Body>

                  <Modal.Footer>
                    <Button
                      type="button"
                      className="bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      onPress={close}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-brand-blue hover:bg-blue-700 text-white font-semibold shadow-lg shadow-brand-blue/20"
                    >
                      Asignar Tarjeta
                    </Button>
                  </Modal.Footer>

                </form>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

    </div>
  );
}
