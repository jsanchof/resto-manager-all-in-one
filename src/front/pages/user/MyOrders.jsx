import { useState, useEffect } from "react"
import { Search, Eye, Filter } from 'lucide-react'

function MisOrdenes() {
    // Estado para almacenar las órdenes
    const [ordenes, setOrdenes] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [ordenDetalle, setOrdenDetalle] = useState(null)

    // Estados para filtros
    const [filtroEstado, setFiltroEstado] = useState("all")
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    // Estados para paginación desde el backend
    const [paginaActual, setPaginaActual] = useState(1)
    const [elementosPorPagina, setElementosPorPagina] = useState(10)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [totalElementos, setTotalElementos] = useState(0)

    // Función para cargar órdenes desde el backend
    const fetchOrdenes = async (pagina = 1, porPagina = 10, estado = "all", buscar = "") => {
        try {
            setLoading(true)
            setError(null)

            // Get authentication token
            const token = sessionStorage.getItem("access_token")

            if (!token) {
                throw new Error("Authentication token not found")
            }

            // Build URL with pagination parameters and filters
            let url = `${import.meta.env.VITE_BACKEND_URL}/api/mis-ordenes?page=${pagina}&per_page=${porPagina}`

            // Add status filter if not "all"
            if (estado !== "all") {
                url += `&estado=${estado}`
            }

            // Add search if exists
            if (buscar.trim() !== "") {
                url += `&search=${encodeURIComponent(buscar)}`
            }

            console.log("Fetching orders from:", url)

            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error("Server error response:", errorData)
                throw new Error(errorData.error || `Error loading orders: ${response.status}`)
            }

            const data = await response.json()
            console.log("Received data:", data)

            if (!data || typeof data !== 'object') {
                throw new Error("Invalid response format")
            }

            setOrdenes(data.items || [])
            setPaginaActual(data.page || 1)
            setTotalPaginas(data.pages || 1)
            setElementosPorPagina(data.per_page || 10)
            setTotalElementos(data.total || 0)

        } catch (err) {
            console.error("Complete error loading orders:", err)
            setError(err.message)
            setOrdenes([])
            setPaginaActual(1)
            setTotalPaginas(1)
            setTotalElementos(0)
        } finally {
            setLoading(false)
        }
    }

    // Cargar órdenes al montar el componente y cuando cambien los filtros
    useEffect(() => {
        fetchOrdenes(paginaActual, elementosPorPagina, filtroEstado, busqueda)
    }, [paginaActual, elementosPorPagina, filtroEstado])

    const verDetalles = (orden) => {
        setOrdenDetalle(orden)
    }

    const cerrarDetalles = () => {
        setOrdenDetalle(null)
    }

    const toggleFiltros = () => {
        setMostrarFiltros(!mostrarFiltros)
    }

    const aplicarFiltros = () => {
        // Resetear a la primera página cuando se aplican filtros
        fetchOrdenes(1, elementosPorPagina, filtroEstado, busqueda)
    }

    const limpiarFiltros = () => {
        setBusqueda("")
        setFiltroEstado("all")
        // Cargar la primera página sin filtros
        fetchOrdenes(1, elementosPorPagina, "all", "")
    }

    // Funciones para la paginación
    const irAPagina = (numeroPagina) => {
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            fetchOrdenes(numeroPagina, elementosPorPagina, filtroEstado, busqueda)
        }
    }

    const irAPaginaAnterior = () => {
        if (paginaActual > 1) {
            fetchOrdenes(paginaActual - 1, elementosPorPagina, filtroEstado, busqueda)
        }
    }

    const irAPaginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            fetchOrdenes(paginaActual + 1, elementosPorPagina, filtroEstado, busqueda)
        }
    }

    // Manejar cambio en elementos por página
    const cambiarElementosPorPagina = (nuevaCantidad) => {
        setElementosPorPagina(nuevaCantidad)
        fetchOrdenes(1, nuevaCantidad, filtroEstado, busqueda)
    }

    // Calcular índices para mostrar en la paginación
    const indiceInicial = ((paginaActual - 1) * elementosPorPagina) + 1
    const indiceFinal = Math.min(paginaActual * elementosPorPagina, totalElementos)

    return (
        <div className="container-fluid">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h4 className="card-title mb-4">My Orders</h4>

                    <div className="row mb-3">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text bg-light">
                                    <Search size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by ID or status..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            aplicarFiltros()
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <button
                                className="btn w-100"
                                style={{ backgroundColor: "#27a745", color: "white" }}
                                onClick={toggleFiltros}
                            >
                                <Filter size={18} className="me-2" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {/* Filters panel */}
                    {mostrarFiltros && (
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={filtroEstado}
                                            onChange={(e) => setFiltroEstado(e.target.value)}
                                        >
                                            <option value="all">All</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="READY">Ready</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-primary"
                                                onClick={aplicarFiltros}
                                            >
                                                Apply Filters
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={limpiarFiltros}
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : ordenes.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="text-muted">
                                <i className="fa-regular fa-folder-open fa-3x mb-3"></i>
                                <h5>No orders to display</h5>
                                <p>
                                    {busqueda || filtroEstado !== "all"
                                        ? "No orders found with the applied filters"
                                        : "You haven't placed any orders yet"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordenes.map((orden) => (
                                            <tr key={orden.id}>
                                                <td>{orden.ordenId}</td>
                                                <td>{orden.fecha}</td>
                                                <td>${orden.total.toFixed(2)}</td>
                                                <td>
                                                    <span
                                                        className={`badge ${orden.status === "DELIVERED" || orden.status === "READY"
                                                            ? "bg-success"
                                                            : orden.status === "PENDING"
                                                                ? "bg-warning"
                                                                : orden.status === "IN_PROGRESS"
                                                                    ? "bg-info"
                                                                    : "bg-danger"} px-3 rounded-pill`}
                                                    >
                                                        {orden.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => verDetalles(orden)}
                                                    >
                                                        <Eye size={16} className="me-1" />
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalElementos > elementosPorPagina && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        <span className="text-muted">
                                            Showing {indiceInicial} to {indiceFinal} of {totalElementos} orders
                                        </span>
                                    </div>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={irAPaginaAnterior}
                                                    disabled={paginaActual === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                                                <li
                                                    key={pagina}
                                                    className={`page-item ${pagina === paginaActual ? 'active' : ''}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => irAPagina(pagina)}
                                                    >
                                                        {pagina}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={irAPaginaSiguiente}
                                                    disabled={paginaActual === totalPaginas}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Order details modal */}
            {ordenDetalle && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Order Details #{ordenDetalle.ordenId}</h5>
                                <button type="button" className="btn-close" onClick={cerrarDetalles}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <p>
                                            <strong>Date:</strong> {ordenDetalle.fecha}
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`badge ${ordenDetalle.status === "DELIVERED" || ordenDetalle.status === "READY"
                                                    ? "bg-success"
                                                    : ordenDetalle.status === "PENDING"
                                                        ? "bg-warning"
                                                        : ordenDetalle.status === "IN_PROGRESS"
                                                            ? "bg-info"
                                                            : "bg-danger"}`}
                                            >
                                                {ordenDetalle.status}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Total:</strong> ${ordenDetalle.total.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <h6 className="mb-3">Item Details</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ordenDetalle.detalles?.map((detalle, index) => (
                                                <tr key={index}>
                                                    <td>{detalle.nombre}</td>
                                                    <td>{detalle.cantidad}</td>
                                                    <td>${detalle.precio.toFixed(2)}</td>
                                                    <td>${(detalle.cantidad * detalle.precio).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={cerrarDetalles}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MisOrdenes;