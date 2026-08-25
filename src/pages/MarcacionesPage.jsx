import { useEffect, useState } from "react";
import api from "../api/axios";
import { Table, Button, Chip } from "@heroui/react";
import { RefreshCw } from "lucide-react";

export default function MarcacionesPage() {
  const [marcaciones, setMarcaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarMarcaciones = async () => {
    try {
      setLoading(true);

      const response = await api.get("/marcaciones");

      setMarcaciones(response.data);
    } catch (err) {
      console.error("Error al obtener marcaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMarcaciones();
  }, []);

  // =========================
  // FECHA ACTUAL
  // =========================

  const hoy = new Date();

  const diaHoy = hoy.toLocaleDateString("es-CO", {
    weekday: "long",
  });

  const fechaHoy = hoy.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =========================
  // FILTRAR MARCACIONES DE HOY
  // =========================

  const marcacionesHoy = marcaciones.filter((marcacion) => {
    const fecha = new Date(marcacion.fechaHora);

    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold">
            Registro de Marcaciones
          </h1>

          <p className="text-gray-500">
            Entradas y salidas de los empleados
          </p>

          <p className="mt-2 text-lg font-semibold capitalize">
            {diaHoy}, {fechaHoy}
          </p>
        </div>

        <Button
          color="primary"
          onPress={cargarMarcaciones}
        >
          <RefreshCw size={18} />
          Actualizar
        </Button>

      </div>

      <Table>
        <Table.ScrollContainer>

          <Table.Content aria-label="Tabla de marcaciones">

            <Table.Header>

              <Table.Column isRowHeader>
                ID
              </Table.Column>

              <Table.Column>
                EMPLEADO
              </Table.Column>

              <Table.Column>
                DOCUMENTO
              </Table.Column>

              <Table.Column>
                FECHA
              </Table.Column>

              <Table.Column>
                HORA
              </Table.Column>

              <Table.Column>
                TIPO
              </Table.Column>

              <Table.Column>
                RETRASO
              </Table.Column>

            </Table.Header>

            <Table.Body
              items={marcacionesHoy}
              renderEmptyState={() =>
                loading
                  ? "Cargando marcaciones..."
                  : "No hay marcaciones registradas hoy."
              }
            >

              {(marcacion) => {

                const fecha =
                  new Date(marcacion.fechaHora);

                return (

                  <Table.Row id={marcacion.id}>

                    <Table.Cell>
                      {marcacion.id}
                    </Table.Cell>

                    <Table.Cell>
                      {marcacion.empleado?.nombre ||
                        "Sin empleado"}
                    </Table.Cell>

                    <Table.Cell>
                      {marcacion.empleado?.documento ||
                        "-"}
                    </Table.Cell>

                    <Table.Cell>
                      {fecha.toLocaleDateString("es-CO")}
                    </Table.Cell>

                    <Table.Cell>
                      {fecha.toLocaleTimeString("es-CO")}
                    </Table.Cell>

                    <Table.Cell>

                      <Chip
                        color={
                          marcacion.tipo === "ENTRADA"
                            ? "success"
                            : "warning"
                        }
                      >
                        {marcacion.tipo}
                      </Chip>

                    </Table.Cell>

                    <Table.Cell>

                      {marcacion.minutosRetraso > 0 ? (

                        <Chip color="danger">
                          {marcacion.minutosRetraso} min
                        </Chip>

                      ) : (

                        <Chip color="success">
                          Sin retraso
                        </Chip>

                      )}

                    </Table.Cell>

                  </Table.Row>

                );
              }}

            </Table.Body>

          </Table.Content>

        </Table.ScrollContainer>
      </Table>

    </div>
  );
}