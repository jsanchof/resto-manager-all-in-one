// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"

const ProtectedRoute = ({ children, requiredRole }) => {
    const {store}=useGlobalReducer()
    const {isAuthenticated, userRole} = store
    if (!isAuthenticated) {
        return <Navigate to="/" />
    }
    

    if (requiredRole && userRole !== requiredRole) {
        switch (userRole) {
            case "ADMIN": return <Navigate to="/admin" />
            case "CLIENTE": return <Navigate to="/cliente/crear-orden" />
            case "COCINA": return <Navigate to="/kitchen" />
            default: return <Navigate to="/" />
        }
    }

    return children
}

export default ProtectedRoute