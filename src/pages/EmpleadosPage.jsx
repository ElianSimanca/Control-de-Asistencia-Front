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
import { Plus, UserCheck, UserX, Clock } from "lucide-react";

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

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
        await api.put(
          `/empleados/${nuevoEmpleado.id}/horario/${horarioId}`
        );
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

    setHorarioId(
      empleado.horario?.id
        ? String(empleado.horario.id)
        : ""
    );

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
        await api.put(
          `/empleados/${editando.id}/horario/${horarioId}`
        );
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Gestión de Empleados
        </h1>

        <Button color="primary" onPress={abrirNuevo}>
          {/* Se envuelve el contenido en un span/div para evitar el error de PressResponder */}
          <span className="flex items-center gap-2">
            <Plus size={18} />
            <span>Nuevo Empleado</span>
          </span>
        </Button>
      </div>

      <Table>
  <Table.ScrollContainer>
    <Table.Content aria-label="Tabla de empleados">
      <Table.Header>
        <Table.Column isRowHeader><span>NOMBRE</span></Table.Column>
        <Table.Column><span>DOCUMENTO</span></Table.Column>
        <Table.Column><span>CARGO</span></Table.Column>
        <Table.Column><span>HORARIO</span></Table.Column>
        <Table.Column><span>ESTADO</span></Table.Column>
        <Table.Column><span>ACCIONES</span></Table.Column>
      </Table.Header>

      <Table.Body
        items={empleados}
        renderEmptyState={() =>
          loading
            ? "Cargando empleados..."
            : "No hay empleados registrados."
        }
      >
        {(emp) => (
          <Table.Row id={String(emp.id)}>

            <Table.Cell>
              <span>{emp.nombre}</span>
            </Table.Cell>

            <Table.Cell>
              <span>{emp.documento}</span>
            </Table.Cell>

            <Table.Cell>
              <span>{emp.cargo}</span>
            </Table.Cell>

            <Table.Cell>
              {emp.horario ? (
                <Chip color="primary" size="sm">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{emp.horario.nombre}</span>
                  </span>
                </Chip>
              ) : (
                <span className="text-gray-400 text-sm">
                  Sin asignar
                </span>
              )}
            </Table.Cell>

            <Table.Cell>
              <Chip
                color={emp.activo ? "success" : "danger"}
                size="sm"
              >
                <div className="flex items-center gap-1">
                  {emp.activo ? (
                    <>
                      <UserCheck size={14} />
                      <span>Activo</span>
                    </>
                  ) : (
                    <>
                      <UserX size={14} />
                      <span>Inactivo</span>
                    </>
                  )}
                </div>
              </Chip>
            </Table.Cell>

            <Table.Cell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => abrirEditar(emp)}
                >
                  <span>Editar</span>
                </Button>

                <Button
                  size="sm"
                  color={emp.activo ? "danger" : "success"}
                  onPress={() => cambiarEstado(emp.id)}
                >
                  <span>
                    {emp.activo ? "Desactivar" : "Activar"}
                  </span>
                </Button>
              </div>
            </Table.Cell>

          </Table.Row>
        )}
      </Table.Body>
    </Table.Content>
  </Table.ScrollContainer>
</Table>

      <Modal state={modalState}>
        <Modal.Backdrop>
          <Modal.Container placement="center">
            <Modal.Dialog>
              {({ close }) => (
                <form
                  onSubmit={
                    editando ? handleActualizar : handleSubmit
                  }
                >
                  <Modal.Header>
                    <Modal.Heading>
                      <span>
                        {editando
                          ? "Editar Empleado"
                          : "Registrar Nuevo Empleado"}
                      </span>
                    </Modal.Heading>
                  </Modal.Header>

                  <Modal.Body>
                    <TextField isRequired>
                      <Label>Nombre completo</Label>
                      <Input
                        placeholder="Ej. Juan Pérez"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </TextField>

                    <TextField isRequired>
                      <Label>Documento de identidad</Label>
                      <Input
                        placeholder="Ej. 1045123456"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                      />
                    </TextField>

                    <TextField isRequired>
                      <Label>Cargo</Label>
                      <Input
                        placeholder="Ej. Administrador"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                      />
                    </TextField>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Horario
                      </label>
                      <select
                        value={horarioId}
                        onChange={(e) => setHorarioId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="">
                          Seleccionar horario
                        </option>
                        {horarios.map((horario) => (
                          <option
                            key={horario.id}
                            value={String(horario.id)}
                          >
                            {horario.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Modal.Body>

                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      type="button"
                      onPress={() => {
                        close();
                        limpiarFormulario();
                      }}
                    >
                      <span>Cancelar</span>
                    </Button>

                    <Button color="primary" type="submit">
                      <span>
                        {editando
                          ? "Guardar Cambios"
                          : "Guardar Empleado"}
                      </span>
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