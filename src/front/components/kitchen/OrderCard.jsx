import { useState } from "react"
import { Clock, ArrowRight, CheckCircle, MenuIcon as TakeoutDining } from "lucide-react"

function OrderCard({ order, onUpdateStatus }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate elapsed time since order was placed
  const getElapsedTime = (timestamp) => {
    const orderTime = new Date(timestamp)
    const now = new Date()
    const diffMs = now - orderTime
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins === 1) return "1 minute ago"
    return `${diffMins} minutes ago`
  }

  // Determinar el color de fondo según el tiempo transcurrido
  const getUrgencyClass = (timestamp) => {
    const orderTime = new Date(timestamp)
    const now = new Date()
    const diffMs = now - orderTime
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins >= 15) return "bg-danger text-white" // Más de 15 minutos
    if (diffMins >= 10) return "bg-warning" // Entre 10 y 15 minutos
    return "bg-warning-subtle" // Menos de 10 minutos
  }

  // Determine border color based on status
  const getStatusBorderClass = (status) => {
    switch (status) {
      case "PENDING":
        return "border-warning"
      case "IN_PROGRESS":
        return "border-primary"
      case "READY":
      case "DELIVERED":
        return "border-success"
      case "CANCELLED":
        return "border-danger"
      default:
        return ""
    }
  }

  return (
    <div className={`card shadow-sm ${getStatusBorderClass(order.estado)} border-2`}>
      <div
        className={`card-header d-flex justify-content-between align-items-center ${order.estado === "PENDING" ? getUrgencyClass(order.timestamp) : ""}`}
      >
        <h5 className="card-title mb-0">Order #{order.ordenId}</h5>
        <div className="d-flex align-items-center">
          {order.isToGo && (
            <span className="badge bg-info me-2 d-flex align-items-center">
              <TakeoutDining size={14} className="me-1" />
              Take Away
            </span>
          )}
          <span className="badge bg-light text-dark d-flex align-items-center">
            <Clock size={14} className="me-1" />
            {getElapsedTime(order.fecha)}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="mb-2">
          <strong>{order.isToGo ? "Customer: " : "Table: "}</strong>
          {order.isToGo ? order.customer : order.table}
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Products:</strong>
            <button className="btn btn-sm btn-link p-0" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>

          <ul className="list-group">
            {order.detalles.map((item, index) => (
              <li key={index} className="list-group-item p-2">
                <div className="d-flex justify-content-between">
                  <span>
                    <strong>{item.cantidad}x</strong> {item.nombre}
                  </span>
                  <span>${item.subtotal.toFixed(2)}</span>
                </div>
                {item.notes && isExpanded && (
                  <div className="mt-1 text-muted small">
                    <em>{item.notes}</em>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="d-flex justify-content-between">
          {order.estado === "PENDING" && (
            <button className="btn btn-warning w-100 me-2" onClick={() => onUpdateStatus(order.id, "IN_PROGRESS")}>
              <ArrowRight size={18} className="me-1" />
              Start Preparation
            </button>
          )}

          {order.estado === "IN_PROGRESS" && (
            <button className="btn btn-success w-100" onClick={() => onUpdateStatus(order.id, "READY")}>
              <CheckCircle size={18} className="me-1" />
              Mark as Ready
            </button>
          )}

          {(order.estado === "READY" || order.estado === "DELIVERED") && (
            <div className="alert alert-success mb-0 w-100 py-2">
              <CheckCircle size={18} className="me-1" />
              {order.estado === "READY" ? "Ready for Delivery" : "Delivered"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderCard
