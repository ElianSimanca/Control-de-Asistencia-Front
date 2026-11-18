import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Table,
  Button,
  Input,
  TextField,
  Label,
  Modal,
  Chip,
  useOverlayState,
} from "@heroui/react";
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
  const modalState = useOverlayState();

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
    modalState.open();
  };

  const cerrarModal = () => {
    modalState.close();
    limpiarFormulario();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/empleados", {
        nombre,
        documento,
        cargo,
        activo: true,
      });

      const nuevoEmpleado = response.data;

      if (horarioId) {
        await api.put(`/empleados/${nuevoEmpleado.id}/horario/${horarioId}`);
      }

      cerrarModal();
      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar empleado:", err);
      alert("No se pudo guardar el empleado.");
    }
  };

  const abrirEditar = (empleado) => {
    setEditando(empleado);
    setNombre(empleado.nombre || "");
    setDocumento(empleado.documento || "");
    setCargo(empleado.cargo || "");
    setHorarioId(empleado.horario?.id ? String(empleado.horario.id) : "");
    modalState.open();
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/empleados/${editando.id}`, {
        nombre,
        documento,
        cargo,
        activo: editando.activo,
      });

      if (horarioId) {
        await api.put(`/empleados/${editando.id}/horario/${horarioId}`);
      }

      cerrarModal();
      await cargarDatos();
    } catch (err) {
      console.error("Error al actualizar empleado:", err);
      alert("No se pudo actualizar el empleado.");
    }
  };

  const cambiarEstado = async (id) => {
    try {
      await api.put(`/empleados/${id}/estado`);
      await cargarDatos();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo cambiar el estado.");
    }
  };

  // Filtro de búsqueda
  const empleadosFiltrados = empleados.filter(
    (emp) =>
      emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.documento?.includes(busqueda)
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Gestión de Empleados
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Administra el personal registrado en el sistema
          </p>
        </div>

        <Button
          className="bg-brand-blue hover:bg-blue-700 text-white font-semibold shadow-lg shadow-brand-blue/20"
          onPress={abrirNuevo}
        >
          <span className="flex items-center gap-2">
            <Plus size={18} />
            <span>Nuevo Empleado</span>
          </span>
        </Button>
      </div>

      {/* BUSCADOR */}
      <div className="glass-panel p-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all"
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="glass-panel p-2">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Tabla de empleados">
              <Table.Header>
                <Table.Column isRowHeader className="bg-transparent text-gray-400 font-semibold">NOMBRE</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">DOCUMENTO</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">CARGO</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">HORARIO</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">ESTADO</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">ACCIONES</Table.Column>
              </Table.Header>

              <Table.Body
                items={empleadosFiltrados}
                renderEmptyState={() =>
                  loading ? "Cargando empleados..." : "No hay empleados registrados."
                }
              >
                {(emp) => (
                  <Table.Row key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-blue-300 font-bold border border-brand-blue/30 text-sm">
                          {emp.nombre?.charAt(0) || "?"}
                        </div>
                        <span className="font-medium text-white">{emp.nombre}</span>
                      </div>
                    </Table.Cell>

                    <Table.Cell className="text-gray-400 font-mono">
                      {emp.documento}
                    </Table.Cell>

                    <Table.Cell className="text-gray-300">
                      {emp.cargo}
                    </Table.Cell>

                    <Table.Cell>
                      {emp.horario ? (
                        <Chip size="sm" variant="flat" className="bg-brand-blue/10 text-blue-300 border border-brand-blue/20">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{emp.horario.nombre}</span>
                          </span>
                        </Chip>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Sin asignar</span>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      <Chip
                        size="sm"
                        variant="flat"
                        className={
                          emp.activo
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }
                      >
                        <div className="flex items-center gap-1">
                          {emp.activo ? <UserCheck size={14} /> : <UserX size={14} />}
                          <span>{emp.activo ? "Activo" : "Inactivo"}</span>
                        </div>
                      </Chip>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-white/5 hover:bg-white/20 text-white border border-white/10 transition-all"
                          onPress={() => abrirEditar(emp)}
                        >
                          <span>Editar</span>
                        </Button>

                        <Button
                          size="sm"
                          className={
                            emp.activo
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                              : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all"
                          }
                          onPress={() => cambiarEstado(emp.id)}
                        >
                          <span>{emp.activo ? "Desactivar" : "Activar"}</span>
                        </Button>
                      </div>
                    </Table.Cell>

                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {/* MODAL (Diseño Dark Corporativo) */}
      <Modal state={modalState}>
        <Modal.Backdrop className="backdrop-blur-sm bg-black/60">
          <Modal.Container placement="center">
            <Modal.Dialog className="glass-panel bg-[#0B1120]/90 border border-white/10">
              {({ close }) => (
                <form onSubmit={editando ? handleActualizar : handleSubmit}>
                  
                  <Modal.Header>
                    <Modal.Heading className="text-white text-xl font-bold">
                      {editando ? "Editar Empleado" : "Registrar Nuevo Empleado"}
                    </Modal.Heading>
                  </Modal.Header>

                  <Modal.Body className="flex flex-col gap-4 py-6">
                    
                    <TextField isRequired>
                      <Label className="text-gray-300 font-medium mb-1">Nombre completo</Label>
                      <Input
                        placeholder="Ej. Juan Pérez"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-blue/50"
                      />
                    </TextField>

                    <TextField isRequired>
                      <Label className="text-gray-300 font-medium mb-1">Documento de identidad</Label>
                      <Input
                        placeholder="Ej. 1045123456"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-blue/50"
                      />
                    </TextField>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Cargo <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      >
                        <option value="" disabled className="bg-[#0B1120]">Seleccionar cargo</option>
                        <option value="Empleado" className="bg-[#0B1120]">Empleado</option>
                        <option value="Administrador" className="bg-[#0B1120]">Administrador</option>
                        <option value="Directivo" className="bg-[#0B1120]">Directivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Horario
                      </label>
                      <select
                        value={horarioId}
                        onChange={(e) => setHorarioId(e.target.value)}
                        className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      >
                        <option value="" className="bg-[#0B1120]">Seleccionar horario</option>
                        {horarios.map((horario) => (
                          <option key={horario.id} value={String(horario.id)} className="bg-[#0B1120]">
                            {horario.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Modal.Body>

                  <Modal.Footer>
                    <Button
                      type="button"
                      className="bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      onPress={() => {
                        close();
                        limpiarFormulario();
                      }}
                    >
                      <span>Cancelar</span>
                    </Button>

                    <Button 
                      type="submit" 
                      className="bg-brand-blue hover:bg-blue-700 text-white font-semibold shadow-lg shadow-brand-blue/20"
                    >
                      <span>{editando ? "Guardar Cambios" : "Guardar Empleado"}</span>
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
