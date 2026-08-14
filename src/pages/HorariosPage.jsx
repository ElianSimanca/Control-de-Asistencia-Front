import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Table,
  Button,
  Input,
  TextField,
  Label,
  Modal,
  Chip
} from "@heroui/react";
import { Plus, RefreshCw, Clock, Trash2 } from "lucide-react";

export default function HorariosPage() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Control del modal al estilo de tu EmpleadosPage
  const [isOpen, setIsOpen] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    horaEntrada: "08:00",
    horaSalida: "17:00",
    toleranciaMinutos: 15,
  });

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
    setFormData((prev) => ({
      ...prev,
      [name]: name === "toleranciaMinutos" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await api.post("/horarios", formData);
      cargarHorarios();
      setIsOpen(false);
      // Reset del formulario
      setFormData({
        nombre: "",
        horaEntrada: "08:00",
        horaSalida: "17:00",
        toleranciaMinutos: 15,
      });
    } catch (err) {
      console.error("Error al crear el horario:", err);
      alert("No se pudo guardar el horario.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarHorario = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este horario?")) return;
    
    try {
      await api.delete(`/horarios/${id}`);
      cargarHorarios();
    } catch (err) {
      console.error("Error al eliminar el horario:", err);
    }
  };

  const formatearHora = (horaString) => {
    if (!horaString) return "-";
    return horaString.substring(0, 5); 
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Gestión de Horarios
          </h1>
          <p className="text-gray-500">
            Configuración de turnos y tolerancias de ingreso
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onPress={cargarHorarios}
          >
            <RefreshCw size={18} />
            Actualizar
          </Button>

          <Button 
            color="primary" 
            onPress={() => setIsOpen(true)}
          >
            <Plus size={18} />
            Nuevo Horario
          </Button>
        </div>
      </div>

      {/* Tabla de Horarios */}
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Tabla de horarios">
            <Table.Header>
              <Table.Column isRowHeader>ID</Table.Column>
              <Table.Column>NOMBRE TURNO</Table.Column>
              <Table.Column>HORA ENTRADA</Table.Column>
              <Table.Column>HORA SALIDA</Table.Column>
              <Table.Column>TOLERANCIA</Table.Column>
              <Table.Column>ACCIONES</Table.Column>
            </Table.Header>

            <Table.Body
              items={horarios}
              renderEmptyState={() =>
                loading
                  ? "Cargando horarios..."
                  : "No hay horarios configurados."
              }
            >
              {(horario) => (
                <Table.Row id={horario.id}>
                  <Table.Cell>{horario.id}</Table.Cell>
                  <Table.Cell className="font-semibold">
                    {horario.nombre}
                  </Table.Cell>
                  <Table.Cell>{formatearHora(horario.horaEntrada)}</Table.Cell>
                  <Table.Cell>{formatearHora(horario.horaSalida)}</Table.Cell>
                  <Table.Cell>
                    <Chip color="warning">
                      {horario.toleranciaMinutos} min
                    </Chip>
                  </Table.Cell>
                  <Table.Cell>
                    <Button 
                      size="sm"
                      color="danger" 
                      onPress={() => eliminarHorario(horario.id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Eliminar
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {/* Modal para Crear Horario (Sintaxis exacta a EmpleadosPage) */}
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Container placement="center">
            <Modal.Dialog>
              {({ close }) => (
                <form onSubmit={handleSubmit}>
                  <Modal.Header>
                    <Modal.Heading>Agregar Nuevo Turno</Modal.Heading>
                  </Modal.Header>

                  <Modal.Body>
                    <TextField isRequired>
                      <Label>Nombre del Turno</Label>
                      <Input
                        name="nombre"
                        placeholder="Ej: Turno Mañana"
                        value={formData.nombre}
                        onChange={handleChange}
                      />
                    </TextField>

                    <div className="grid grid-cols-2 gap-4">
                      <TextField isRequired>
                        <Label>Hora de Entrada</Label>
                        <Input
                          type="time"
                          name="horaEntrada"
                          value={formData.horaEntrada}
                          onChange={handleChange}
                        />
                      </TextField>

                      <TextField isRequired>
                        <Label>Hora de Salida</Label>
                        <Input
                          type="time"
                          name="horaSalida"
                          value={formData.horaSalida}
                          onChange={handleChange}
                        />
                      </TextField>
                    </div>

                    <TextField isRequired>
                      <Label>Tolerancia (minutos)</Label>
                      <Input
                        type="number"
                        name="toleranciaMinutos"
                        placeholder="15"
                        value={formData.toleranciaMinutos}
                        onChange={handleChange}
                        min={0}
                      />
                    </TextField>
                  </Modal.Body>

                  <Modal.Footer>
                    <Button variant="secondary" onPress={close}>
                      Cancelar
                    </Button>
                    <Button color="primary" type="submit">
                      {guardando ? "Guardando..." : "Guardar Horario"}
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