import { useEffect, useState } from "react";
import api from "../api/axios";
import {
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
  const [isOpen, setIsOpen] = useState(false);

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
      if (err.response && err.response.status === 409) {
        alert(err.response.data);
      } else {
        console.error("Error al eliminar el horario:", err);
        alert("Ocurrió un error inesperado al intentar eliminar el horario.");
      }
    }
  };

  const formatearHora = (horaString) => {
    if (!horaString) return "-";
    return horaString.substring(0, 5); 
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-8 h-8 text-brand-blue" />
            Gestión de Horarios
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Configuración de turnos y tolerancias de ingreso
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            className="bg-white/10 text-white font-medium border border-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-md"
            onPress={cargarHorarios}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Sincronizar
          </Button>

          <Button 
            className="bg-brand-blue hover:bg-blue-700 text-white font-semibold shadow-lg shadow-brand-blue/20"
            onPress={() => setIsOpen(true)}
          >
            <Plus size={18} />
            Nuevo Horario
          </Button>
        </div>
      </div>

      {/* TABLA NATIVA */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Nombre Turno</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Hora Entrada</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Hora Salida</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Tolerancia</th>
                <th className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Cargando horarios...</td>
                </tr>
              ) : horarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No hay horarios configurados.</td>
                </tr>
              ) : (
                horarios.map((horario) => (
                  <tr key={horario.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <span className="font-medium text-white">{horario.nombre}</span>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">
                      {formatearHora(horario.horaEntrada)}
                    </td>
                    <td className="p-4 text-gray-300 font-mono">
                      {formatearHora(horario.horaSalida)}
                    </td>
                    <td className="p-4">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      >
                        {horario.toleranciaMinutos} min
                      </Chip>
                    </td>
                    <td className="p-4">
                      <Button 
                        size="sm"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                        onPress={() => eliminarHorario(horario.id)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen} className="backdrop-blur-sm bg-black/60">
          <Modal.Container placement="center">
            <Modal.Dialog className="glass-panel bg-[#0B1120]/90 border border-white/10">
              {({ close }) => (
                <form onSubmit={handleSubmit}>
                  <Modal.Header>
                    <Modal.Heading className="text-white text-xl font-bold">Agregar Nuevo Turno</Modal.Heading>
                  </Modal.Header>

                  <Modal.Body className="flex flex-col gap-4 py-6">
                    <TextField isRequired>
                      <Label className="text-gray-300 font-medium mb-1">Nombre del Turno</Label>
                      <Input
                        name="nombre"
                        placeholder="Ej: Turno Mañana"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-blue/50"
                      />
                    </TextField>

                    <div className="grid grid-cols-2 gap-4">
                      <TextField isRequired>
                        <Label className="text-gray-300 font-medium mb-1">Hora de Entrada</Label>
                        <Input
                          type="time"
                          name="horaEntrada"
                          value={formData.horaEntrada}
                          onChange={handleChange}
                          className="bg-white/5 border border-white/10 text-white focus:border-brand-blue/50"
                        />
                      </TextField>

                      <TextField isRequired>
                        <Label className="text-gray-300 font-medium mb-1">Hora de Salida</Label>
                        <Input
                          type="time"
                          name="horaSalida"
                          value={formData.horaSalida}
                          onChange={handleChange}
                          className="bg-white/5 border border-white/10 text-white focus:border-brand-blue/50"
                        />
                      </TextField>
                    </div>

                    <TextField isRequired>
                      <Label className="text-gray-300 font-medium mb-1">Tolerancia (minutos)</Label>
                      <Input
                        type="number"
                        name="toleranciaMinutos"
                        placeholder="15"
                        value={formData.toleranciaMinutos}
                        onChange={handleChange}
                        min={0}
                        className="bg-white/5 border border-white/10 text-white focus:border-brand-blue/50"
                      />
                    </TextField>
                  </Modal.Body>

                  <Modal.Footer>
                    <Button className="bg-white/5 text-white hover:bg-white/10 border border-white/10" onPress={close}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-brand-blue hover:bg-blue-700 text-white font-semibold">
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
