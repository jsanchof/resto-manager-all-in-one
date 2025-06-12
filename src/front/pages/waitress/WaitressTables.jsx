import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from '../../components/common';
import { colors, spacing } from '../../theme';

const WaitressTables = () => {
    const [tables, setTables] = useState([]);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchTables();
    }, []);

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
            setTables(data);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: 'Could not load tables'
            });
        }
    };

    const handleTableStatusChange = async (tableId, newStatus) => {
        try {
            const token = sessionStorage.getItem("access_token");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tables/${tableId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus
                }),
            });

            if (!response.ok) throw new Error('Error updating table');

            setAlert({
                variant: 'success',
                title: 'Success',
                message: 'Table status updated'
            });
            fetchTables();
        } catch (error) {
            console.error('Error updating table:', error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: 'Could not update table status'
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FREE':
                return 'bg-success';
            case 'OCCUPIED':
                return 'bg-danger';
            case 'RESERVED':
                return 'bg-warning';
            default:
                return colors.neutral.gray;
        }
    };

    const tableStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: spacing.lg,
        padding: spacing.md,
    };

    const tableCardStyles = {
        padding: spacing.lg,
        textAlign: 'center',
        border: `2px solid ${colors.neutral.lightGray}`,
        borderRadius: '8px',
        transition: 'all 0.3s ease',
    };

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
                <h2>Restaurant Tables</h2>
                <div style={tableStyles}>
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            style={{
                                ...tableCardStyles,
                                borderColor: getStatusColor(table.status),
                            }}
                        >
                            <h3>Table {table.number}</h3>
                            <p>Capacity: {table.chairs} people</p>
                            <p style={{ color: getStatusColor(table.status) }}>
                                {table.status}
                            </p>
                            <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'center' }}>
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => handleTableStatusChange(table.id, 'FREE')}
                                    disabled={table.status === 'FREE'}
                                >
                                    Set Free
                                </Button>
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => handleTableStatusChange(table.id, 'OCCUPIED')}
                                    disabled={table.status === 'OCCUPIED'}
                                >
                                    Set Occupied
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </Container>
    );
};

export default WaitressTables; 