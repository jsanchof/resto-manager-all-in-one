import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export const EditProfile = () => {

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        telephone: "",
        address: "",
        personalInfo: "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        oldEmail: "",
        newEmail: "",
        confirmNewEmail: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const getUserData = async () => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("No se pudo obtener la información del perfil.");
            }

            const data = await response.json();

            console.log("Datos recibidos del backend:", data);
            // Actualiza el state con los datos del usuario
            setFormData(prev => ({
                ...prev,
                name: data.name,
                lastName: data.lastName,
                telephone: data.telephone,
                oldEmail: data.email
            }));

        } catch (error) {
            console.error(error);
            toast.error("Error al cargar tu perfil.");
        }
    };


    useEffect(() => {
        getUserData();
    }, []);


    const handleSave = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.name || !formData.lastName) {
            toast.error('Por favor completa todos los campos obligatorios.');
            return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        if (formData.newEmail && formData.newEmail !== formData.confirmNewEmail) {
            toast.error("Los emails no coinciden.");
            return;
        }

        // Envia los datos al backend
        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    lastName: formData.lastName,
                    telephone: formData.telephone,
                    email: formData.newEmail ? formData.newEmail : formData.oldEmail
                }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                toast.success('Perfil actualizado correctamente');
            } else {
                toast.error(data.error || "Hubo un error al actualizar el perfil.");
            }

        } catch (error) {
            console.error("Error en la actualización:", error);
            toast.error("Error de conexión al servidor.");
        }
    };



    return (
        <>
            <div className="container mt-5">
                <div className="card-header fw-bold">
                    <h2 className="mb-4 text-center"><i className="fa fa-user me-2"></i> Editar Perfil</h2>
                </div>

                <div className="card shadow-sm p-5 mb-5">
                    <form>
                        <div className="card shadow-sm">
                            <div className="card-header fw-bold">
                                <i className="fa-solid fa-user"></i> Detalles de tu perfil
                            </div>
                            <div className="p-3">
                                {/* Nombre */}
                                <div className="mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="Ingresa tu nombre" />
                                </div>

                                {/* Apellido */}
                                <div className="mb-3">
                                    <label className="form-label">Apellido</label>
                                    <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Ingresa tu apellido" />
                                </div>

                                {/* Teléfono */}
                                <div className="mb-3">
                                    <label className="form-label">Teléfono</label>
                                    <input type="tel" className="form-control" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Ingresa tu número de teléfono" />
                                </div>

                                {/* Dirección */}
                                <div className="mb-3">
                                    <label className="form-label">Dirección</label>
                                    <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} placeholder="Ingresa tu dirección" />
                                </div>




                            </div>
                        </div>

                        <hr />

                        {/* Contraseña y Correo Electrónico */}
                        <div className="d-flex justify-content-center gap-3">
                            <div className="col-md-6 mb-3 card shadow-sm">
                                <div className="card-header fw-bold">
                                    <i className="fa fa-lock me-2"></i> Cambia tu contraseña
                                </div>
                                <div className="p-3">
                                    {/* Contraseña actual */}
                                    <div className="mb-3">
                                        <label className="form-label">Contraseña actual</label>
                                        <input type="password" className="form-control" name="oldPassword" value={formData.oldPassword} onChange={handleChange} placeholder="Ingresa tu contraseña actual" />
                                    </div>

                                    {/* Nueva contraseña */}
                                    <div className="mb-3">
                                        <label className="form-label">Nueva contraseña</label>
                                        <input type="password" className="form-control" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Ingresa una nueva contraseña" />
                                    </div>

                                    {/* Confirmar nueva contraseña */}
                                    <div className="mb-3">
                                        <label className="form-label">Confirmar nueva contraseña</label>
                                        <input type="password" className="form-control" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} placeholder="Confirma tu nueva contraseña" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 mb-3 card shadow-sm">
                                <div className="card-header fw-bold">
                                    <i className="fa fa-envelope me-2"></i> Cambia tu Email
                                </div>
                                <div className="p-3">
                                    {/* Correo Electrónico Actual*/}
                                    <div className="mb-3">
                                        <label className="form-label">Email actual</label>
                                        <input type="text" className="form-control" name="oldEmail" value={formData.oldEmail} onChange={handleChange} placeholder="Ingresa tu email actual" />
                                    </div>

                                    {/* Nuevo Correo Electrónico */}
                                    <div className="mb-3">
                                        <label className="form-label">Nuevo email</label>
                                        <input type="text" className="form-control" name="newEmail" value={formData.newEmail} onChange={handleChange} placeholder="Ingresa una nuevo email" />
                                    </div>

                                    {/* Confirmar nueva contraseña */}
                                    <div className="mb-3">
                                        <label className="form-label">Confirmar nuevo email</label>
                                        <input type="text" className="form-control" name="confirmNewEmail" value={formData.confirmNewEmail} onChange={handleChange} placeholder="Confirma tu nuevo email" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <button type="submit" className="btn bg-red px-4 rounded-pill" onClick={handleSave}>
                            <i className="fa fa-save me-2"></i> Guardar cambios
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};