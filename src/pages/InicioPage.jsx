import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, Chip } from "@heroui/react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ClipboardCheck,
  LogIn,
  LogOut,
} from "lucide-react";

export default function InicioPage() {
  const [empleados, setEmpleados] = useState([]);
  const [marcaciones, setMarcaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      const [resEmpleados, resMarcaciones] = await Promise.all([
        api.get("/empleados"),
        api.get("/marcaciones"),
      ]);

      setEmpleados(resEmpleados.data);
      setMarcaciones(resMarcaciones.data);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const intervalo = setInterval(cargarDatos, 3000);

    return () => clearInterval(intervalo);
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
  // MARCACIONES DE HOY
  // =========================

  const marcacionesHoy = marcaciones.filter((marcacion) => {
    const fecha = new Date(marcacion.fechaHora);

    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  });

  // =========================
  // EMPLEADOS ACTIVOS
  // =========================

  const empleadosActivos = empleados.filter(
    (empleado) => empleado.activo
  );

  // =========================
  // PRESENTES
  // =========================
  // Un empleado se considera presente
  // si tiene una ENTRADA hoy.

  const empleadosPresentes = new Set(
    marcacionesHoy
      .filter((m) => m.tipo === "ENTRADA")
      .map((m) => m.empleado?.id)
      .filter(Boolean)
  );

  const presentes = empleadosPresentes.size;

  const ausentes = Math.max(
    empleadosActivos.length - presentes,
    0
  );

  // =========================
  // RETRASOS
  // =========================

  const retrasos = marcacionesHoy.filter(
    (m) => m.minutosRetraso > 0
  ).length;

  // =========================
  // ÚLTIMAS MARCACIONES
  // =========================

  const ultimasMarcaciones = [...marcacionesHoy]
    .sort(
      (a, b) =>
        new Date(b.fechaHora) -
        new Date(a.fechaHora)
    )
    .slice(0, 8);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* =========================
          CABECERA
      ========================= */}

      <div className="mb-8">

        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500">
          Resumen del control de asistencia
        </p>

        <p className="mt-2 text-lg font-semibold capitalize">
          {diaHoy}, {fechaHoy}
        </p>

      </div>

      {/* =========================
          TARJETAS DE RESUMEN
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* EMPLEADOS */}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between w-full">
              <div>
                <Card.Title>
                  Empleados activos
                </Card.Title>
                <p className="text-3xl font-bold mt-2">
                  {empleadosActivos.length}
                </p>
              </div>

              <Users size={30} />
            </div>
          </Card.Header>
        </Card>

        {/* PRESENTES */}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between w-full">
              <div>
                <Card.Title>
                  Presentes
                </Card.Title>

                <p className="text-3xl font-bold mt-2">
                  {presentes}
                </p>
              </div>

              <UserCheck size={30} />
            </div>
          </Card.Header>
        </Card>

        {/* AUSENTES */}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between w-full">
              <div>
                <Card.Title>
                  Ausentes
                </Card.Title>

                <p className="text-3xl font-bold mt-2">
                  {ausentes}
                </p>
              </div>

              <UserX size={30} />
            </div>
          </Card.Header>
        </Card>

        {/* RETRASOS */}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between w-full">
              <div>
                <Card.Title>
                  Retrasos
                </Card.Title>

                <p className="text-3xl font-bold mt-2">
                  {retrasos}
                </p>
              </div>

              <Clock size={30} />
            </div>
          </Card.Header>
        </Card>

      </div>

      {/* =========================
          RESUMEN DEL DÍA
      ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <Card>
          <Card.Header>
            <Card.Title>
              Marcaciones de hoy
            </Card.Title>
          </Card.Header>

          <Card.Content>
            <div className="flex items-center gap-3">
              <ClipboardCheck size={24} />

              <span className="text-2xl font-bold">
                {marcacionesHoy.length}
              </span>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>
              Entradas
            </Card.Title>
          </Card.Header>

          <Card.Content>
            <div className="flex items-center gap-3">
              <LogIn size={24} />

              <span className="text-2xl font-bold">
                {
                  marcacionesHoy.filter(
                    (m) => m.tipo === "ENTRADA"
                  ).length
                }
              </span>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>
              Salidas
            </Card.Title>
          </Card.Header>

          <Card.Content>
            <div className="flex items-center gap-3">
              <LogOut size={24} />

              <span className="text-2xl font-bold">
                {
                  marcacionesHoy.filter(
                    (m) => m.tipo === "SALIDA"
                  ).length
                }
              </span>
            </div>
          </Card.Content>
        </Card>

      </div>

      {/* =========================
          ÚLTIMAS MARCACIONES
      ========================= */}

      <Card>

        <Card.Header>
          <div className="flex items-center justify-between w-full">

            <div>
              <Card.Title>
                Últimas marcaciones
              </Card.Title>

              <p className="text-sm text-gray-500">
                Actividad registrada hoy
              </p>
            </div>

            <Chip color="primary">
              Actualización automática
            </Chip>

          </div>
        </Card.Header>

        <Card.Content>

          {loading ? (

            <p className="text-gray-500">
              Cargando marcaciones...
            </p>

          ) : ultimasMarcaciones.length === 0 ? (

            <p className="text-gray-500">
              No hay marcaciones registradas hoy.
            </p>

          ) : (

            <div className="divide-y">

              {ultimasMarcaciones.map((marcacion) => {

                const fecha =
                  new Date(marcacion.fechaHora);

                return (
                  <div
                    key={marcacion.id}
                    className="py-4 flex items-center justify-between"
                  >

                    <div>
                      <p className="font-semibold">
                        {marcacion.empleado?.nombre ||
                          "Sin empleado"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {marcacion.empleado?.documento ||
                          "-"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">

                      <span className="font-mono">
                        {fecha.toLocaleTimeString(
                          "es-CO"
                        )}
                      </span>

                      <Chip
                        color={
                          marcacion.tipo === "ENTRADA"
                            ? "success"
                            : "warning"
                        }
                      >
                        {marcacion.tipo}
                      </Chip>

                      {marcacion.minutosRetraso > 0 && (
                        <Chip color="danger">
                          {marcacion.minutosRetraso} min
                        </Chip>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </Card.Content>

      </Card>

    </div>
  );
}