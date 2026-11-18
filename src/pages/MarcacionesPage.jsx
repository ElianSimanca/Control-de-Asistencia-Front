import { useEffect, useState } from "react";
import api from "../api/axios";
import { Table, Button, Chip } from "@heroui/react";
import { RefreshCw } from "lucide-react";

export default function MarcacionesPage() {
  const [marcaciones, setMarcaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarMarcaciones = async () => {
    try {
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
    const intervalo = setInterval(cargarMarcaciones, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const hoy = new Date();
  const diaHoy = hoy.toLocaleDateString("es-CO", { weekday: "long" });
  const fechaHoy = hoy.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  const marcacionesHoy = marcaciones.filter((marcacion) => {
    const fecha = new Date(marcacion.fechaHora);
    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  });

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Panel de Marcaciones
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Registro de entradas y salidas en tiempo real
          </p>
        </div>

        <Button
          className="bg-white/10 text-white font-medium border border-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-md"
          onPress={cargarMarcaciones}
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Sincronizar
        </Button>
      </div>

      {/* TARJETA DE FECHA */}
      <div className="glass-panel px-6 py-4 mb-6 flex items-center gap-3 w-fit">
        <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
        <p className="text-sm font-medium text-gray-300 capitalize">
          Hoy es <span className="text-white font-semibold">{diaHoy}, {fechaHoy}</span>
        </p>
      </div>

      {/* TABLA EN PANEL DE CRISTAL */}
      <div className="glass-panel p-2">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Tabla de marcaciones">
              <Table.Header>
                <Table.Column isRowHeader className="bg-transparent text-gray-400 font-semibold">EMPLEADO</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">DOCUMENTO</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">HORA</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">TIPO</Table.Column>
                <Table.Column className="bg-transparent text-gray-400 font-semibold">ESTADO</Table.Column>
              </Table.Header>

              <Table.Body
                items={marcacionesHoy}
                renderEmptyState={() =>
                  loading ? "Cargando..." : "No hay marcaciones hoy."
                }
              >
                {(marcacion) => {
                  const fecha = new Date(marcacion.fechaHora);
                  return (
                    <Table.Row key={marcacion.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <Table.Cell className="font-medium text-white">
                        {marcacion.empleado?.nombre || "Sin empleado"}
                      </Table.Cell>
                      <Table.Cell className="text-gray-400">
                        {marcacion.empleado?.documento || "-"}
                      </Table.Cell>
                      <Table.Cell className="text-gray-300 font-mono">
                        {fecha.toLocaleTimeString("es-CO")}
                      </Table.Cell>
                      <Table.Cell>
                        <Chip
                          size="sm"
                          variant="flat"
                          className={
                            marcacion.tipo === "ENTRADA"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          }
                        >
                          {marcacion.tipo}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        {marcacion.minutosRetraso > 0 ? (
                          <span className="text-sm font-medium text-red-400">
                            {marcacion.minutosRetraso} min tarde
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-green-400">
                            A tiempo
                          </span>
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
    </div>
  );
}
