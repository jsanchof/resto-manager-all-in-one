import React, { useState } from 'react';
import { Container, Card, Input, Button, Alert } from '../components/common';
import { colors, typography, spacing } from '../theme';
import SEO from '../components/SEO';

export const Reservas = () => {
    const [form, setForm] = useState({
        guest_name: '',
        guest_phone: '',
        email: '',
        quantity: 1,
        start_date_time: '',
        additional_details: ''
    });

    const [alert, setAlert] = useState(null);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const formCopy = { ...form };
        formCopy.start_date_time = new Date(form.start_date_time).toISOString().slice(0, 19).replace('T', ' ');

        try {
            const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formCopy)
            });

            const result = await res.json();

            if (res.ok) {
                setAlert({
                    variant: 'success',
                    title: '¡Éxito!',
                    message: '¡Reserva enviada con éxito!'
                });
                setForm({
                    guest_name: '',
                    guest_phone: '',
                    email: '',
                    quantity: 1,
                    start_date_time: '',
                    additional_details: ''
                });
            } else {
                setAlert({
                    variant: 'error',
                    title: 'Error',
                    message: result.error || 'Error al enviar la reserva'
                });
            }
        } catch (error) {
            console.error(error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: 'Error al conectar con el servidor'
            });
        }
    };

    const titleStyles = {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.black,
        marginBottom: spacing.lg,
    };

    return (
        <>
            <SEO
                title="Reservaciones | El Mexicano Restaurant"
                description="Reserva tu mesa en El Mexicano Restaurant. Disfruta de una experiencia gastronómica única con auténtica comida mexicana. Reservaciones fáciles y rápidas."
                keywords="reservaciones, restaurante mexicano, reservar mesa, cena mexicana, restaurante pachuca"
                canonicalUrl="https://elmexicano-restaurant.com/reservas"
                ogImage="/images/restaurant-interior.jpg"
            />
            <Container maxWidth="md">
                {alert && (
                    <Alert
                        variant={alert.variant}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                <Card>
                    <form onSubmit={handleSubmit} style={{ padding: spacing.xl }}>
                        <h2 style={titleStyles}>Reservar una Mesa</h2>

                        <Input
                            label="Nombre"
                            type="text"
                            value={form.guest_name}
                            name="guest_name"
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <Input
                            label="Teléfono"
                            type="tel"
                            value={form.guest_phone}
                            name="guest_phone"
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <Input
                            label="Correo electrónico"
                            type="email"
                            value={form.email}
                            name="email"
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <Input
                            label="Cantidad de personas"
                            type="number"
                            value={form.quantity}
                            name="quantity"
                            min="1"
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <Input
                            label="Fecha y hora"
                            type="datetime-local"
                            value={form.start_date_time}
                            name="start_date_time"
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <Input
                            label="Detalles adicionales"
                            type="textarea"
                            value={form.additional_details}
                            name="additional_details"
                            onChange={handleChange}
                            fullWidth
                        />

                        <div style={{ marginTop: spacing.xl }}>
                            <Button
                                variant="primary"
                                type="submit"
                                fullWidth
                            >
                                Reservar
                            </Button>
                        </div>
                    </form>
                </Card>
            </Container>
        </>
    );
};
