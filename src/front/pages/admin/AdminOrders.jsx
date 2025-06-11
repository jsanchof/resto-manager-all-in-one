import { useState, useEffect } from "react"
import { Search, Eye, Trash2, CheckCircle, XCircle, Filter } from 'lucide-react'
import { Container, Card, Input, Button, Alert, Table, Modal } from '../../components/common';
import { colors, typography, spacing, borderRadius } from '../../theme';

function AdminOrdenes() {
    const [ordenes, setOrdenes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [alert, setAlert] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("")
    const [ordenDetalle, setOrdenDetalle] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [showFilters, setShowFilters] = useState(false)

    // Estados para paginación desde el backend
    const [paginaActual, setPaginaActual] = useState(1)
    const [elementosPorPagina, setElementosPorPagina] = useState(10)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [totalElementos, setTotalElementos] = useState(0)

    const fetchOrdenes = async (pagina = 1, porPagina = 10, buscar = "", estado = "") => {
        try {
            setLoading(true)
            const token = sessionStorage.getItem('access_token')

            // Construir URL con parámetros de paginación y filtros
            let url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders?page=${pagina}&per_page=${porPagina}`

            // Añadir búsqueda si existe
            if (buscar.trim() !== "") {
                url += `&search=${encodeURIComponent(buscar)}`
            }

            // Añadir filtro de estado si existe
            if (estado !== "") {
                url += `&status=${estado}`
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Error al cargar las órdenes')
            }

            const data = await response.json()

            // Actualizar estados con la respuesta del backend
            setOrdenes(data.items || [])
            setPaginaActual(data.page || 1)
            setTotalPaginas(data.pages || 1)
            setElementosPorPagina(data.per_page || 10)
            setTotalElementos(data.total || 0)
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrdenes(paginaActual, elementosPorPagina, searchTerm, filtroEstado)
    }, [])

    useEffect(() => {
        if (error) {
            setAlert({
                variant: 'error',
                title: 'Error',
                message: error
            });
            setError(null);
        }
    }, [error]);

    useEffect(() => {
        if (successMessage) {
            setAlert({
                variant: 'success',
                title: 'Éxito',
                message: successMessage
            });
            setSuccessMessage(null);
        }
    }, [successMessage]);

    const handleVerDetalle = (orden) => {
        // Asegurarse de que la orden tenga la propiedad detalles
        if (!orden.detalles) {
            // Si no tiene detalles, crear un array vacío para evitar errores
            setOrdenDetalle({ ...orden, detalles: [] })
        } else {
            setOrdenDetalle(orden)
        }
    }

    const handleDeleteConfirm = (ordenId) => {
        setConfirmDelete(ordenId)
    }

    const handleDeleteOrden = async () => {
        if (confirmDelete) {
            try {
                setLoading(true)
                const token = sessionStorage.getItem('access_token')
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${confirmDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    throw new Error('Error al eliminar la orden')
                }

                // Mostrar mensaje de éxito
                setSuccessMessage("Orden deleted successfully")
                setTimeout(() => setSuccessMessage(null), 3000)

                // Recargar las órdenes
                await fetchOrdenes(paginaActual, elementosPorPagina, searchTerm, filtroEstado)
                setConfirmDelete(null)
            } catch (err) {
                setError(err.message)
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            setLoading(true)
            const token = sessionStorage.getItem('access_token')
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: nuevoEstado })
            })

            if (!response.ok) {
                throw new Error('Error al actualizar el estado de la orden')
            }

            // Mostrar mensaje de éxito
            setSuccessMessage(`Estado actualizado a ${nuevoEstado}`)
            setTimeout(() => setSuccessMessage(null), 3000)

            // Recargar las órdenes
            await fetchOrdenes(paginaActual, elementosPorPagina, searchTerm, filtroEstado)

            // Si estamos viendo los detalles de esta orden, actualizar el estado en el modal
            if (ordenDetalle && ordenDetalle.id === id) {
                setOrdenDetalle({ ...ordenDetalle, estado: nuevoEstado })
            }
        } catch (err) {
            setError(err.message)
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Funciones para la paginación
    const irAPagina = (numeroPagina) => {
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            fetchOrdenes(numeroPagina, elementosPorPagina, searchTerm, filtroEstado)
        }
    }

    const irAPaginaAnterior = () => {
        if (paginaActual > 1) {
            fetchOrdenes(paginaActual - 1, elementosPorPagina, searchTerm, filtroEstado)
        }
    }

    const irAPaginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            fetchOrdenes(paginaActual + 1, elementosPorPagina, searchTerm, filtroEstado)
        }
    }

    const cambiarElementosPorPagina = (nuevaCantidad) => {
        setElementosPorPagina(nuevaCantidad)
        fetchOrdenes(1, nuevaCantidad, searchTerm, filtroEstado)
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

    // Buscar órdenes
    const buscarOrdenes = () => {
        fetchOrdenes(1, elementosPorPagina, searchTerm, filtroEstado)
    }

    // Aplicar filtro de estado
    const aplicarFiltroEstado = (estado) => {
        setFiltroEstado(estado)
        fetchOrdenes(1, elementosPorPagina, searchTerm, estado)
    }

    // Calcular el total con IVA para el modal de detalles
    const calcularTotalConIVA = (detalles) => {
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return 0
        }
        const subtotal = detalles.reduce((sum, item) => sum + item.cantidad * item.precio, 0)
        const iva = subtotal * 0.15
        return subtotal + iva
    }

    // Calcular subtotal para el modal de detalles
    const calcularSubtotal = (detalles) => {
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return 0
        }
        return detalles.reduce((sum, item) => sum + item.cantidad * item.precio, 0)
    }

    const columns = [
        { id: 'id', label: '#ID' },
        { id: 'orderId', label: 'Order ID' },
        { id: 'fecha', label: 'Date' },
        { id: 'customer', label: 'Customer' },
        {
            id: 'total',
            label: 'Total',
            render: (row) => `$${row.total.toFixed(2)}`
        },
        {
            id: 'estado',
            label: 'Status',
            render: (row) => (
                <span
                    style={{
                        backgroundColor: row.estado === "Completed"
                            ? colors.status.success
                            : row.estado === "In progress"
                                ? colors.status.warning
                                : colors.status.error,
                        color: colors.neutral.white,
                        padding: `${spacing.xs} ${spacing.sm}`,
                        borderRadius: borderRadius.full,
                        fontSize: typography.fontSize.sm,
                    }}
                >
                    {row.estado}
                </span>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => (
                <div style={{ display: 'flex', gap: spacing.sm }}>
                    <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleVerDetalle(row)}
                        title="View details"
                    >
                        <Eye size={16} />
                    </Button>
                    {row.estado === "In progress" && (
                        <>
                            <Button
                                variant="outline"
                                size="small"
                                onClick={() => handleCambiarEstado(row.id, "Completed")}
                                title="Mark as completed"
                            >
                                <CheckCircle size={16} />
                            </Button>
                            <Button
                                variant="outline"
                                size="small"
                                onClick={() => handleCambiarEstado(row.id, "Canceled")}
                                title="Cancel order"
                            >
                                <XCircle size={16} />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleDeleteConfirm(row.id)}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Container maxWidth="xl">
            {alert && (
                <Alert
                    variant={alert.variant}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <Card>
                <div style={{ padding: spacing.xl }}>
                    <h2 style={{
                        fontSize: typography.fontSize['2xl'],
                        fontWeight: typography.fontWeight.semibold,
                        marginBottom: spacing.xl
                    }}>
                        Orders Management
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: spacing.lg,
                        marginBottom: spacing.xl
                    }}>
                        <div style={{ display: 'flex', gap: spacing.sm }}>
                            <Input
                                type="text"
                                placeholder="Search by ID or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && buscarOrdenes()}
                                fullWidth
                            />
                            <Button
                                variant="outline"
                                onClick={buscarOrdenes}
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
                                <option value="5">5 per page</option>
                                <option value="10">10 per page</option>
                                <option value="25">25 per page</option>
                                <option value="50">50 per page</option>
                            </Input>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={18} />
                                Filters
                            </Button>
                        </div>
                    </div>

                    {showFilters && (
                        <Card>
                            <div style={{ padding: spacing.lg }}>
                                <h3 style={{
                                    fontSize: typography.fontSize.lg,
                                    marginBottom: spacing.md
                                }}>
                                    Filter by status
                                </h3>
                                <div style={{ display: 'flex', gap: spacing.sm }}>
                                    <Button
                                        variant={filtroEstado === "" ? "primary" : "outline"}
                                        onClick={() => aplicarFiltroEstado("")}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={filtroEstado === "In progress" ? "primary" : "outline"}
                                        onClick={() => aplicarFiltroEstado("In progress")}
                                    >
                                        In progress
                                    </Button>
                                    <Button
                                        variant={filtroEstado === "Completed" ? "primary" : "outline"}
                                        onClick={() => aplicarFiltroEstado("Completed")}
                                    >
                                        Completed
                                    </Button>
                                    <Button
                                        variant={filtroEstado === "Canceled" ? "primary" : "outline"}
                                        onClick={() => aplicarFiltroEstado("Canceled")}
                                    >
                                        Canceled
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div style={{ marginTop: spacing.xl }}>
                        <Table
                            columns={columns}
                            data={ordenes}
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
                                    Showing {indiceInicial} to {indiceFinal} of {totalElementos} orders
                                </span>
                                <div style={{ display: 'flex', gap: spacing.xs }}>
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={irAPaginaAnterior}
                                        disabled={paginaActual === 1}
                                    >
                                        Previous
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
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Modal de detalles */}
            {ordenDetalle && (
                <Modal
                    isOpen={!!ordenDetalle}
                    onClose={() => setOrdenDetalle(null)}
                    title={`Details of Order #${ordenDetalle?.orderId}`}
                    size="large"
                >
                    <div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: spacing.lg,
                            marginBottom: spacing.xl
                        }}>
                            <div>
                                <p style={{ margin: 0 }}>
                                    <strong>Customer:</strong> {ordenDetalle.customer}
                                </p>
                                <p style={{ margin: 0 }}>
                                    <strong>Date:</strong> {ordenDetalle.fecha}
                                </p>
                            </div>
                            <div>
                                <p style={{ margin: 0 }}>
                                    <strong>Status:</strong>{" "}
                                    <span style={{
                                        backgroundColor: ordenDetalle.estado === "Completed"
                                            ? colors.status.success
                                            : ordenDetalle.estado === "In progress"
                                                ? colors.status.warning
                                                : colors.status.error,
                                        color: colors.neutral.white,
                                        padding: `${spacing.xs} ${spacing.sm}`,
                                        borderRadius: borderRadius.full,
                                        fontSize: typography.fontSize.sm,
                                    }}>
                                        {ordenDetalle.estado}
                                    </span>
                                </p>
                                <p style={{ margin: 0 }}>
                                    <strong>Total:</strong> ${ordenDetalle.total.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <Table
                            columns={[
                                { id: 'nombre', label: 'Product' },
                                { id: 'cantidad', label: 'Quantity' },
                                {
                                    id: 'precio',
                                    label: 'Price',
                                    render: (row) => `$${row.precio.toFixed(2)}`
                                },
                                {
                                    id: 'subtotal',
                                    label: 'Subtotal',
                                    render: (row) => `$${(row.cantidad * row.precio).toFixed(2)}`
                                }
                            ]}
                            data={ordenDetalle.detalles || []}
                            striped
                            compact
                        />

                        <div style={{
                            marginTop: spacing.xl,
                            padding: spacing.lg,
                            backgroundColor: colors.neutral.background,
                            borderRadius: borderRadius.md
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: spacing.xs
                            }}>
                                <span>Subtotal:</span>
                                <span>${calcularSubtotal(ordenDetalle.detalles).toFixed(2)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: spacing.xs
                            }}>
                                <span>IVA (15%):</span>
                                <span>${(calcularSubtotal(ordenDetalle.detalles) * 0.15).toFixed(2)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: typography.fontWeight.semibold
                            }}>
                                <span>Total:</span>
                                <span>${calcularTotalConIVA(ordenDetalle.detalles).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de confirmación de eliminación */}
            <Modal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                title="Confirm Deletion"
                size="small"
            >
                <div>
                    <p>Are you sure you want to delete this order?</p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: spacing.md,
                        marginTop: spacing.xl
                    }}>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDeleteOrden}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </Container>
    );
}

export default AdminOrders;
