"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, AlertTriangle } from "lucide-react"

function ProductIngredientsForm({ product, onClose }) {
    const [ingredients, setIngredients] = useState([])
    const [productIngredients, setProductIngredients] = useState([])
    const [selectedIngredient, setSelectedIngredient] = useState("")
    const [quantity, setQuantity] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchData()
    }, [product])

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Get all available ingredients
            const ingredientsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/ingredients`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                },
            })

            if (!ingredientsResponse.ok) {
                throw new Error("Error al cargar ingredientes")
            }

            const ingredientsData = await ingredientsResponse.json()
            setIngredients(ingredientsData)

            // Get product's current ingredients
            const productIngredientsResponse = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${product.id}/ingredients`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                    },
                }
            )

            if (!productIngredientsResponse.ok) {
                throw new Error("Error al cargar ingredientes del producto")
            }

            const productIngredientsData = await productIngredientsResponse.json()
            setProductIngredients(productIngredientsData)
        } catch (err) {
            setError(err.message)
            console.error("Error fetching data:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddIngredient = async (e) => {
        e.preventDefault()
        if (!selectedIngredient || !quantity) return

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${product.id}/ingredients`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                    },
                    body: JSON.stringify({
                        ingredient_id: parseInt(selectedIngredient),
                        quantity: parseFloat(quantity),
                    }),
                }
            )

            if (!response.ok) {
                throw new Error("Error al agregar ingrediente")
            }

            // Reset form and refresh data
            setSelectedIngredient("")
            setQuantity("")
            await fetchData()
        } catch (err) {
            setError(err.message)
            console.error("Error adding ingredient:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveIngredient = async (ingredientId) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${product.id}/ingredients/${ingredientId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error("Error al eliminar ingrediente")
            }

            await fetchData()
        } catch (err) {
            setError(err.message)
            console.error("Error removing ingredient:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Ingredientes de {product.name}</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Current Ingredients */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Ingredientes Actuales</h3>
                {productIngredients.length === 0 ? (
                    <p className="text-gray-500">No hay ingredientes agregados</p>
                ) : (
                    <div className="space-y-2">
                        {productIngredients.map((pi) => {
                            const ingredient = ingredients.find((i) => i.id === pi.ingredient_id)
                            return (
                                <div
                                    key={pi.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <div className="font-medium">{pi.ingredient_name}</div>
                                        <div className="text-sm text-gray-500">
                                            Cantidad: {pi.quantity} {pi.unit}
                                        </div>
                                        {ingredient && ingredient.stock <= ingredient.minimum_stock && (
                                            <div className="flex items-center text-yellow-600 text-sm mt-1">
                                                <AlertTriangle size={16} className="mr-1" />
                                                Stock bajo: {ingredient.stock} {ingredient.unit} disponibles
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveIngredient(pi.ingredient_id)}
                                        className="text-red-600 hover:text-red-800"
                                        disabled={loading}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Add New Ingredient Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Agregar Ingrediente</h3>
                <form onSubmit={handleAddIngredient} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ingrediente
                        </label>
                        <select
                            value={selectedIngredient}
                            onChange={(e) => setSelectedIngredient(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            disabled={loading}
                        >
                            <option value="">Seleccionar ingrediente...</option>
                            {ingredients.map((ingredient) => (
                                <option key={ingredient.id} value={ingredient.id}>
                                    {ingredient.name} ({ingredient.stock} {ingredient.unit} disponibles)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                placeholder="Cantidad"
                                step="0.01"
                                min="0"
                                disabled={loading}
                            />
                            <span className="inline-flex items-center px-3 rounded-md border border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                {selectedIngredient &&
                                    ingredients.find((i) => i.id === parseInt(selectedIngredient))?.unit}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cerrar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
                            disabled={loading || !selectedIngredient || !quantity}
                        >
                            <Plus size={16} />
                            Agregar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProductIngredientsForm 