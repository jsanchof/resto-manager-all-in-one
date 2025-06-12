import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { showError, showInfo, showSuccess } from "../utils/toastUtils";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [last_name, setLastName] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const RegistrarCuenta = async (e) => {
    e.preventDefault();

    try {
      if (!name || !last_name || !phone_number || !email || !password) {
        showInfo("All fields must be filled!");
        return;
      }

      const account = {
        name,
        last_name,
        phone_number,
        email,
        password,
        role: "CLIENT",
      };

      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      });

      if (response.ok) {
        showSuccess("Account registered successfully!");
      } else {
        showError("Error registering account.");
      }
    } catch (error) {
      console.log(error);
      showError("There was an error processing your request.");
    }
  };

  return (
    <form className="row justify-content-center p-4" onSubmit={RegistrarCuenta}>
      <div className="col-md-6">
        <h1 className="text-center mb-5">Create Account</h1>

        <div className="row">
          <div className="col-6">
            <div className="mb-5">
              <input
                type="text"
                className="form-control"
                placeholder="First Name"
                id="inputName"
                style={{ borderRadius: "0" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="mb-5">
              <input
                type="text"
                className="form-control"
                placeholder="Last Name"
                id="inputLastName"
                style={{ borderRadius: "0" }}
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-5">
          <input
            type="text"
            className="form-control"
            placeholder="Phone Number"
            id="inputPhone"
            style={{ borderRadius: "0" }}
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

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
            Create Account
          </button>
        </div>
      </div>
    </form>
  );
};