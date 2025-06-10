import { Outlet } from "react-router-dom"
import AdminNavbar from "../components/admin/AdminNavbar"
import AdminSidebar from "../components/admin/AdminSidebar"

export default function LayoutAdmin() {
  return (
    <div className="app-container">
      <AdminNavbar />
      <div className="d-flex flex-grow-1">
        <AdminSidebar />
        <main className="content-area p-3 flex-grow-1" style={{ backgroundColor: "#f4f7fb" }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
