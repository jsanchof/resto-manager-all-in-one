import { Link, useLocation } from "react-router-dom"

function Sidebar({ isOpen }) {
  const location = useLocation()

  return (
    <div
      className={`sidebar bg-light ${isOpen ? "open" : "closed"}`}
      style={{
        width: isOpen ? "250px" : "0",
        minWidth: isOpen ? "250px" : "0",
        transition: "all 0.3s",
      }}
    >
      {isOpen && (
        <div className="d-flex flex-column p-3 h-100">
          <div className="list-group list-group-flush">
            <Link
              to="/"
              className={`list-group-item list-group-item-action py-3 ${location.pathname === "/client/create-order" ? "active bg-info-subtle" : ""}`}
            >
              <i className="bi bi-house-door me-2"></i> Menu
            </Link>
            <Link
              to="/mis-ordenes"
              className={`list-group-item list-group-item-action py-3 ${location.pathname === "/cliente/mis-ordenes" ? "active bg-info-subtle" : ""}`}
            >
              <i className="bi bi-list-check me-2"></i> Mis Órdenes
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar