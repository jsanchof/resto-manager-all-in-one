import { Link, useLocation } from "react-router-dom"
import { Users, ShoppingBag, FileText, Calendar, Utensils } from "lucide-react"

function AdminSidebar({ isOpen }) {
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
              to="/admin"
              className={`list-group-item list-group-item-action py-3 ${location.pathname === "/admin" ? "active bg-info-subtle" : ""
                }`}
            >
              <FileText size={18} className="me-2" />
              Orders
            </Link>
            <Link
              to="/admin/productos"
              className={`list-group-item list-group-item-action py-3 ${location.pathname === "/admin/productos" ? "active bg-info-subtle" : ""
                }`}
            >
              <ShoppingBag size={18} className="me-2" />
              Products
            </Link>
            <Link
              to="/admin/ingredients"
              className={`list-group-item list-group-item-action py-3 ${location.pathname === "/admin/ingredients" ? "active bg-info-subtle" : ""
                }`}
            >
              <Utensils size={18} className="me-2" />
              Ingredients
            </Link>
            <Link
              to="/admin/usuarios"
              className={`list-group-item list-group-item-action py-3 ${location.pathname === "/admin/usuarios" ? "active bg-info-subtle" : ""
                }`}
            >
              <Users size={18} className="me-2" />
              Users
            </Link>
            <Link
              to="/admin/reservas"
              className={`list-group-item list-group-item-action py-3 ${location.pathname === "/admin/reservas" ? "active bg-info-subtle" : ""
                }`}
            >
              <Calendar size={18} className="me-2" />
              Reservas
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSidebar
