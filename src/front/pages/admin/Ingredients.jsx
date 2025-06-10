import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { colors, typography, spacing, borderRadius } from '../../theme';

const Ingredients = () => {
    const [ingredients, setIngredients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        unit: '',
        stock: 0,
        minimum_stock: 0,
        cost_per_unit: 0
    });

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/ingredients`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                },
            });
            setIngredients(response.data);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            setError(error.response?.data?.error || error.message || 'Error fetching ingredients');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            if (selectedIngredient) {
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admin/ingredients/${selectedIngredient.id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                        },
                    }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admin/ingredients`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                        },
                    }
                );
            }
            setIsModalOpen(false);
            setSelectedIngredient(null);
            resetForm();
            fetchIngredients();
        } catch (error) {
            console.error('Error saving ingredient:', error);
            setError(error.response?.data?.error || error.message || 'Error saving ingredient');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este ingrediente?')) {
            try {
                setError('');
                await axios.delete(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admin/ingredients/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
                        },
                    }
                );
                fetchIngredients();
            } catch (error) {
                console.error('Error deleting ingredient:', error);
                setError(error.response?.data?.error || error.message || 'Error deleting ingredient');
            }
        }
    };

    const handleEdit = (ingredient) => {
        setSelectedIngredient(ingredient);
        setFormData({
            name: ingredient.name,
            description: ingredient.description || '',
            unit: ingredient.unit,
            stock: ingredient.stock,
            minimum_stock: ingredient.minimum_stock,
            cost_per_unit: ingredient.cost_per_unit
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            unit: '',
            stock: 0,
            minimum_stock: 0,
            cost_per_unit: 0
        });
    };

    const modalStyles = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: colors.neutral.white,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '90%',
        maxWidth: '500px',
        zIndex: 1000
    };

    const overlayStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Ingredientes</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setSelectedIngredient(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                >
                    <Plus size={20} />
                    Nuevo Ingrediente
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Mínimo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Costo por Unidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ingredients.map((ingredient) => (
                            <tr key={ingredient.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {ingredient.stock <= ingredient.minimum_stock && (
                                            <AlertTriangle className="text-yellow-500 mr-2" size={20} />
                                        )}
                                        <div>
                                            <div className="font-medium">{ingredient.name}</div>
                                            <div className="text-sm text-gray-500">{ingredient.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {ingredient.stock} {ingredient.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {ingredient.minimum_stock} {ingredient.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    ${ingredient.cost_per_unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(ingredient)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ingredient.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <>
                    <div style={overlayStyles} onClick={() => setIsModalOpen(false)} />
                    <div style={modalStyles}>
                        <h2 className="text-xl font-bold mb-4">
                            {selectedIngredient ? 'Editar' : 'Nuevo'} Ingrediente
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        rows="3"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Unidad
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Stock Actual
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Stock Mínimo
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minimum_stock}
                                            onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Costo por Unidad
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.cost_per_unit}
                                            onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                >
                                    {selectedIngredient ? 'Guardar Cambios' : 'Crear Ingrediente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default Ingredients; 