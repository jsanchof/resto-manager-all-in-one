"use client"

import { useState, useEffect } from "react"

function ProductForm({ product, onSave, onCancel }) {
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    tipo: "FOOD",
    name: "",
    description: "",
    price: "",
    type: "MAIN", // Default value for FOOD
    url_img: "",
    is_active: true,
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState({})

  // Opciones para los tipos de productos
  const tipoOptions = [
    { value: "FOOD", label: "Food" },
    { value: "DRINK", label: "Drink" },
  ]

  // Opciones para las subcategorías según el tipo
  const typeOptions = {
    FOOD: [
      { value: "APPETIZER", label: "Appetizer" },
      { value: "MAIN", label: "Main Course" },
      { value: "DESSERT", label: "Dessert" },
    ],
    DRINK: [
      { value: "SODA", label: "Soda" },
      { value: "NATURAL", label: "Natural" },
      { value: "BEER", label: "Beer" },
      { value: "SPIRITS", label: "Spirits" },
    ],
  }

  // Cargar datos del producto si estamos en modo edición
  useEffect(() => {
    if (product) {
      setFormData({
        tipo: product.tipo === "PLATO" ? "FOOD" : "DRINK",
        name: product.name || "",
        description: product.description || "",
        price: product.price ? product.price.toString() : "",
        type: product.type || (product.tipo === "PLATO" ? "MAIN" : "SODA"),
        url_img: product.url_img || "",
        is_active: product.is_active !== undefined ? product.is_active : true,
      })
    }
  }, [product])

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Para campos checkbox, usar el valor de checked
    const newValue = type === "checkbox" ? checked : value

    // Actualizar el estado del formulario
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Si cambia el tipo, actualizar el type a un valor válido para ese tipo
    if (name === "tipo") {
      setFormData((prev) => ({
        ...prev,
        type: value === "FOOD" ? "MAIN" : "SODA",
      }))
    }

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {}

    // Validar campos requeridos
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price) newErrors.price = "Price is required"

    // Validar que el precio sea un número válido
    if (formData.price && (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) <= 0)) {
      newErrors.price = "Price must be a number greater than zero"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar formulario
    if (!validateForm()) return

    // Preparar datos para enviar
    const productData = {
      ...formData,
      tipo: formData.tipo === "FOOD" ? "PLATO" : "BEBIDA",
      price: Number.parseFloat(formData.price),
    }

    // Llamar a la función onSave con los datos del producto
    onSave(productData)
  }

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{product ? "Editar Producto" : "Crear Nuevo Producto"}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Tipo de Producto*</label>
                  <select
                    className={`form-select ${errors.tipo ? "is-invalid" : ""}`}
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                  >
                    {tipoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo && <div className="invalid-feedback">{errors.tipo}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Categoría*</label>
                  <select
                    className={`form-select ${errors.type ? "is-invalid" : ""}`}
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {typeOptions[formData.tipo].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre*</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre del producto"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción*</label>
                <textarea
                  className={`form-control ${errors.description ? "is-invalid" : ""}`}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Descripción del producto"
                ></textarea>
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Precio*</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-control ${errors.price ? "is-invalid" : ""}`}
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">URL de Imagen</label>
                  <input
                    type="text"
                    className={`form-control ${errors.url_img ? "is-invalid" : ""}`}
                    name="url_img"
                    value={formData.url_img}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {errors.url_img && <div className="invalid-feedback">{errors.url_img}</div>}
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    id="activeSwitch"
                  />
                  <label className="form-check-label" htmlFor="activeSwitch">
                    Active Product
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {product ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductForm
