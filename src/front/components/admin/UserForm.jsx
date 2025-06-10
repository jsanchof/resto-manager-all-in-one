import { useState, useEffect } from "react"
import { X } from 'lucide-react'

function UserForm({ onClose, onSave, userToEdit }) {
    // Estados iniciales para los campos del formulario
    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        phone_number: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "CLIENTE" // Valor por defecto
    })

    // Estado para errores de validación
    const [errors, setErrors] = useState({})
    // Estado para controlar si se está editando la contraseña
    const [changePassword, setChangePassword] = useState(false)

    // Cargar datos del usuario si estamos en modo edición
    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name || "",
                last_name: userToEdit.last_name || "",
                phone_number: userToEdit.phone_number || "",
                email: userToEdit.email || "",
                password: "",
                confirmPassword: "",
                role: userToEdit.role || "CLIENTE"
            })
            // En modo edición, por defecto no cambiamos la contraseña
            setChangePassword(false)
        }
    }, [userToEdit])

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    // Validar el formulario
    const validate = () => {
        const newErrors = {}

        // Validar nombre
        if (!formData.name || formData.name.trim() === "") {
            newErrors.name = "El nombre es obligatorio"
        }

        // Validar apellido
        if (!formData.last_name || formData.last_name.trim() === "") {
            newErrors.last_name = "El apellido es obligatorio"
        }

        // Validar teléfono
        if (!formData.phone_number || formData.phone_number.trim() === "") {
            newErrors.phone_number = "El teléfono es obligatorio"
        }

        // Validar email (siempre, ya que ahora es editable)
        if (!formData.email || formData.email.trim() === "") {
            newErrors.email = "El correo electrónico es obligatorio"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "El correo electrónico no es válido"
        }

        // Validar contraseña (solo en creación o si se está cambiando)
        if ((!userToEdit || changePassword) && (!formData.password || formData.password.trim() === "")) {
            newErrors.password = "La contraseña es obligatoria"
        } else if (changePassword && formData.password && formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres"
        }

        // Validar confirmación de contraseña (solo si hay contraseña)
        if ((!userToEdit || changePassword) && formData.password && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden"
        }

        // Validar rol
        if (!formData.role || formData.role.trim() === "") {
            newErrors.role = "El rol es obligatorio"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Manejar envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault()

        if (validate()) {
            // Preparar datos para enviar
            const dataToSave = {
                name: formData.name,
                last_name: formData.last_name,
                phone_number: formData.phone_number,
                email: formData.email, // Siempre incluir el email
                role: formData.role
            }

            // Añadir contraseña solo si es creación o se está cambiando
            if (!userToEdit || changePassword) {
                dataToSave.password = formData.password
            }

            // Llamar a la función de guardado
            onSave(dataToSave)
        }
    }

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {userToEdit ? "Editar Usuario" : "Crear Nuevo Usuario"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Cerrar"
                        ></button>
                    </div>

                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nombre"
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="last_name" className="form-label">Apellido</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Apellido"
                                />
                                {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="phone_number" className="form-label">Teléfono</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="Teléfono"
                                />
                                {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            {userToEdit && (
                                <div className="mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="changePassword"
                                        checked={changePassword}
                                        onChange={() => setChangePassword(!changePassword)}
                                    />
                                    <label className="form-check-label" htmlFor="changePassword">
                                        Cambiar contraseña
                                    </label>
                                </div>
                            )}

                            {(!userToEdit || changePassword) && (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Contraseña</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Contraseña"
                                        />
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirmar Contraseña"
                                        />
                                        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                                    </div>
                                </>
                            )}

                            <div className="mb-3">
                                <label htmlFor="role" className="form-label">Role</label>
                                <select
                                    className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="">Select role</option>
                                    <option value="ADMIN">Administrator</option>
                                    <option value="MESERO">Waiter</option>
                                    <option value="COCINA">Kitchen</option>
                                    <option value="CLIENTE">Customer</option>
                                </select>
                                {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                        >
                            {userToEdit ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserForm