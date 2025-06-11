import React, { useState } from "react";
import { Container, Card, Input, Button, Alert } from '../components/common';
import { colors, typography, spacing } from '../theme';
import { GoogleMapLocation } from "../components/GoogleMapLocation";
import SEO from '../components/SEO';

export const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [alert, setAlert] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/contact', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const dataResponse = await response.json();

            if (!response.ok) {
                setAlert({
                    variant: 'error',
                    title: 'Error',
                    message: dataResponse.msg || "Error sending message"
                });
                return;
            } setAlert({
                variant: 'success',
                title: 'Success',
                message: "Message sent successfully"
            });
            setForm({ name: "", email: "", message: "" });

        } catch (error) {
            console.error("Error sending message:", error);
            setAlert({
                variant: 'error',
                title: 'Error',
                message: "An error occurred while sending the message."
            });
        }
    };

    const titleStyles = {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.black,
        marginBottom: spacing.lg,
    };

    const subtitleStyles = {
        fontSize: typography.fontSize.lg,
        color: colors.neutral.darkGray,
        marginBottom: spacing.md,
    };

    const iconStyles = {
        color: colors.primary.main,
        fontSize: '2rem',
        marginBottom: spacing.sm,
    };

    const infoBlockStyles = {
        marginBottom: spacing.xl,
    };

    const infoTextStyles = {
        fontSize: typography.fontSize.base,
        color: colors.neutral.darkGray,
        margin: 0,
    };

    return (
        <>      <SEO
            title="Contact | El Mexicano Restaurant"
            description="Contact us for reservations, special events, or any inquiries. Located in Pachuca, we offer authentic Mexican cuisine in a welcoming atmosphere."
            keywords="mexican restaurant contact, restaurant location, restaurant phone, restaurant email"
            canonicalUrl="https://elmexicano-restaurant.com/contact"
            ogImage="/images/restaurant-contact.jpg"
        />

            <Container maxWidth="xl">
                {alert && (
                    <Alert
                        variant={alert.variant}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: spacing.xl,
                    marginBottom: spacing.xl
                }}>
                    <Card>
                        <div style={{ padding: spacing.xl }}>
                            <h2 style={titleStyles}>CONTACT US</h2>
                            <p style={subtitleStyles}>
                                We are conveniently located with easy access for all our customers and nearby parking options for your convenience.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xl }}>
                                <div>
                                    <div style={infoBlockStyles}>
                                        <i className="fa-solid fa-map-location-dot" style={iconStyles}></i>
                                        <p style={infoTextStyles}>
                                            Blvd. Valle de San Javier, 42086,<br />
                                            Pachuca de Soto, México
                                        </p>
                                    </div>

                                    <div style={infoBlockStyles}>
                                        <i className="fa-solid fa-envelope-open" style={iconStyles}></i>
                                        <p style={infoTextStyles}>
                                            info@yourdomain.com<br />
                                            admin@yourdomain.com
                                        </p>
                                    </div>
                                </div>                <div>
                                    <div style={infoBlockStyles}>
                                        <i className="fa-solid fa-clock" style={iconStyles}></i>
                                        <p style={infoTextStyles}>
                                            Monday to Sunday<br />
                                            8:00 am - 10:30 pm
                                        </p>
                                    </div>

                                    <div style={infoBlockStyles}>
                                        <i className="fa-solid fa-phone" style={iconStyles}></i>
                                        <p style={infoTextStyles}>
                                            +52 55 1234 5678<br />
                                            +52 55 3421 5678
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div style={{ padding: spacing.xl }}>              <h2 style={titleStyles}>Send us a Message</h2>
                            <form onSubmit={handleSubmit}>
                                <Input
                                    type="text"
                                    name="name"
                                    label="Your Name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />

                                <Input
                                    type="email"
                                    name="email"
                                    label="Your Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />

                                <Input
                                    type="textarea"
                                    name="message"
                                    label="Write Your Message Here"
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />

                                <div style={{ marginTop: spacing.xl }}>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        fullWidth
                                    >
                                        SEND MESSAGE
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>

                <Card>
                    <div style={{ height: '400px', width: '100%' }}>
                        <GoogleMapLocation />
                    </div>
                </Card>
            </Container>
        </>);
}

export default Contact;
