import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { showError, showInfo, showSuccess } from "../utils/toastUtils";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { store, dispatch } = useGlobalReducer()

  const IniciarSesion = async (e) => {
    e.preventDefault();

    try {
      if (!email || !password) {
        showInfo("All fields must be filled!");
        return;
      }

      const account = { email, password };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        showSuccess(data.msg || "Login successful!");

        dispatch({
          type: "login",
          payload: {
            token: data.access_token,
            role: data.role,
            user: data.user
          }
        });

        // Redirect based on role
        switch (data.role) {
          case "CLIENT":
            navigate("/client/create-order");
            break;
          case "KITCHEN":
            navigate("/kitchen");
            break;
          case "WAITER":
            navigate("/waiter/tables");
            break;
          case "ADMIN":
            navigate("/admin");
            break;
          default:
            navigate("/");
            break;
        }
      } else {
        showError(data.msg || "Error logging in.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      showError("There was an error processing your request.");
    }
  };

  return (
    <form className="row justify-content-center p-4" onSubmit={IniciarSesion}>
      <div className="col-md-6">
        <h1 className="text-center mb-5">Login</h1>

        <div className="mb-5">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            id="inputEmail"
            style={{ borderRadius: "0" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            id="inputPassword"
            style={{ borderRadius: "0" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary w-50">
            Login
          </button>
        </div>
      </div>
    </form>
  );
};