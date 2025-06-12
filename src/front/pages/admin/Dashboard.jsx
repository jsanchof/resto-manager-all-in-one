import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { colors, typography, spacing, borderRadius } from '../../theme';
import axios from 'axios';

const Dashboard = () => {
    const [salesData, setSalesData] = useState([]);
    const [lowStockIngredients, setLowStockIngredients] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalProducts: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const [salesRes, ingredientsRes, productsRes, statsRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/admin/analytics/sales`),
                    axios.get(`${backendUrl}/api/admin/ingredients/low-stock`),
                    axios.get(`${backendUrl}/api/admin/products/top-selling`),
                    axios.get(`${backendUrl}/api/admin/analytics/stats`)
                ]);

                setSalesData(salesRes.data);
                setLowStockIngredients(ingredientsRes.data);
                setTopSellingProducts(productsRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    const cardStyles = {
        backgroundColor: colors.neutral.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

    const statCardStyles = {
        ...cardStyles,
        textAlign: 'center',
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div style={statCardStyles}>
                    <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
                    <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
                </div>
                <div style={statCardStyles}>
                    <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
                    <p className="text-3xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div style={statCardStyles}>
                    <h3 className="text-lg font-semibold text-gray-600">Average Order Value</h3>
                    <p className="text-3xl font-bold text-primary">${stats.averageOrderValue.toFixed(2)}</p>
                </div>
                <div style={statCardStyles}>
                    <h3 className="text-lg font-semibold text-gray-600">Total Products</h3>
                    <p className="text-3xl font-bold text-primary">{stats.totalProducts}</p>
                </div>
            </div>

            {/* Sales Chart */}
            <div style={cardStyles} className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Daily Sales</h2>
                <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sales" fill={colors.primary.main} name="Sales ($)" />
                            <Bar dataKey="orders" fill={colors.secondary.main} name="Orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Ingredients */}
                <div style={cardStyles}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Low Stock Ingredients</h2>
                        <Link to="/admin/ingredients" className="text-primary-600 hover:text-primary-700">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y">
                        {lowStockIngredients.map((ingredient) => (
                            <div key={ingredient.id} className="py-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{ingredient.name}</span>
                                    <span className="text-red-600">
                                        {ingredient.stock} {ingredient.unit} remaining
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Minimum required: {ingredient.minimum_stock} {ingredient.unit}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div style={cardStyles}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Top Selling Products</h2>
                        <Link to="/admin/products" className="text-primary-600 hover:text-primary-700">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y">
                        {topSellingProducts.map((product) => (
                            <div key={product.id} className="py-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{product.name}</span>
                                    <span className="text-green-600">
                                        {product.total_sold} sold
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Revenue: ${product.total_revenue.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 