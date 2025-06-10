"use client"

import { useState, useEffect } from "react"
import { Clock, RefreshCw, Search, Filter } from "lucide-react"
import KitchenNavbar from "../../components/kitchen/KitchenNavbar"

function KitchenView() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // segundos
  const [timeLeft, setTimeLeft] = useState(refreshInterval)

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Función para obtener las órdenes
  const fetchOrders = async (page = 1, perPage = 10, search = "", status = "PENDING") => {
    try {
      setLoading(true)

      // Get authentication token
      const token = sessionStorage.getItem("access_token")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Build URL with parameters
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders?page=${page}&per_page=${perPage}`

      // Add status filter if exists
      if (status) {
        url += `&status=${status}`
      }

      // Add search if exists
      if (search.trim() !== "") {
        url += `&search=${encodeURIComponent(search)}`
      }

      // Make request
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error loading orders: ${response.status}`)
      }

      const data = await response.json()

      // Update states with response
      setOrders(data.items || [])
      setCurrentPage(data.page || 1)
      setTotalPages(data.pages || 1)
      setItemsPerPage(data.per_page || 10)
      setTotalItems(data.total || 0)
      setLastUpdate(new Date())
      setTimeLeft(refreshInterval)
      setError(null)
    } catch (err) {
      console.error("Error loading orders:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar órdenes iniciales
  useEffect(() => {
    fetchOrders(currentPage, itemsPerPage, searchTerm, statusFilter)
  }, [])

  // Efecto para el temporizador de actualización automática
  useEffect(() => {
    let timer

    if (autoRefresh) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            fetchOrders(currentPage, itemsPerPage, searchTerm, statusFilter) // Actualizar cuando llegue a cero
            return refreshInterval
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [autoRefresh, refreshInterval, currentPage, itemsPerPage, searchTerm, statusFilter])

  // Función para actualizar el estado de una orden
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true)

      // Obtener el token de autenticación
      const token = sessionStorage.getItem("access_token")

      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      // Realizar la petición para actualizar el estado
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error al actualizar estado: ${response.status}`)
      }

      // Recargar las órdenes para reflejar el cambio
      await fetchOrders(currentPage, itemsPerPage, searchTerm, statusFilter)
    } catch (err) {
      console.error("Error al actualizar estado:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para buscar órdenes
  const handleSearch = () => {
    setCurrentPage(1) // Resetear a la primera página
    fetchOrders(1, itemsPerPage, searchTerm, statusFilter)
  }

  // Función para cambiar el filtro de estado
  const handleStatusChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1) // Resetear a la primera página
    fetchOrders(1, itemsPerPage, searchTerm, status)
  }

  // Funciones para la paginación
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      fetchOrders(pageNumber, itemsPerPage, searchTerm, statusFilter)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  const changeItemsPerPage = (newAmount) => {
    setItemsPerPage(newAmount)
    setCurrentPage(1) // Resetear a la primera página
    fetchOrders(1, newAmount, searchTerm, statusFilter)
  }

  // Generar números de página para mostrar
  const generatePageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  // Calcular índices para mostrar información de paginación
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems)

  // Formatear tiempo transcurrido
  const formatTimeElapsed = (timestamp) => {
    const orderDate = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60))

    if (diffInMinutes < 1) return "Hace menos de un minuto"
    if (diffInMinutes === 1) return "Hace 1 minuto"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`

    const hours = Math.floor(diffInMinutes / 60)
    if (hours === 1) return "Hace 1 hora"
    return `Hace ${hours} horas`
  }

  // Mapear estados API a texto amigable para mostrar
  const getStatusDisplayText = (apiStatus) => {
    switch (apiStatus) {
      case "EN_PROCESO":
        return "In Progress"
      case "COMPLETED":
        return "Completed"
      case "CANCELLED":
        return "Cancelled"
      default:
        return apiStatus
    }
  }

  // Mapear estados de la UI a valores de API
  const getStatusBadgeClass = (apiStatus) => {
    switch (apiStatus) {
      case "EN_PROCESO":
        return "bg-warning"
      case "COMPLETED":
        return "bg-success"
      case "CANCELLED":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  return (
    <div className="kitchen-view bg-light min-vh-100">
      <KitchenNavbar />

      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3">Kitchen View</h1>

          <div className="d-flex align-items-center">
            <div className="me-3 d-flex align-items-center">
              <Clock className="me-1" size={18} />
              <span>Next update: {timeLeft}s</span>
            </div>

            <div className="form-check form-switch me-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="autoRefreshToggle"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
              />
              <label className="form-check-label" htmlFor="autoRefreshToggle">
                Auto
              </label>
            </div>

            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center"
              onClick={() => fetchOrders(currentPage, itemsPerPage, searchTerm, statusFilter)}
              disabled={loading}
            >
              <RefreshCw size={16} className={`me-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-3 text-muted small">Last update: {lastUpdate.toLocaleTimeString()}</div>

        {/* Filters and search */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="btn btn-outline-secondary" type="button" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2 justify-content-end">
              {/* Items per page selector */}
              <div style={{ width: "120px" }}>
                <select
                  className="form-select form-select-sm"
                  value={itemsPerPage}
                  onChange={(e) => changeItemsPerPage(Number(e.target.value))}
                  aria-label="Items per page"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="15">15 per page</option>
                  <option value="20">20 per page</option>
                </select>
              </div>
              <button
                className="btn btn-outline-primary"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFilters"
                aria-expanded="false"
                aria-controls="collapseFilters"
              >
                <Filter size={18} className="me-1" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible filters */}
        <div className="collapse mb-4" id="collapseFilters">
          <div className="card card-body">
            <div className="row">
              <div className="col-12">
                <label className="form-label">Filter by status</label>
                <div className="btn-group w-100">
                  <button
                    className={`btn ${statusFilter === "PENDING" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleStatusChange("PENDING")}
                  >
                    Pending
                  </button>
                  <button
                    className={`btn ${statusFilter === "IN_PROGRESS" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleStatusChange("IN_PROGRESS")}
                  >
                    In Progress
                  </button>
                  <button
                    className={`btn ${statusFilter === "COMPLETED" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleStatusChange("COMPLETED")}
                  >
                    Completed
                  </button>
                  <button
                    className={`btn ${statusFilter === "CANCELLED" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleStatusChange("CANCELLED")}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
          </div>
        )}

        {/* Main content */}
        <div className="row">
          <div className="col-12 mb-4">
            <h2 className="h5 mb-3">
              {getStatusDisplayText(statusFilter)} Orders ({totalItems})
            </h2>

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div className="col" key={order.id}>
                        <div className="card h-100 shadow-sm">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Order #{order.ordenId}</h5>
                            <span
                              className={`badge ${order.estado === "Completed"
                                ? "bg-success"
                                : order.estado === "In Progress"
                                  ? "bg-warning"
                                  : order.estado === "Cancelled"
                                    ? "bg-danger"
                                    : "bg-secondary"
                                }`}
                            >
                              {order.estado}
                            </span>
                          </div>
                          <div className="card-body">
                            <p className="card-text">
                              <strong>Customer:</strong> {order.cliente}
                            </p>
                            <p className="card-text">
                              <strong>Date:</strong> {order.fecha}
                            </p>
                            <p className="card-text">
                              <strong>Total:</strong> ${order.total.toFixed(2)}
                            </p>

                            <h6 className="mt-3 mb-2">Products:</h6>
                            <ul className="list-group list-group-flush">
                              {order.detalles &&
                                order.detalles.map((item, index) => (
                                  <li key={index} className="list-group-item px-0">
                                    <div className="d-flex justify-content-between">
                                      <span>
                                        <strong>{item.cantidad}x</strong> {item.producto}
                                      </span>
                                      <span>${item.subtotal.toFixed(2)}</span>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                          <div className="card-footer bg-transparent">
                            <div className="d-grid gap-2">
                              {order.estado === "In Progress" && (
                                <button
                                  className="btn btn-success"
                                  onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                                >
                                  Mark as Completed
                                </button>
                              )}
                              {order.estado === "Pending" && (
                                <button
                                  className="btn btn-warning"
                                  onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}
                                >
                                  Start Preparation
                                </button>
                              )}
                              {(order.estado === "Pending" || order.estado === "In Progress") && (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col">
                      <div className="alert alert-info">No orders found</div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <span className="text-muted">
                        Showing {startIndex} to {endIndex} of {totalItems} orders
                      </span>
                    </div>
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                          <button className="page-link" onClick={goToPreviousPage} disabled={currentPage === 1}>
                            Previous
                          </button>
                        </li>

                        {generatePageNumbers().map((pageNumber) => (
                          <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? "active" : ""}`}>
                            <button className="page-link" onClick={() => goToPage(pageNumber)}>
                              {pageNumber}
                            </button>
                          </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                          <button className="page-link" onClick={goToNextPage} disabled={currentPage === totalPages}>
                            Siguiente
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
      </div>
    </div>
  )
}

export default KitchenView
