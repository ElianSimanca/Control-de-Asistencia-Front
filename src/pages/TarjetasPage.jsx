import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Table,
  Button,
  TextField,
  Input,
  Label,
  Modal,
  Chip,
} from "@heroui/react";

export default function TarjetasPage() {
  const [tarjetas, setTarjetas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uid, setUid] = useState("");
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

  const asignarTarjeta = async (e) => {
    e.preventDefault();

    try {
      await api.post("/cards/assign", {
        uid,
        empleadoId: Number(empleadoId),
      });

      setUid("");
      setEmpleadoId("");
      setIsOpen(false);

      cargarDatos();
    } catch (err) {
      console.error("Error al asignar tarjeta:", err);
      alert("No se pudo asignar la tarjeta.");
    }
  };

  const cambiarEstado = async (tarjeta) => {
    try {
      const endpoint = tarjeta.activa
        ? `/cards/${tarjeta.uid}/deactivate`
        : `/cards/${tarjeta.uid}/activate`;

      await api.put(endpoint);

      cargarDatos();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo cambiar el estado de la tarjeta.");
    }
  };

  const eliminarTarjeta = async (tarjeta) => {
  const confirmar = window.confirm(
    `¿Eliminar la tarjeta ${tarjeta.uid}?`
  );

  if (!confirmar) return;

  try {
    await api.delete(`/cards/${tarjeta.uid}`);
    await cargarDatos();
  } catch (err) {
    console.error("Error al eliminar tarjeta:", err);
    alert("No se pudo eliminar la tarjeta.");
  }
};

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Gestión de Tarjetas RFID
        </h1>

        <Button
          color="primary"
          onPress={() => setIsOpen(true)}
        >
          Asignar Tarjeta
        </Button>
      </div>

      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Tabla de tarjetas">

            <Table.Header>
              <Table.Column isRowHeader>ID</Table.Column>
              <Table.Column>UID</Table.Column>
              <Table.Column>EMPLEADO</Table.Column>
              <Table.Column>DOCUMENTO</Table.Column>
              <Table.Column>ESTADO</Table.Column>
              <Table.Column>ACCIONES</Table.Column>
            </Table.Header>

            <Table.Body
              items={tarjetas}
              renderEmptyState={() =>
                loading
                  ? "Cargando tarjetas..."
                  : "No hay tarjetas registradas."
              }
            >
              {(tarjeta) => (
                <Table.Row id={tarjeta.id}>

                  <Table.Cell>
                    {tarjeta.id}
                  </Table.Cell>

                  <Table.Cell>
                    <span className="font-mono">
                      {tarjeta.uid}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    {tarjeta.empleado?.nombre ?? "Sin empleado"}
                  </Table.Cell>

                  <Table.Cell>
                    {tarjeta.empleado?.documento ?? "-"}
                  </Table.Cell>

                  <Table.Cell>
                    <Chip
                      color={
                        tarjeta.activa
                          ? "success"
                          : "danger"
                      }
                    >
                      {tarjeta.activa
                        ? "Activa"
                        : "Inactiva"}
                    </Chip>
                  </Table.Cell>

                  <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color={
                        tarjeta.activa
                          ? "danger"
                          : "success"
                      }
                      onPress={() =>
                        cambiarEstado(tarjeta)
                      }
                    >
                      {tarjeta.activa
                        ? "Desactivar"
                        : "Activar"}
                    </Button>

                    <Button
                      size="sm"
                      color="danger"
                      variant="secondary"
                      onPress={() =>
                        eliminarTarjeta(tarjeta)
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                </Table.Cell>

                </Table.Row>
              )}
            </Table.Body>

          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        >
          <Modal.Container placement="center">
            <Modal.Dialog>

              {({ close }) => (
                <form onSubmit={asignarTarjeta}>

                  <Modal.Header>
                    <Modal.Heading>
                      Asignar Tarjeta RFID
                    </Modal.Heading>
                  </Modal.Header>

                  <Modal.Body>

                    <TextField isRequired>
                      <Label>UID de la tarjeta</Label>
                      <Input
                        placeholder="Ej. A1B2C3D4"
                        value={uid}
                        onChange={(e) =>
                          setUid(e.target.value)
                        }
                      />
                    </TextField>

                    <TextField isRequired>
                      <Label>Empleado</Label>

                      <select
                        className="w-full border rounded-lg p-2"
                        value={empleadoId}
                        onChange={(e) =>
                          setEmpleadoId(e.target.value)
                        }
                      >
                        <option value="">
                          Seleccione un empleado
                        </option>

                        {empleados
                          .filter((empleado) => empleado.activo)
                          .map((empleado) => (
                            <option
                              key={empleado.id}
                              value={empleado.id}
                            >
                              {empleado.nombre} -{" "}
                              {empleado.documento}
                            </option>
                          ))}
                      </select>
                    </TextField>

                  </Modal.Body>

                  <Modal.Footer>

                    <Button
                      variant="secondary"
                      onPress={close}
                    >
                      Cancelar
                    </Button>

                    <Button
                      color="primary"
                      type="submit"
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