"use client"

import React, { useState, useEffect } from "react"
import { Pencil, Trash2, Search, Plus, Filter, CheckCircle, XCircle, Clock, Edit } from "lucide-react"
import { Container, Card, Input, Button, Alert, Table, Modal } from '../../components/common'
import { colors, typography, spacing, borderRadius } from '../../theme'
import BookingForm from "../../components/admin/BookingForm"

function AdminReservas() {
  const [reservas, setReservas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [reservaToEdit, setReservaToEdit] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [statusModal, setStatusModal] = useState({ show: false, reservaId: null, currentStatus: null })

  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Estados para paginación desde el backend
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [elementosPorPagina, setElementosPorPagina] = useState(10)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)

  const fetchReservations = async (pagina = 1, porPagina = 10, buscar = "", estado = "", fecha = "") => {
    try {
      setLoading(true)
      setError(null)

      // Obtener el token de autenticación
      const token = sessionStorage.getItem("access_token")

      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      // Construir URL con parámetros de paginación y filtros
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/reservations?page=${pagina}&per_page=${porPagina}`

      // Añadir búsqueda si existe
      if (buscar.trim() !== "") {
        url += `&search=${encodeURIComponent(buscar)}`
      }

      // Añadir filtro de estado si existe
      if (estado !== "") {
        url += `&status=${estado}`
      }

      // Añadir filtro de fecha si existe
      if (fecha !== "") {
        url += `&date=${fecha}`
      }

      // Realizar la petición al endpoint
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error al cargar reservaciones: ${response.status}`)
      }

      const data = await response.json()

      // Actualizar estados con la respuesta del backend
      setReservas(data.items || [])
      setPaginaActual(data.page || 1)
      setTotalPaginas(data.pages || 1)
      setElementosPorPagina(data.per_page || 10)
      setTotalElementos(data.total || 0)
    } catch (err) {
      console.error("Error al cargar reservaciones:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations(paginaActual, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
  }, [])

  const handleCreateReservation = () => {
    setReservaToEdit(null)
    setShowForm(true)
  }

  const handleEditReservation = (reserva) => {
    setReservaToEdit(reserva)
    setShowForm(true)
  }

  const handleDeleteConfirm = (reservaId) => {
    setConfirmDelete(reservaId)
  }

  const handleDeleteReservation = async () => {
    if (confirmDelete) {
      try {
        setLoading(true)

        // Obtener el token de autenticación
        const token = sessionStorage.getItem("access_token")

        // Realizar la petición para eliminar la reservación
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reservations/${confirmDelete}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error al eliminar reservación: ${response.status}`)
        }

        // Mostrar mensaje de éxito
        setSuccessMessage("Reservación eliminada correctamente")
        setTimeout(() => setSuccessMessage(null), 3000)

        // Recargar la lista de reservaciones
        await fetchReservations(paginaActual, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
        setConfirmDelete(null)
      } catch (err) {
        console.error("Error al eliminar reservación:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSaveReservation = async (reservationData) => {
    try {
      setLoading(true)

      // Obtener el token de autenticación
      const token = sessionStorage.getItem("access_token")

      // Preparar los datos según si es creación o edición
      let url, method

      if (reservaToEdit) {
        // EDICIÓN
        url = `${import.meta.env.VITE_BACKEND_URL}/api/reservations/${reservaToEdit.id}`
        method = "PUT"
      } else {
        // CREACIÓN
        url = `${import.meta.env.VITE_BACKEND_URL}/api/reservations`
        method = "POST"
      }

      // Realizar la petición para crear/actualizar la reservación
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        throw new Error(`Error al ${reservaToEdit ? "actualizar" : "crear"} reservación: ${response.status}`)
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(`Reservación ${reservaToEdit ? "actualizada" : "creada"} correctamente`)
      setTimeout(() => setSuccessMessage(null), 3000)

      // Recargar la lista de reservaciones
      await fetchReservations(paginaActual, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
      setShowForm(false)
    } catch (err) {
      console.error(`Error al ${reservaToEdit ? "actualizar" : "crear"} reservación:`, err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal para cambiar estado
  const openStatusModal = (reserva) => {
    setStatusModal({
      show: true,
      reservaId: reserva.id,
      currentStatus: reserva.status,
    })
  }

  // Cambiar rápidamente el estado de una reserva
  const handleQuickStatusChange = async (nuevoEstado) => {
    try {
      setLoading(true)

      // Obtener el token de autenticación
      const token = sessionStorage.getItem("access_token")

      // Realizar la petición para actualizar el estado
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reservations/${statusModal.reservaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nuevoEstado }),
      })

      if (!response.ok) {
        throw new Error(`Error al actualizar estado: ${response.status}`)
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(`Estado actualizado a ${nuevoEstado}`)
      setTimeout(() => setSuccessMessage(null), 3000)

      // Cerrar el modal
      setStatusModal({ show: false, reservaId: null, currentStatus: null })

      // Recargar la lista de reservaciones
      await fetchReservations(paginaActual, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
    } catch (err) {
      console.error("Error al actualizar estado:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const buscarReservaciones = () => {
    fetchReservations(1, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
  }

  const aplicarFiltros = () => {
    fetchReservations(1, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
  }

  const limpiarFiltros = () => {
    setFiltroEstado("")
    setFiltroFecha("")
    fetchReservations(1, elementosPorPagina, searchTerm, "", "")
  }

  // Funciones para la paginación
  const irAPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      fetchReservations(numeroPagina, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
    }
  }

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      fetchReservations(paginaActual - 1, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
    }
  }

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      fetchReservations(paginaActual + 1, elementosPorPagina, searchTerm, filtroEstado, filtroFecha)
    }
  }

  const cambiarElementosPorPagina = (nuevaCantidad) => {
    setElementosPorPagina(nuevaCantidad)
    fetchReservations(1, nuevaCantidad, searchTerm, filtroEstado, filtroFecha)
  }

  // Generar números de página para mostrar
  const generarNumerosPagina = () => {
    const paginas = []
    const maxPaginasMostradas = 5

    let paginaInicial = Math.max(1, paginaActual - Math.floor(maxPaginasMostradas / 2))
    const paginaFinal = Math.min(totalPaginas, paginaInicial + maxPaginasMostradas - 1)

    // Ajustar si estamos cerca del final
    if (paginaFinal - paginaInicial + 1 < maxPaginasMostradas) {
      paginaInicial = Math.max(1, paginaFinal - maxPaginasMostradas + 1)
    }

    for (let i = paginaInicial; i <= paginaFinal; i++) {
      paginas.push(i)
    }

    return paginas
  }

  // Calcular índices para mostrar información de paginación
  const indiceInicial = (paginaActual - 1) * elementosPorPagina + 1
  const indiceFinal = Math.min(indiceInicial + elementosPorPagina - 1, totalElementos)

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Obtener el color de la insignia según el estado
  const getBadgeColor = (status) => {
    switch (status) {
      case "CANCELADA":
        return "bg-danger"
      case "CONFIRMADA":
        return "bg-success"
      case "PENDIENTE":
        return "bg-warning"
      case "COMPLETADA":
        return "bg-info"
      default:
        return "bg-secondary"
    }
  }

  // Obtener el icono según el estado
  const getStatusIcon = (status) => {
    switch (status) {
      case "CANCELADA":
        return <XCircle size={16} className="me-2 text-danger" />
      case "CONFIRMADA":
        return <CheckCircle size={16} className="me-2 text-success" />
      case "PENDIENTE":
        return <Clock size={16} className="me-2 text-warning" />
      case "COMPLETADA":
        return <CheckCircle size={16} className="me-2 text-info" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "CANCELADA":
        return colors.status.error
      case "CONFIRMADA":
        return colors.status.success
      case "PENDIENTE":
        return colors.status.warning
      case "COMPLETADA":
        return colors.status.info
      default:
        return colors.neutral.gray
    }
  }

  const columns = [
    { id: 'id', label: '#ID' },
    { id: 'guest_name', label: 'Invitado' },
    { id: 'email', label: 'Correo' },
    { id: 'guest_phone', label: 'Teléfono' },
    {
      id: 'status',
      label: 'Estado',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <span style={{
            backgroundColor: getStatusColor(row.status),
            color: colors.neutral.white,
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: borderRadius.full,
            fontSize: typography.fontSize.sm,
          }}>
            {row.status}
          </span>
          <Button
            variant="text"
            size="small"
            onClick={() => openStatusModal(row)}
            title="Cambiar estado"
          >
            <Edit size={14} />
          </Button>
        </div>
      )
    },
    { id: 'quantity', label: 'Personas' },
    {
      id: 'start_date_time',
      label: 'Fecha Reserva',
      render: (row) => formatDate(row.start_date_time)
    },
    { id: 'table_id', label: 'Mesa' },
    {
      id: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleEditReservation(row)}
            title="Editar"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleDeleteConfirm(row.id)}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ]

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <Card>
        <div style={{ padding: spacing.xl }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xl
          }}>
            <h2 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.semibold,
              margin: 0
            }}>
              Gestión de Reservaciones
            </h2>
            <Button
              variant="primary"
              onClick={handleCreateReservation}
            >
              <Plus size={18} />
              Nueva Reservación
            </Button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing.lg,
            marginBottom: spacing.xl
          }}>
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && buscarReservaciones()}
                fullWidth
              />
              <Button
                variant="outline"
                onClick={buscarReservaciones}
              >
                <Search size={18} />
              </Button>
            </div>

            <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
              <Input
                type="select"
                value={elementosPorPagina}
                onChange={(e) => cambiarElementosPorPagina(Number(e.target.value))}
                style={{ width: '150px' }}
              >
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="25">25 por página</option>
                <option value="50">50 por página</option>
              </Input>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Filtros
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card>
              <div style={{ padding: spacing.lg }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: spacing.lg,
                  marginBottom: spacing.lg
                }}>
                  <Input
                    label="Filtrar por estado"
                    type="select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="CONFIRMADA">CONFIRMADA</option>
                    <option value="CANCELADA">CANCELADA</option>
                    <option value="COMPLETADA">COMPLETADA</option>
                  </Input>

                  <Input
                    label="Filtrar por fecha"
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outline"
                    onClick={limpiarFiltros}
                  >
                    Limpiar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={aplicarFiltros}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div style={{ marginTop: spacing.xl }}>
            <Table
              columns={columns}
              data={reservas}
              loading={loading}
              striped
              hoverable
            />

            {!loading && totalElementos > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing.lg
              }}>
                <span style={{
                  color: colors.neutral.gray,
                  fontSize: typography.fontSize.sm
                }}>
                  Mostrando {indiceInicial} a {indiceFinal} de {totalElementos} reservaciones
                </span>
                <div style={{ display: 'flex', gap: spacing.xs }}>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={irAPaginaAnterior}
                    disabled={paginaActual === 1}
                  >
                    Anterior
                  </Button>
                  {generarNumerosPagina().map((numeroPagina) => (
                    <Button
                      key={numeroPagina}
                      variant={paginaActual === numeroPagina ? "primary" : "outline"}
                      size="small"
                      onClick={() => irAPagina(numeroPagina)}
                    >
                      {numeroPagina}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="small"
                    onClick={irAPaginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal para cambiar estado */}
      <Modal
        isOpen={statusModal.show}
        onClose={() => setStatusModal({ show: false, reservaId: null, currentStatus: null })}
        title="Cambiar Estado de Reservación"
        size="small"
      >
        <div>
          <p style={{ marginBottom: spacing.md }}>
            Estado actual:{" "}
            <span style={{
              backgroundColor: getStatusColor(statusModal.currentStatus),
              color: colors.neutral.white,
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.full,
              fontSize: typography.fontSize.sm,
            }}>
              {statusModal.currentStatus}
            </span>
          </p>

          <p style={{ marginBottom: spacing.md }}>Selecciona el nuevo estado:</p>

          <div style={{ display: 'grid', gap: spacing.md }}>
            <Button
              variant="outline"
              onClick={() => handleQuickStatusChange("PENDIENTE")}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                color: colors.status.warning,
                borderColor: colors.status.warning
              }}
            >
              <Clock size={18} />
              PENDIENTE
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickStatusChange("CONFIRMADA")}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                color: colors.status.success,
                borderColor: colors.status.success
              }}
            >
              <CheckCircle size={18} />
              CONFIRMADA
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickStatusChange("CANCELADA")}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                color: colors.status.error,
                borderColor: colors.status.error
              }}
            >
              <XCircle size={18} />
              CANCELADA
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickStatusChange("COMPLETADA")}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                color: colors.status.info,
                borderColor: colors.status.info
              }}
            >
              <CheckCircle size={18} />
              COMPLETADA
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirmar Eliminación"
        size="small"
      >
        <div>
          <p style={{ marginBottom: spacing.lg }}>¿Estás seguro de que deseas eliminar esta reservación?</p>
          <p style={{ color: colors.status.error, marginBottom: spacing.xl }}>Esta acción no se puede deshacer.</p>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: spacing.md
          }}>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteReservation}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de formulario */}
      {showForm && (
        <BookingForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveReservation}
          reservaToEdit={reservaToEdit}
        />
      )}
    </Container>
  )
}

export default AdminReservas
