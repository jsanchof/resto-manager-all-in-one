import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard';
import Products from '../pages/admin/Products';
import Ingredients from '../pages/admin/Ingredients';
import Orders from '../pages/admin/Orders';
import Users from '../pages/admin/Users';
import Layout from '../pages/admin/Layout';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="ingredients" element={<Ingredients />} />
                <Route path="orders" element={<Orders />} />
                <Route path="users" element={<Users />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes; 