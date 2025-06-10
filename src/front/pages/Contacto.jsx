// Import necessary components from react-router-dom and other parts of the application.
import React, { useState } from "react";
import { Container, Card, Input, Button, Alert } from '../components/common';
import { colors, typography, spacing } from '../theme';
import { GoogleMapLocation } from "../components/GoogleMapLocation";
import SEO from '../components/SEO';

export function Contacto() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/contacto', {
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
          message: dataResponse.msg || "Error al enviar mensaje"
        });
        return;
      }

      setAlert({
        variant: 'success',
        title: 'Éxito',
        message: "Mensaje enviado correctamente"
      });
      setForm({ name: "", email: "", message: "" });

    } catch (error) {
      console.error("Error en el envío:", error);
      setAlert({
        variant: 'error',
        title: 'Error',
        message: "Ocurrió un error al enviar el mensaje."
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
    <>
      <SEO
        title="Contacto | El Mexicano Restaurant"
        description="Contáctanos para reservaciones, eventos especiales o cualquier consulta. Ubicados en Pachuca, ofrecemos auténtica comida mexicana en un ambiente acogedor."
        keywords="contacto restaurante mexicano, ubicación restaurante, teléfono restaurante, email restaurante"
        canonicalUrl="https://elmexicano-restaurant.com/contacto"
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
              <h2 style={titleStyles}>CONTÁCTANOS</h2>
              <p style={subtitleStyles}>
                Nos encontramos en una ubicación privilegiada, de fácil acceso para todos nuestros clientes y con opciones de estacionamiento cercanas para tu comodidad.
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
                </div>

                <div>
                  <div style={infoBlockStyles}>
                    <i className="fa-solid fa-clock" style={iconStyles}></i>
                    <p style={infoTextStyles}>
                      Lunes a Domingo<br />
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
            <div style={{ padding: spacing.xl }}>
              <h2 style={titleStyles}>Envíanos un Mensaje</h2>
              <form onSubmit={handleSubmit}>
                <Input
                  type="text"
                  name="name"
                  label="Tu Nombre"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  type="email"
                  name="email"
                  label="Tu Correo Electrónico"
                  value={form.email}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  type="textarea"
                  name="message"
                  label="Escribe Tu Mensaje Aquí"
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
                    ENVIAR MENSAJE
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
    </>
  );
}

export default Contacto;
