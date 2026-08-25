import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Table,
  Button,
  Label,
  Modal,
  Chip,
} from "@heroui/react";

export default function TarjetasPage() {

  const [tarjetas, setTarjetas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null);
  const [empleadoId, setEmpleadoId] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  // =========================================================
  // CARGAR DATOS
  // =========================================================

  const cargarDatos = async () => {

    try {

      const [
        tarjetasResponse,
        empleadosResponse
      ] = await Promise.all([
        api.get("/cards"),
        api.get("/empleados"),
      ]);

      setTarjetas(tarjetasResponse.data);
      setEmpleados(empleadosResponse.data);

    } catch (err) {

      console.error(
        "Error al cargar datos:",
        err
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // =========================================================
  // ABRIR ASIGNACIÓN
  // =========================================================

  const abrirAsignacion = (tarjeta) => {

    setTarjetaSeleccionada(tarjeta);
    setEmpleadoId("");
    setIsOpen(true);
  };

  // =========================================================
  // ASIGNAR TARJETA
  // =========================================================

  const asignarTarjeta = async (e) => {

    e.preventDefault();

    if (!tarjetaSeleccionada || !empleadoId) {
      alert("Seleccione un empleado.");
      return;
    }

    try {

      await api.put(
        `/cards/${tarjetaSeleccionada.id}/assign`,
        {
          empleadoId: Number(empleadoId),
        }
      );

      setTarjetaSeleccionada(null);
      setEmpleadoId("");
      setIsOpen(false);

      await cargarDatos();

    } catch (err) {

      console.error(
        "Error al asignar tarjeta:",
        err
      );

      if (err.response?.status === 409) {

        alert(
          "El empleado ya tiene una tarjeta asignada."
        );

      } else {

        alert(
          "No se pudo asignar la tarjeta."
        );
      }
    }
  };

  // =========================================================
  // DESASIGNAR
  // =========================================================

  const desasignarTarjeta = async (tarjeta) => {

    const confirmar = window.confirm(
      `¿Desasignar la tarjeta ${tarjeta.uid}?`
    );

    if (!confirmar) return;

    try {

      await api.put(
        `/cards/${tarjeta.id}/unassign`
      );

      await cargarDatos();

    } catch (err) {

      console.error(
        "Error al desasignar:",
        err
      );

      alert(
        "No se pudo desasignar la tarjeta."
      );
    }
  };

  // =========================================================
  // CAMBIAR ESTADO
  // =========================================================

  const cambiarEstado = async (tarjeta) => {

    try {

      const endpoint = tarjeta.activa
        ? `/cards/${tarjeta.id}/deactivate`
        : `/cards/${tarjeta.id}/activate`;

      await api.put(endpoint);

      await cargarDatos();

    } catch (err) {

      console.error(
        "Error al cambiar estado:",
        err
      );

      alert(
        "No se pudo cambiar el estado."
      );
    }
  };

  // =========================================================
  // ELIMINAR
  // =========================================================

  const eliminarTarjeta = async (tarjeta) => {

    const confirmar = window.confirm(
      `¿Eliminar la tarjeta ${tarjeta.uid}?`
    );

    if (!confirmar) return;

    try {

      await api.delete(
        `/cards/${tarjeta.id}`
      );

      await cargarDatos();

    } catch (err) {

      console.error(
        "Error al eliminar:",
        err
      );

      alert(
        "No se pudo eliminar la tarjeta."
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="p-6 max-w-6xl mx-auto">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Gestión de Tarjetas RFID
        </h1>

        <div className="text-sm text-gray-500">
          Las tarjetas se registran automáticamente
          al ser detectadas por el lector.
        </div>

      </div>

      <Table>

        <Table.ScrollContainer>

          <Table.Content aria-label="Tabla de tarjetas">

            <Table.Header>


              <Table.Column isRowHeader>
                UID
              </Table.Column>

              <Table.Column>
                EMPLEADO
              </Table.Column>

              <Table.Column>
                DOCUMENTO
              </Table.Column>

              <Table.Column>
                ESTADO
              </Table.Column>

              <Table.Column>
                ACCIONES
              </Table.Column>

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

                    <span className="font-mono">
                      {tarjeta.uid}
                    </span>

                  </Table.Cell>

                  <Table.Cell>
                    {tarjeta.empleado?.nombre ??
                      "Sin empleado"}
                  </Table.Cell>

                  <Table.Cell>
                    {tarjeta.empleado?.documento ??
                      "-"}
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

                    <div className="flex gap-2 flex-wrap">

                      {!tarjeta.empleado && (

                        <Button
                          size="sm"
                          color="primary"
                          onPress={() =>
                            abrirAsignacion(tarjeta)
                          }
                        >
                          Asignar
                        </Button>

                      )}

                      {tarjeta.empleado && (

                        <Button
                          size="sm"
                          variant="secondary"
                          onPress={() =>
                            desasignarTarjeta(tarjeta)
                          }
                        >
                          Desasignar
                        </Button>

                      )}

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

      {/* =====================================================
          MODAL ASIGNACIÓN
          ===================================================== */}

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

                    {tarjetaSeleccionada && (

                      <div className="mb-4 p-4 rounded-lg bg-gray-100">

                        <p className="text-sm text-gray-500">
                          Tarjeta detectada
                        </p>

                        <p className="font-mono font-bold">
                          {tarjetaSeleccionada.uid}
                        </p>

                        <p className="text-sm mt-1">
                          ID interno:{" "}
                          {tarjetaSeleccionada.id}
                        </p>

                      </div>

                    )}

                    <div>

                      <Label>
                        Empleado
                      </Label>

                      <select
                        className="w-full border rounded-lg p-2 mt-1"
                        value={empleadoId}
                        onChange={(e) =>
                          setEmpleadoId(e.target.value)
                        }
                        required
                      >

                        <option value="">
                          Seleccione un empleado
                        </option>

                        {empleados
                          .filter(
                            (empleado) =>
                              empleado.activo
                          )
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

                    </div>

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