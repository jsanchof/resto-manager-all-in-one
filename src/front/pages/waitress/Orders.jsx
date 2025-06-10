import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Input, Alert } from '../../components/common';
import { colors } from '../../theme';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [alert, setAlert] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [availableTables, setAvailableTables] = useState([]);
    const [menu, setMenu] = useState({ dishes: [], drinks: [] });

    useEffect(() => {
        fetchOrders();
        fetchTables();
        fetchMenu();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            setOrders(data.items || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: 'Could not load orders'
            });
        }
    };

    const fetchTables = async () => {
        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tables`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            setAvailableTables(data);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: 'Could not load tables'
            });
        }
    };

    const fetchMenu = async () => {
        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/productos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            setMenu(data);
        } catch (error) {
            console.error('Error fetching menu:', error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: 'Could not load menu'
            });
        }
    };

    const handleCreateOrder = async () => {
        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table_id: selectedTable,
                    dishes: orderItems.filter(item => item.type === 'dish'),
                    drinks: orderItems.filter(item => item.type === 'drink'),
                }),
            });

            if (!response.ok) {
                throw new Error('Error creating order');
            }

            setAlert({
                variant: 'success',
                title: 'Success',
                message: 'Order created successfully'
            });
            setIsNewOrderModalOpen(false);
            setOrderItems([]);
            setSelectedTable(null);
            fetchOrders();
        } catch (error) {
            console.error('Error creating order:', error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: 'Could not create order'
            });
        }
    };

    const handleMarkAsPaid = async (orderId) => {
        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'PAID'
                }),
            });

            if (!response.ok) {
                throw new Error('Error updating order');
            }

            setAlert({
                variant: 'success',
                title: 'Success',
                message: 'Order marked as paid'
            });
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: 'Could not update order'
            });
        }
    };

    const columns = [
        { id: 'id', label: 'Order #' },
        { id: 'table', label: 'Table', render: (row) => `Table ${row.table_id}` },
        { id: 'items', label: 'Items', render: (row) => row.details.length },
        { id: 'total', label: 'Total', render: (row) => `$${row.total.toFixed(2)}` },
        { id: 'status', label: 'Status' },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => (
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleMarkAsPaid(row.id)}
                    disabled={row.status === 'PAID'}
                >
                    Mark as paid
                </Button>
            ),
        },
    ];

    return (
        <Container maxWidth="xl">
            {alert && (
                <Alert
                    variant={alert.variant}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Orders</h2>
                    <Button
                        variant="primary"
                        onClick={() => setIsNewOrderModalOpen(true)}
                    >
                        New Order
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={orders}
                    striped
                    hoverable
                />
            </Card>

            <Modal
                isOpen={isNewOrderModalOpen}
                onClose={() => {
                    setIsNewOrderModalOpen(false);
                    setOrderItems([]);
                    setSelectedTable(null);
                }}
                title="New Order"
                size="large"
            >
                <div>
                    <Input
                        label="Table"
                        type="select"
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        fullWidth
                    >
                        <option value="">Select table</option>
                        {availableTables.map((table) => (
                            <option key={table.id} value={table.id}>
                                Table {table.number}
                            </option>
                        ))}
                    </Input>

                    <div style={{ marginTop: '1rem' }}>
                        <h4>Dishes</h4>
                        {menu.dishes && menu.dishes.map((dish) => (
                            <div key={dish.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span>{dish.name} - ${dish.price}</span>
                                <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={orderItems.find(item => item.id === dish.id)?.quantity || 1}
                                        onChange={(e) => {
                                            const quantity = parseInt(e.target.value) || 1;
                                            const existingItem = orderItems.find(item => item.id === dish.id);
                                            if (existingItem) {
                                                setOrderItems(orderItems.map(item =>
                                                    item.id === dish.id ? { ...item, quantity } : item
                                                ));
                                            }
                                        }}
                                        style={{ width: '60px' }}
                                    />
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => {
                                            const existingItem = orderItems.find(item => item.id === dish.id);
                                            if (existingItem) {
                                                setOrderItems(orderItems.map(item =>
                                                    item.id === dish.id
                                                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                                                        : item
                                                ));
                                            } else {
                                                setOrderItems([...orderItems, { ...dish, type: 'dish', quantity: 1 }]);
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <h4>Drinks</h4>
                        {menu.drinks && menu.drinks.map((drink) => (
                            <div key={drink.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span>{drink.name} - ${drink.price}</span>
                                <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={orderItems.find(item => item.id === drink.id)?.quantity || 1}
                                        onChange={(e) => {
                                            const quantity = parseInt(e.target.value) || 1;
                                            const existingItem = orderItems.find(item => item.id === drink.id);
                                            if (existingItem) {
                                                setOrderItems(orderItems.map(item =>
                                                    item.id === drink.id ? { ...item, quantity } : item
                                                ));
                                            }
                                        }}
                                        style={{ width: '60px' }}
                                    />
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => {
                                            const existingItem = orderItems.find(item => item.id === drink.id);
                                            if (existingItem) {
                                                setOrderItems(orderItems.map(item =>
                                                    item.id === drink.id
                                                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                                                        : item
                                                ));
                                            } else {
                                                setOrderItems([...orderItems, { ...drink, type: 'drink', quantity: 1 }]);
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {orderItems.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <h4>Selected Items</h4>
                            {orderItems.map((item, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span>{item.name} - ${item.price} x {item.quantity || 1}</span>
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => {
                                            const newItems = [...orderItems];
                                            newItems.splice(index, 1);
                                            setOrderItems(newItems);
                                        }}
                                        style={{ marginLeft: '1rem' }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <div style={{ marginTop: '1rem' }}>
                                <strong>Total: ${orderItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0).toFixed(2)}</strong>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsNewOrderModalOpen(false);
                                setOrderItems([]);
                                setSelectedTable(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateOrder}
                            disabled={!selectedTable || orderItems.length === 0}
                        >
                            Create Order
                        </Button>
                    </div>
                </div>
            </Modal>
        </Container>
    );
};

export default Orders; 