"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"
import { TestimonialPage } from "./user/TestimonialPage.jsx"
import { Clock, MapPin, Phone, Instagram, Facebook, Twitter } from "lucide-react"
import SEO from '../components/SEO'
import { RestaurantStructuredData } from '../components/StructuredData'

export const Home = () => {
  const { store, dispatch } = useGlobalReducer()
  const [isLoading, setIsLoading] = useState(false)

  const loadMessage = async () => {
    try {
      setIsLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL

      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

      const response = await fetch(backendUrl + "/api/hello")
      const data = await response.json()

      if (response.ok) dispatch({ type: "set_hello", payload: data.message })

      return data
    } catch (error) {
      if (error.message)
        throw new Error(
          `Could not fetch the message from the backend.
          Please check if the backend is running and the backend port is public.`,
        )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessage()
  }, [])

  // Menú destacado de comida mexicana
  const featuredMenu = [
    {
      id: 1,
      name: "Enchiladas Verdes",
      description: "Tortillas de maíz rellenas de pollo, bañadas en salsa verde con crema y queso",
      price: "$145.50",
      image: "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?q=80&w=500&auto=format&fit=crop",
      category: "Especialidad",
    },
    {
      id: 2,
      name: "Tacos al Pastor",
      description: "Tacos de carne de cerdo marinada con piña, cilantro y cebolla",
      price: "$110.50",
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=500&auto=format&fit=crop",
      category: "Plato Principal",
    },
    {
      id: 3,
      name: "Guacamole Tradicional",
      description: "Aguacate fresco machacado con tomate, cebolla, cilantro y chile",
      price: "$56.00",
      image: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=500&auto=format&fit=crop",
      category: "Entrante",
    },
    {
      id: 4,
      name: "Tacos de Bistec",
      description: "Tacos de bistec rellenos de queso, bañados en salsa de tomate casera",
      price: "$20.50",
      image: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?q=80&w=500&auto=format&fit=crop",
      category: "Especialidad",
    },
  ]

  return (
    <>
      <SEO
        title="Home"
        description="Welcome to El Mexicano Restaurant - Experience authentic Mexican cuisine in a warm and welcoming atmosphere. Order online or make a reservation today!"
        keywords="Mexican restaurant, authentic Mexican food, tacos, burritos, enchiladas, Mexican cuisine, restaurant booking, online ordering"
        canonicalUrl="https://elmexicano-restaurant.com"
        ogImage="/images/restaurant-front.jpg"
      />
      <RestaurantStructuredData />
      <div className="home-container">
        {/* Hero Section Mejorado */}
        <div
          className="hero-section position-relative d-flex align-items-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1613514785940-daed07799d9b?q=80&w=1000&auto=format&fit=crop)",
            height: "100vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="container text-center text-white">
            <h1 className="display-3 fw-bold mb-4 animate__animated animate__fadeInDown">
              EL <span className="text-danger">MEXICANO</span>
            </h1>
            <p className="lead fs-4 mb-5 animate__animated animate__fadeInUp">
              Auténtica cocina mexicana con los sabores tradicionales de México
            </p>
            <div className="d-flex justify-content-center gap-3 animate__animated animate__fadeInUp">
              <Link to="/reservations" className="btn btn-danger btn-lg px-4 py-2">
                Book a Table
              </Link>
              <Link to="/menu" className="btn btn-outline-light btn-lg px-4 py-2">
                Ver Menú
              </Link>
            </div>
          </div>

          <div className="position-absolute bottom-0 start-0 end-0 py-4 bg-dark bg-opacity-75">
            <div className="container">
              <div className="row text-white text-center">
                <div className="col-md-4 mb-3 mb-md-0">
                  <Clock size={24} className="mb-2" />
                  <h5 className="mb-0">Horario</h5>
                  <p className="mb-0">Lun-Dom: 08:00 - 22:30</p>
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                  <MapPin size={24} className="mb-2" />
                  <h5 className="mb-0">Ubicación</h5>
                  <p className="mb-0">Blvd. Valle de San Javier, Pachuca, México</p>
                </div>
                <div className="col-md-4">
                  <Phone size={24} className="mb-2" />
                  <h5 className="mb-0">Reservations</h5>
                  <p className="mb-0">+55 1234 5678</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sobre Nosotros */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="position-relative">
                  <img
                    src="https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?q=80&w=600&auto=format&fit=crop"
                    alt="Chef preparando comida mexicana"
                    className="img-fluid rounded-3 shadow"
                  />
                  <div
                    className="position-absolute"
                    style={{
                      bottom: "-20px",
                      right: "-20px",
                      width: "180px",
                      height: "180px",
                      background:
                        "url(https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=300&auto=format&fit=crop)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "5px solid white",
                      borderRadius: "5px",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    }}
                  ></div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="ps-lg-5">
                  <h6 className="text-danger text-uppercase fw-bold mb-3">Nuestra Historia</h6>
                  <h2 className="display-5 fw-bold mb-4">Sabores Auténticos de México</h2>
                  <p className="lead mb-4">
                    Desde 2010, nuestro restaurante ha sido un referente de la gastronomía mexicana en la ciudad,
                    ofreciendo recetas tradicionales con ingredientes frescos y de calidad.
                  </p>
                  <p className="mb-4">
                    Nuestro chef ejecutivo, con más de 20 años de experiencia en la cocina mexicana, selecciona
                    personalmente los ingredientes más frescos cada día para ofrecerte una experiencia gastronómica
                    auténtica.
                  </p>
                  <div className="d-flex align-items-center mt-4">
                    <img
                      src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=100&auto=format&fit=crop"
                      alt="Chef"
                      className="rounded-circle"
                      width="60"
                      height="60"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="ms-3">
                      <h5 className="mb-0">Chef Carlos Ramírez</h5>
                      <p className="text-muted mb-0">Chef Ejecutivo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menú Destacado */}
        <section className="py-5">
          <div className="container">
            <div className="text-center mb-5">
              <h6 className="text-danger text-uppercase fw-bold">Descubre</h6>
              <h2 className="display-5 fw-bold">Nuestros Platos Destacados</h2>
              <div className="divider-custom mx-auto my-3">
                <div className="divider-custom-line bg-danger"></div>
                <div className="divider-custom-icon">🌮</div>
                <div className="divider-custom-line bg-danger"></div>
              </div>
              <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
                Selección de nuestros platos más populares, preparados con recetas tradicionales mexicanas y los
                ingredientes más frescos.
              </p>
            </div>

            <div className="row g-4">
              {featuredMenu.map((item) => (
                <div key={item.id} className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div
                      className="card-img-top"
                      style={{
                        height: "200px",
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                    <div className="card-body">
                      <span className="badge bg-danger mb-2">{item.category}</span>
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text text-muted">{item.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5">{item.price}</span>
                        <Link to="/menu" className="btn btn-sm btn-outline-danger">
                          Ver Detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <Link to="/menu" className="btn btn-danger btn-lg">
                Ver Menú Completo
              </Link>
            </div>
          </div>
        </section>

        {/* Experiencia Mexicana */}
        <section className="py-5 bg-dark text-white">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <h6 className="text-danger text-uppercase fw-bold">Experiencia</h6>
                <h2 className="display-5 fw-bold mb-4">La Auténtica Experiencia Mexicana</h2>
                <p className="lead mb-4">
                  En nuestro restaurante no solo ofrecemos comida, sino una verdadera experiencia cultural mexicana.
                </p>
                <div className="row g-4 mt-2">
                  <div className="col-md-6">
                    <div className="d-flex">
                      <div className="flex-shrink-0 text-danger">
                        <span className="fs-1">01</span>
                      </div>
                      <div className="ms-3">
                        <h5>Ingredientes Auténticos</h5>
                        <p className="text-muted">
                          Importamos chiles y especias directamente de México para garantizar el sabor auténtico.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex">
                      <div className="flex-shrink-0 text-danger">
                        <span className="fs-1">02</span>
                      </div>
                      <div className="ms-3">
                        <h5>Recetas Tradicionales</h5>
                        <p className="text-muted">
                          Nuestras recetas han sido transmitidas por generaciones de cocineros mexicanos.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex">
                      <div className="flex-shrink-0 text-danger">
                        <span className="fs-1">03</span>
                      </div>
                      <div className="ms-3">
                        <h5>Ambiente Acogedor</h5>
                        <p className="text-muted">
                          Decoración inspirada en la cultura mexicana para una experiencia inmersiva.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex">
                      <div className="flex-shrink-0 text-danger">
                        <span className="fs-1">04</span>
                      </div>
                      <div className="ms-3">
                        <h5>Servicio Excepcional</h5>
                        <p className="text-muted">
                          Nuestro personal está capacitado para brindarte la mejor atención y experiencia.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="row g-3">
                  <div className="col-6">
                    <img
                      src="https://images.unsplash.com/photo-1534352956036-cd81e27dd615?q=80&w=300&auto=format&fit=crop"
                      alt="Tacos mexicanos"
                      className="img-fluid rounded shadow"
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=300&auto=format&fit=crop"
                      alt="Guacamole fresco"
                      className="img-fluid rounded shadow"
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?q=80&w=300&auto=format&fit=crop"
                      alt="Margaritas"
                      className="img-fluid rounded shadow"
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=300&auto=format&fit=crop"
                      alt="Plato mexicano"
                      className="img-fluid rounded shadow"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <div className="py-5 bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h6 className="text-danger text-uppercase fw-bold">Testimonios</h6>
              <h2 className="display-5 fw-bold">What Our Customers Say</h2>
              <div className="divider-custom mx-auto my-3">
                <div className="divider-custom-line bg-danger"></div>
                <div className="divider-custom-icon">⭐</div>
                <div className="divider-custom-line bg-danger"></div>
              </div>
            </div>
            <TestimonialPage />
          </div>
        </div>

        {/* Ubicación */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <h6 className="text-danger text-uppercase fw-bold">Encuéntranos</h6>
                <h2 className="display-5 fw-bold mb-4">Nuestra Ubicación</h2>
                <p className="lead mb-4">
                  Estamos ubicados en el corazón de la ciudad, con fácil acceso y estacionamiento disponible.
                </p>

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <MapPin size={24} className="text-danger me-3" />
                    <div>
                      <h5 className="mb-0">Dirección</h5>
                      <p className="mb-0">Blvd. Valle de San Javier, Pachuca, México</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <Phone size={24} className="text-danger me-3" />
                    <div>
                      <h5 className="mb-0">Teléfono</h5>
                      <p className="mb-0">+55 1234 5678</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <Clock size={24} className="text-danger me-3" />
                    <div>
                      <h5 className="mb-0">Horario</h5>
                      <p className="mb-0">Lunes a Domingo: 08:00 - 22:30</p>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                  <a href="#" className="btn btn-outline-dark rounded-circle p-2">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="btn btn-outline-dark rounded-circle p-2">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="btn btn-outline-dark rounded-circle p-2">
                    <Twitter size={20} />
                  </a>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="ratio ratio-4x3 rounded shadow overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3734.0109577399354!2d-98.759131285071!3d20.101060086434597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1a445b7fa3c59%3A0xb5f8968ab3eb63c4!2sPachuca%20de%20Soto%2C%20Hgo.%2C%20Mexico!5e0!3m2!1ses-419!2sec!4v1715521980000!5m2!1ses-419!2sec"
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Reservation */}
        <section className="py-5 bg-danger text-white text-center">
          <div className="container">
            <h2 className="display-4 fw-bold mb-4">¿Listo para una experiencia culinaria mexicana?</h2>
            <p className="lead mb-4">
              Book your table now and enjoy authentic Mexican cuisine in a cozy atmosphere.
            </p>
            <Link to="/reservations" className="btn btn-light btn-lg px-5">
              Book a Table
            </Link>
          </div>
        </section>

        {/* CSS personalizado */}
        <style>{`
          .divider-custom {
            width: 100%;
            max-width: 200px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .divider-custom-line {
            width: 100%;
            max-width: 70px;
            height: 2px;
            background-color: #dc3545;
          }
          .divider-custom-icon {
            font-size: 1.5rem;
            margin: 0 1rem;
          }
          .animate__animated {
            animation-duration: 1.5s;
          }
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translate3d(0, -50px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translate3d(0, 50px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          .animate__fadeInDown {
            animation-name: fadeInDown;
          }
          .animate__fadeInUp {
            animation-name: fadeInUp;
          }
        `}</style>
      </div>
    </>
  )
}
