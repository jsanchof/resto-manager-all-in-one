import React from "react";

const testimonials = [
    {
        name: "Juan Pérez",
        text: "¡La mejor experiencia gastronómica que he tenido! El sushi estaba increíblemente fresco.",
    },
    {
        name: "Laura Gómez",
        text: "Ambiente acogedor, excelente atención y sabores auténticos. ¡Recomendadísimo!",
    },
    {
        name: "Carlos Ruiz",
        text: "Ideal para una cena romántica. El servicio fue impecable y los platos, una obra de arte.",
    },
    {
        name: "Adrian Valladares",
        text: "Excelente pagina, ojala los programadores pasen su curso"
    }
];

export const TestimonialPage = () => {
    return (
        <div
            id="testimonialCarousel"
            className="carousel slide my-5"
            data-bs-ride="carousel"
            style={{
                backgroundImage:
                    'url(https://img.freepik.com/foto-gratis/superficie-madera-mirando-restaurante-vacio_23-2147701348.jpg?semt=ais_hybrid&w=740)',
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative"
            }}
        >
            <div
                className="w-100"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    paddingTop: "4rem",
                    paddingBottom: "4rem",
                }}
            >
                <h1 className="text-center text-white mb-4">
                    What do people say about us?
                </h1>
                <div className="carousel-inner w-100 px-3">
                    {testimonials.map((item, index) => (
                        <div
                            className={`carousel-item ${index === 0 ? "active" : ""}`}
                            key={index}
                        >
                            <div className="d-flex flex-column justify-content-center align-items-center text-white text-center">
                                <p className="fs-4 fst-italic">"{item.text}"</p>
                                <p className="fw-bold">- {item.name}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Botones de navegación */}
                <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#testimonialCarousel"
                    data-bs-slide="prev"
                >
                    <span className="carousel-control-prev-icon" />
                    <span className="visually-hidden">Anterior</span>
                </button>
                <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#testimonialCarousel"
                    data-bs-slide="next"
                >
                    <span className="carousel-control-next-icon" />
                    <span className="visually-hidden">Siguiente</span>
                </button>
            </div>
        </div>
    );
};