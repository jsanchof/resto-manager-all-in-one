import React from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { GoogleMapLocation } from "../components/GoogleMapLocation.jsx"
import { Link } from "react-router-dom";

export const AboutUs = () => {
    return (
        <div className='container'>
            <div className="row">
                <div className="card mb-3 w-100">
                    <div className="row g-0">
                        <div className="col-md-7">
                            <div className="card-body">
                                <h3 className="card-title">Reservaciones</h3>
                                <h2>Cada vez más</h2>
                                <h2>cerca de ti</h2>
                                <p className="card-text">
                                    Te esperamos en nuestras instalaciones para darte la mejor atención!
                                </p>

                                <Link to="/reservas">
                                    <button className="btn bg-red">Reserva Aquí</button>
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <img src="https://i.imgur.com/sBSsvdA.jpeg" className="img-fluid rounded-start" alt="kitchen" />
                        </div>
                    </div>
                </div>
            </div>

            {/*  <div className="row">
                <div className="reviews">
                    <div className="cards-container">
                        <h3>People</h3>
                        <div className="d-flex overflow-auto">
                            <h1>REVIEWS</h1>
                            
              store.people.map((item, index) => (
                <PeopleCard key={item.uid} item={item} />
              )) 
              
                        </div>
                    </div>
                </div>
            </div>*/}

            <div className="container my-5">
                <h2 className="mb-4 text-center">Our Location</h2>
                <GoogleMapLocation />
            </div>


        </div>
    );
};
