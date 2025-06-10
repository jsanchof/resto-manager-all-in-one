"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CheckCircle, XCircle, Loader } from "lucide-react"

export const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [verificationState, setVerificationState] = useState({
    loading: true,
    success: false,
    error: null,
    message: "Verifying your email...",
  })

  useEffect(() => {
    // Extraer el token de la URL
    const queryParams = new URLSearchParams(location.search)
    const token = queryParams.get("token")

    if (!token) {
      setVerificationState({
        loading: false,
        success: false,
        error: "No se encontró el token de verificación en la URL",
        message: "No se pudo verificar su correo electrónico",
      })
      return
    }

    // Función para verificar el email con el backend
    const verifyEmail = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || ""
        const response = await fetch(`${backendUrl}/verify-email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (response.ok) {
          setVerificationState({
            loading: false,
            success: true,
            error: null,
            message: data.msg || "¡Su cuenta ha sido verificada correctamente!",
          })
        } else {
          setVerificationState({
            loading: false,
            success: false,
            error: data.msg || "Error al verificar el correo electrónico",
            message: "No se pudo verificar su correo electrónico",
          })
        }
      } catch (error) {
        setVerificationState({
          loading: false,
          success: false,
          error: "Error de conexión con el servidor",
          message: "No se pudo verificar su correo electrónico",
        })
      }
    }

    verifyEmail()
  }, [location.search])

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: "#f8f9fa",
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1613514785940-daed07799d9b?q=80&w=2000&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="text-center p-5 bg-white shadow-lg rounded-3" style={{ maxWidth: "500px", width: "90%" }}>
        {verificationState.loading ? (
          // Estado de carga
          <div className="mb-4">
            <div className="d-flex justify-content-center mb-4">
              <Loader size={64} className="text-danger animate-spin" />
            </div>
            <h2 className="mb-3">Verifying your email</h2>
            <p className="text-muted">Por favor espere mientras procesamos su solicitud...</p>
          </div>
        ) : verificationState.success ? (
          // Estado de éxito
          <div className="mb-4">
            <div className="d-flex justify-content-center mb-4">
              <CheckCircle size={64} className="text-success" />
            </div>
            <h2 className="mb-3">¡Su cuenta ha sido verificada!</h2>
            <p className="mb-4">Ya puede iniciar sesión con sus credenciales</p>

            <button className="btn btn-danger px-4 py-2" onClick={() => navigate("/login")}>
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          // Estado de error
          <div className="mb-4">
            <div className="d-flex justify-content-center mb-4">
              <XCircle size={64} className="text-danger" />
            </div>
            <h2 className="mb-3">Error de verificación</h2>
            <p className="text-muted mb-4">{verificationState.error}</p>

            <div className="d-flex flex-column gap-2">
              <button className="btn btn-danger" onClick={() => navigate("/login")}>
                Ir a iniciar sesión
              </button>
              <button className="btn btn-outline-secondary mt-2" onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </div>
        )}

        <div className="mt-5">
          <img src="/taco.png" alt="El Mexicano Logo" style={{ height: "40px", opacity: 0.7 }} />
          <p className="mt-2 mb-0 text-muted small">
            EL <span className="text-danger">MEXICANO</span>
          </p>
        </div>
      </div>
    </div>
  )
}
