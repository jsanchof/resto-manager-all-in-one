"use client"

import { useState, useEffect } from "react"
import { Search, User, UserPlus, Calendar, Users, Info, Grid, AlertCircle } from 'lucide-react'

function BookingForm({ onClose, onSave, reservaToEdit }) {
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_phone: "",
    email: "",
    quantity: 1,
    table_id: "",
    start_date_time: "",
    additional_details: "",
    user_id: null,
    status: "PENDIENTE", // Valor por defecto
  })

  // Estados para la búsqueda de usuarios
  const [searchEmail, setSearchEmail] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userMode, setUserMode] = useState("guest") // "guest" o "registered"
  const [loadingUser, setLoadingUser] = useState(false)

  // Estados para las mesas
  const [tables, setTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [tableError, setTableError] = useState(null)
  const [showTableSelector, setShowTableSelector] = useState(false)

  // Estado para errores de validación
  const [errors, setErrors] = useState({})

  // Cargar datos de la reserva si estamos en modo edición
  useEffect(() => {
    // Resetear estados para evitar datos de operaciones anteriores
    setSelectedUser(null)
    setSearchResults([])
    setSearchEmail("")
    setSearchError(null)

    if (reservaToEdit) {
      // Formatear la fecha para el input datetime-local
      const dateObj = new Date(reservaToEdit.start_date_time)
      const formattedDate = dateObj.toISOString().slice(0, 16)

      setFormData({
        guest_name: reservaToEdit.guest_name || "",
        guest_phone: reservaToEdit.guest_phone || "",
        email: reservaToEdit.email || "",
        quantity: reservaToEdit.quantity || 1,
        table_id: reservaToEdit.table_id || "",
        start_date_time: formattedDate,
        additional_details: reservaToEdit.additional_details || "",
        user_id: reservaToEdit.user_id || null,
        status: reservaToEdit.status || "PENDIENTE",
      })

      // Si tiene user_id, establecer el modo a usuario registrado y buscar el usuario
      if (reservaToEdit.user_id) {
        setUserMode("registered")
        // Solo buscar el usuario si estamos editando una reserva existente
        fetchUserById(reservaToEdit.user_id)
      } else {
        setUserMode("guest")
      }
    } else {
      // Para nueva reserva, establecer la fecha por defecto (ahora + 1 hora, redondeado a la hora siguiente)
      const now = new Date()
      now.setHours(now.getHours() + 1)
      now.setMinutes(0)
      now.setSeconds(0)
      const defaultDate = now.toISOString().slice(0, 16)

      setFormData({
        guest_name: "",
        guest_phone: "",
        email: "",
        quantity: 1,
        table_id: "",
        start_date_time: defaultDate,
        additional_details: "",
        user_id: null,
        status: "PENDIENTE",
      })

      setUserMode("guest")
    }

    // Cargar las mesas disponibles
    fetchTables()
  }, [reservaToEdit])

  // Buscar usuario por ID - Solo se usa cuando se edita una reserva existente
  const fetchUserById = async (userId) => {
    if (!userId) return // No buscar si no hay ID de usuario

    try {
      setLoadingUser(true)
      setSearchError(null)

      const token = sessionStorage.getItem("access_token")
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error al obtener usuario: ${response.status}`)
      }

      const userData = await response.json()

      // Actualizar el estado con los datos del usuario
      setSelectedUser(userData)
      console.log("Usuario cargado para edición:", userData)
    } catch (err) {
      console.error("Error al obtener usuario:", err)
      setSearchError(`Error al cargar datos del usuario: ${err.message}`)
      // Si hay error, mantener el modo pero limpiar el user_id
      setFormData((prev) => ({
        ...prev,
        user_id: null,
      }))
    } finally {
      setLoadingUser(false)
    }
  }

  // Cargar mesas desde el API
  const fetchTables = async () => {
    try {
      setLoadingTables(true)
      setTableError(null)

      const token = sessionStorage.getItem("access_token")
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tables`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error al cargar mesas: ${response.status}`)
      }

      const data = await response.json()
      setTables(data)
    } catch (err) {
      console.error("Error al cargar mesas:", err)
      setTableError(err.message)
    } finally {
      setLoadingTables(false)
    }
  }

  // Buscar usuarios por email - Para nuevas reservas o cambio de usuario
  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchError("Ingresa un correo para buscar")
      return
    }

    try {
      setSearching(true)
      setSearchError(null)
      setSearchResults([])

      const token = sessionStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users?email=${encodeURIComponent(searchEmail)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Error al buscar usuarios: ${response.status}`)
      }

      const data = await response.json()
      setSearchResults(data.items || [])

      if (data.items && data.items.length === 0) {
        setSearchError("No se encontraron usuarios con ese correo")
      }
    } catch (err) {
      console.error("Error al buscar usuarios:", err)
      setSearchError(err.message)
    } finally {
      setSearching(false)
    }
  }

  // Seleccionar un usuario de los resultados de búsqueda
  const selectUser = (user) => {
    setSelectedUser(user)
    setFormData({
      ...formData,
      guest_name: `${user.name} ${user.last_name}`,
      guest_phone: user.phone_number || "",
      email: user.email,
      user_id: user.id,
    })
    setSearchResults([])
    setSearchEmail("")
  }

  // Cambiar entre modo invitado y usuario registrado
  const toggleUserMode = (mode) => {
    // Si ya estamos en ese modo, no hacer nada
    if (mode === userMode) return

    setUserMode(mode)

    if (mode === "guest") {
      // Limpiar datos de usuario registrado
      setFormData((prev) => ({
        ...prev,
        user_id: null,
      }))
      setSelectedUser(null)
    } else {
      // Al cambiar a modo registrado, limpiar búsqueda pero no cargar automáticamente ningún usuario
      setSearchEmail("")
      setSearchResults([])
      setSelectedUser(null) // Importante: no seleccionar automáticamente ningún usuario
    }
  }

  // Limpiar selección de usuario
  const clearSelectedUser = () => {
    setSelectedUser(null)
    setFormData((prev) => ({
      ...prev,
      user_id: null,
      // Mantener los demás datos para que el usuario pueda editarlos manualmente
    }))
  }

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  // Seleccionar una mesa
  const selectTable = (tableId) => {
    setFormData({
      ...formData,
      table_id: tableId,
    })
    setShowTableSelector(false)
  }

  // Obtener mesas disponibles filtradas por capacidad
  const getAvailableTables = () => {
    const quantity = Number.parseInt(formData.quantity) || 1
    // Si estamos editando, incluir la mesa actual como disponible
    if (reservaToEdit && reservaToEdit.table_id) {
      return tables.filter(
        (table) => (table.status === "FREE" && table.chairs >= quantity) || table.id === Number(reservaToEdit.table_id)
      )
    }
    return tables.filter((table) => table.status === "FREE" && table.chairs >= quantity)
  }

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {}

    // Validar campos requeridos
    if (!formData.guest_name.trim()) newErrors.guest_name = "El nombre es requerido"
    if (!formData.guest_phone.trim()) newErrors.guest_phone = "El teléfono es requerido"
    if (!formData.email.trim()) newErrors.email = "El correo es requerido"
    if (!formData.quantity || formData.quantity < 1) newErrors.quantity = "El número de personas debe ser al menos 1"
    if (!formData.start_date_time) newErrors.start_date_time = "La fecha y hora son requeridas"

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Formato de correo inválido"
    }

    // Validar formato de teléfono (opcional, puedes ajustar según tus necesidades)
    const phoneRegex = /^\d{7,15}$/
    if (formData.guest_phone && !phoneRegex.test(formData.guest_phone.replace(/\D/g, ""))) {
      newErrors.guest_phone = "Formato de teléfono inválido (solo números, 7-15 dígitos)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar formulario
    if (!validateForm()) return

    // Formatear fecha para enviar al backend
    const dateObj = new Date(formData.start_date_time)
    const formattedDate = dateObj.toISOString().slice(0, 19).replace("T", " ")

    // Preparar datos para enviar
    const reservationData = {
      guest_name: formData.guest_name,
      guest_phone: formData.guest_phone,
      email: formData.email,
      quantity: Number(formData.quantity),
      start_date_time: formattedDate,
      status: formData.status,
      additional_details: formData.additional_details,
    }

    // Añadir table_id solo si está definido
    if (formData.table_id) {
      reservationData.table_id = Number(formData.table_id)
    }

    // Añadir user_id solo si está definido
    if (formData.user_id) {
      reservationData.user_id = formData.user_id
    }

    // Llamar a la función onSave con los datos de la reserva
    onSave(reservationData)
  }

  // Obtener el nombre de la mesa seleccionada
  const getSelectedTableInfo = () => {
    if (!formData.table_id) return null
    const selectedTable = tables.find((table) => table.id === Number.parseInt(formData.table_id))
    return selectedTable
  }

  // Get color based on table status
  const getTableStatusColor = (status) => {
    switch (status) {
      case "FREE":
        return "bg-success"
      case "RESERVED":
        return "bg-warning"
      case "OCCUPIED":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  // Get color based on reservation status
  const getReservationStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-warning"
      case "CONFIRMED":
        return "bg-success"
      case "CANCELLED":
        return "bg-danger"
      case "COMPLETED":
        return "bg-info"
      default:
        return "bg-secondary"
    }
  }

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{reservaToEdit ? "Edit Reservation" : "Create New Reservation"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Selector de tipo de usuario */}
              <div className="mb-4">
                <div className="btn-group w-100">
                  <button
                    type="button"
                    className={`btn ${userMode === "guest" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => toggleUserMode("guest")}
                  >
                    <User size={18} className="me-2" />
                    Invitado
                  </button>
                  <button
                    type="button"
                    className={`btn ${userMode === "registered" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => toggleUserMode("registered")}
                  >
                    <UserPlus size={18} className="me-2" />
                    Usuario Registrado
                  </button>
                </div>
              </div>

              {/* Búsqueda de usuario registrado */}
              {userMode === "registered" && (
                <div className="mb-4">
                  <div className="card">
                    <div className="card-body">
                      {/* Usuario seleccionado o cargando usuario */}
                      {loadingUser ? (
                        <div className="d-flex justify-content-center my-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando usuario...</span>
                          </div>
                        </div>
                      ) : selectedUser ? (
                        <div className="alert alert-success mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Usuario seleccionado:</strong> {selectedUser.name} {selectedUser.last_name}
                              <br />
                              <small>
                                {selectedUser.email} | {selectedUser.phone_number || "Sin teléfono"}
                              </small>
                            </div>
                            <button type="button" className="btn-close" onClick={clearSelectedUser}></button>
                          </div>
                        </div>
                      ) : null}

                      {/* Solo mostrar la búsqueda si no hay un usuario seleccionado */}
                      {!selectedUser && !loadingUser && (
                        <>
                          <h6 className="card-subtitle mb-3">Buscar usuario por correo electrónico</h6>

                          <div className="input-group mb-3">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Correo electrónico"
                              value={searchEmail}
                              onChange={(e) => setSearchEmail(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                            />
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={searchUsers}
                              disabled={searching}
                            >
                              {searching ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                <Search size={18} />
                              )}
                            </button>
                          </div>

                          {searchError && <div className="alert alert-warning py-2">{searchError}</div>}

                          {/* Resultados de búsqueda */}
                          {searchResults.length > 0 && (
                            <div className="list-group mt-2">
                              {searchResults.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  className="list-group-item list-group-item-action"
                                  onClick={() => selectUser(user)}
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <strong>
                                        {user.name} {user.last_name}
                                      </strong>
                                      <br />
                                      <small>{user.email}</small>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">{user.role}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Estado de la reserva (solo visible en modo edición) */}
              {reservaToEdit && (
                <div className="mb-4">
                  <label className="form-label">Estado de la reserva</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="CONFIRMADA">CONFIRMADA</option>
                    <option value="CANCELADA">CANCELADA</option>
                    <option value="COMPLETADA">COMPLETADA</option>
                  </select>
                  <div className="form-text">
                    <AlertCircle size={14} className="me-1" />
                    El estado de la mesa se actualizará automáticamente según el estado de la reserva.
                  </div>
                </div>
              )}

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre del invitado*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.guest_name ? "is-invalid" : ""}`}
                    name="guest_name"
                    value={formData.guest_name}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                    disabled={userMode === "registered" && selectedUser}
                  />
                  {errors.guest_name && <div className="invalid-feedback">{errors.guest_name}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teléfono*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.guest_phone ? "is-invalid" : ""}`}
                    name="guest_phone"
                    value={formData.guest_phone}
                    onChange={handleChange}
                    placeholder="Número de teléfono"
                    disabled={userMode === "registered" && selectedUser}
                  />
                  {errors.guest_phone && <div className="invalid-feedback">{errors.guest_phone}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Correo electrónico*</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  disabled={userMode === "registered" && selectedUser}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Número de personas*</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Users size={16} />
                    </span>
                    <input
                      type="number"
                      className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      max="20"
                    />
                    {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mesa</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={
                        getSelectedTableInfo()
                          ? `Mesa ${getSelectedTableInfo().number} (${getSelectedTableInfo().chairs} sillas)`
                          : ""
                      }
                      placeholder="Seleccionar mesa"
                      readOnly
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={() => setShowTableSelector(!showTableSelector)}
                    >
                      <Grid size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Selector de mesas */}
              {showTableSelector && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3">Seleccionar mesa disponible</h6>

                    {loadingTables ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando mesas...</span>
                        </div>
                      </div>
                    ) : tableError ? (
                      <div className="alert alert-danger">{tableError}</div>
                    ) : (
                      <div>
                        <div className="mb-3">
                          <div className="d-flex gap-2">
                            <span className="badge bg-success">FREE</span>
                            <span className="badge bg-warning">RESERVED</span>
                            <span className="badge bg-danger">OCCUPIED</span>
                          </div>
                        </div>

                        <div className="row g-2">
                          {tables.map((table) => (
                            <div key={table.id} className="col-md-3 col-6">
                              <div
                                className={`card ${(table.status === "FREE" && table.chairs >= formData.quantity) ||
                                    (reservaToEdit && table.id === Number(reservaToEdit.table_id))
                                    ? "border-success"
                                    : "opacity-50"
                                  }`}
                              >
                                <div
                                  className={`card-header ${getTableStatusColor(table.status)} text-white d-flex justify-content-between align-items-center`}
                                >
                                  <span>Table {table.number}</span>
                                  <span className="badge bg-light text-dark">{table.chairs} chairs</span>
                                </div>
                                <div className="card-body p-2 text-center">
                                  {(table.status === "FREE" && table.chairs >= formData.quantity) ||
                                    (reservaToEdit && table.id === Number(reservaToEdit.table_id)) ? (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-success"
                                      onClick={() => selectTable(table.id)}
                                    >
                                      Select
                                    </button>
                                  ) : (
                                    <small>
                                      {table.status !== "FREE" ? "Not available" : "Insufficient capacity"}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {getAvailableTables().length === 0 && (
                            <div className="col-12">
                              <div className="alert alert-warning">
                                No tables available for {formData.quantity} people.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Fecha y hora de reserva*</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Calendar size={16} />
                  </span>
                  <input
                    type="datetime-local"
                    className={`form-control ${errors.start_date_time ? "is-invalid" : ""}`}
                    name="start_date_time"
                    value={formData.start_date_time}
                    onChange={handleChange}
                  />
                  {errors.start_date_time && <div className="invalid-feedback">{errors.start_date_time}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Detalles adicionales</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Info size={16} />
                  </span>
                  <textarea
                    className="form-control"
                    name="additional_details"
                    value={formData.additional_details}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Solicitudes especiales, alergias, ocasión especial, etc."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {reservaToEdit ? "Actualizar" : "Crear"} Reservación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
