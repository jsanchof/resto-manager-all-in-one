import { useState, useEffect } from "react"
import { Pencil, Trash2, Search, Filter, UserPlus } from 'lucide-react'
import UserForm from "../../components/admin/UserForm"

function AdminUsers() {
    const [users, setUsers] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [userToEdit, setUserToEdit] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [confirmDelete, setConfirmDelete] = useState(null)

    // Estados para filtros
    const [filtroRol, setFiltroRol] = useState("")
    const [filtroActivo, setFiltroActivo] = useState("")
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    // Estados para paginación desde el backend
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [paginaActual, setPaginaActual] = useState(1)
    const [elementosPorPagina, setElementosPorPagina] = useState(10)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [totalElementos, setTotalElementos] = useState(0)

    const fetchUsers = async (pagina = 1, porPagina = 10, buscar = "", rol = "", activo = "") => {
        try {
            setLoading(true)
            setError(null)

            // Get authentication token
            const token = sessionStorage.getItem("access_token")

            if (!token) {
                throw new Error("Authentication token not found")
            }

            // Build URL with pagination parameters and filters
            let url = `${import.meta.env.VITE_BACKEND_URL}/users?page=${pagina}&per_page=${porPagina}`

            // Add search if exists
            if (buscar.trim() !== "") {
                url += `&search=${encodeURIComponent(buscar)}`
            }

            // Add role filter if defined
            if (rol !== "") {
                url += `&role=${rol}`
            }

            // Add active/inactive filter if defined
            if (activo !== "") {
                url += `&is_active=${activo}`
            }

            // Make request to endpoint
            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error(`Error loading users: ${response.status}`)
            }

            const data = await response.json()

            // Update states with backend response
            setUsers(data.items || [])
            setPaginaActual(data.page || 1)
            setTotalPaginas(data.pages || 1)
            setElementosPorPagina(data.per_page || 10)
            setTotalElementos(data.total || 0)

        } catch (err) {
            console.error("Error loading users:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers(paginaActual, elementosPorPagina, searchTerm, filtroRol, filtroActivo)
    }, [])

    const handleCreateUser = () => {
        setUserToEdit(null)
        setShowForm(true)
    }

    const handleEditUser = (user) => {
        setUserToEdit(user)
        setShowForm(true)
    }

    const handleDeleteConfirm = (userId) => {
        setConfirmDelete(userId)
    }

    const handleDeleteUser = async () => {
        if (confirmDelete) {
            try {
                setLoading(true)

                // Obtener el token de autenticación
                const token = sessionStorage.getItem("access_token")

                // Realizar la petición para eliminar el usuario usando el endpoint correcto
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/delete/user`, {
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ id: confirmDelete })
                })

                if (!response.ok) {
                    throw new Error(`Error al eliminar usuario: ${response.status}`)
                }

                // Recargar la lista de usuarios
                await fetchUsers(paginaActual, elementosPorPagina, searchTerm, filtroRol, filtroActivo)
                setConfirmDelete(null)

            } catch (err) {
                console.error("Error al eliminar usuario:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleSaveUser = async (userData) => {
        try {
            setLoading(true)

            // Obtener el token de autenticación
            const token = sessionStorage.getItem("access_token")

            // Preparar los datos según si es creación o edición
            let url, method, dataToSend

            if (userToEdit) {
                // EDICIÓN: Usar el endpoint correcto y solo enviar los campos permitidos
                url = `${import.meta.env.VITE_BACKEND_URL}/edit_user/${userToEdit.id}`
                method = 'PUT'

                // Incluir todos los campos que se pueden editar, incluyendo el email
                dataToSend = {
                    name: userData.name,
                    last_name: userData.last_name,
                    phone_number: userData.phone_number,
                    email: userData.email, // Añadir el email para la edición
                    role: (userData.role || "").toUpperCase()
                }

                // Solo incluir password si se proporciona uno nuevo
                if (userData.password && userData.password.trim() !== "") {
                    dataToSend.password = userData.password
                }

                console.log("Datos enviados para edición:", dataToSend); // Log para depuración
            } else {
                // CREACIÓN: Usar el endpoint de registro
                url = `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`
                method = 'POST'

                // Preparar los datos para el registro
                dataToSend = {
                    name: userData.name,
                    last_name: userData.last_name,
                    phone_number: userData.phone_number,
                    email: userData.email,
                    password: userData.password,
                    role: (userData.role || "").toUpperCase()
                }
            }

            // Realizar la petición para crear/actualizar el usuario
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error al ${userToEdit ? 'actualizar' : 'crear'} usuario: ${errorData.msg || response.status}`)
            }

            // Recargar la lista de usuarios
            await fetchUsers(paginaActual, elementosPorPagina, searchTerm, filtroRol, filtroActivo)
            setShowForm(false)

        } catch (err) {
            console.error(`Error al ${userToEdit ? 'actualizar' : 'crear'} usuario:`, err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleFiltros = () => {
        setMostrarFiltros(!mostrarFiltros)
    }

    const aplicarFiltros = () => {
        fetchUsers(1, elementosPorPagina, searchTerm, filtroRol, filtroActivo)
    }

    const limpiarFiltros = () => {
        setSearchTerm("")
        setFiltroRol("")
        setFiltroActivo("")
        fetchUsers(1, elementosPorPagina, "", "", "")
    }

    const buscarUsuarios = () => {
        fetchUsers(1, elementosPorPagina, searchTerm, filtroRol, filtroActivo)
    }

    // Funciones para la paginación
    const irAPagina = (numeroPagina) => {
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            fetchUsers(numeroPagina, elementosPorPagina, searchTerm, filtroRol, filtroActivo)
        }
    }

    const irAPaginaAnterior = () => {
        if (paginaActual > 1) {
            fetchUsers(paginaActual - 1, elementosPorPagina, searchTerm, filtroRol, filtroActivo)
        }
    }

    const irAPaginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            fetchUsers(paginaActual + 1, elementosPorPagina, searchTerm, filtroRol, filtroActivo)
        }
    }

    const cambiarElementosPorPagina = (nuevaCantidad) => {
        setElementosPorPagina(nuevaCantidad)
        fetchUsers(1, nuevaCantidad, searchTerm, filtroRol, filtroActivo)
    }

    // Generar números de página para mostrar
    const generarNumerosPagina = () => {
        const paginas = []
        const maxPaginasMostradas = 5

        let paginaInicial = Math.max(1, paginaActual - Math.floor(maxPaginasMostradas / 2))
        let paginaFinal = Math.min(totalPaginas, paginaInicial + maxPaginasMostradas - 1)

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

    // Obtener el color de la insignia según el rol
    const getBadgeColor = (role) => {
        switch (role) {
            case 'WAITER':
                return 'bg-primary'
            case 'KITCHEN':
                return 'bg-warning'
            case 'CLIENT':
                return 'bg-success'
            case 'ADMIN':
                return 'bg-danger'
            default:
                return 'bg-secondary'
        }
    }

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    return (
        <div className="container-fluid">
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="card-title mb-0">User Management</h4>
                        <button
                            className="btn"
                            onClick={handleCreateUser}
                            style={{ backgroundColor: "#27a745", color: "white" }}
                        >
                            <UserPlus size={18} className="me-2" />
                            Create User
                        </button>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text bg-light">
                                    <Search size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name, last name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && buscarUsuarios()}
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={buscarUsuarios}
                                >
                                    Search
                                </button>
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
                                <h6 className="card-subtitle mb-3">Filter by role:</h6>
                                <div className="btn-group w-100 mb-3">
                                    <button
                                        className={`btn ${filtroRol === "" ? "btn-danger" : "btn-outline-danger"}`}
                                        onClick={() => setFiltroRol("")}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`btn ${filtroRol === "ADMIN" ? "btn-danger" : "btn-outline-danger"}`}
                                        onClick={() => setFiltroRol("ADMIN")}
                                    >
                                        Admin
                                    </button>
                                    <button
                                        className={`btn ${filtroRol === "WAITER" ? "btn-danger" : "btn-outline-danger"}`}
                                        onClick={() => setFiltroRol("WAITER")}
                                    >
                                        Waiter
                                    </button>
                                    <button
                                        className={`btn ${filtroRol === "KITCHEN" ? "btn-danger" : "btn-outline-danger"}`}
                                        onClick={() => setFiltroRol("KITCHEN")}
                                    >
                                        Kitchen Staff
                                    </button>
                                    <button
                                        className={`btn ${filtroRol === "CLIENT" ? "btn-danger" : "btn-outline-danger"}`}
                                        onClick={() => setFiltroRol("CLIENT")}
                                    >
                                        Client
                                    </button>
                                </div>

                                <h6 className="card-subtitle mb-3">Filter by status:</h6>
                                <div className="btn-group w-100 mb-3">
                                    <button
                                        className={`btn ${filtroActivo === "" ? "btn-danger" : "btn-outline-danger"}`}
                                        onClick={() => setFiltroActivo("")}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`btn ${filtroActivo === "true" ? "btn-danger" : "btn-outline-danger"}`}
                                        onClick={() => setFiltroActivo("true")}
                                    >
                                        Active
                                    </button>
                                    <button
                                        className={`btn ${filtroActivo === "false" ? "btn-danger" : "btn-outline-danger"}`}
                                        onClick={() => setFiltroActivo("false")}
                                    >
                                        Inactive
                                    </button>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Items per page:</label>
                                        <select
                                            className="form-select"
                                            value={elementosPorPagina}
                                            onChange={(e) => cambiarElementosPorPagina(Number(e.target.value))}
                                            aria-label="Items per page"
                                        >
                                            <option value="5">5 per page</option>
                                            <option value="10">10 per page</option>
                                            <option value="25">25 per page</option>
                                            <option value="50">50 per page</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={limpiarFiltros}
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={aplicarFiltros}
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>#ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Registration Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{`${user.name} ${user.last_name}`}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone_number}</td>
                                            <td>
                                                <span className={`badge ${getBadgeColor(user.role)} px-3 rounded-pill`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'} px-3 rounded-pill`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{formatDate(user.created_at)}</td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEditUser(user)}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteConfirm(user.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {!loading && users.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-3">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalElementos > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                <span className="text-muted">
                                    Showing {indiceInicial} to {indiceFinal} of {totalElementos} users
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

                                    {generarNumerosPagina().map(numeroPagina => (
                                        <li
                                            key={numeroPagina}
                                            className={`page-item ${paginaActual === numeroPagina ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => irAPagina(numeroPagina)}
                                            >
                                                {numeroPagina}
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
                </div>
            </div>

            {showForm && <UserForm onClose={() => setShowForm(false)} onSave={handleSaveUser} userToEdit={userToEdit} />}

            {confirmDelete && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button" className="btn-close" onClick={() => setConfirmDelete(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this user?</p>
                                <p className="text-danger">This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleDeleteUser}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminUsers