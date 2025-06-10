"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Calendar, Search, User, UserPlus, Menu, X } from "lucide-react"
import "./mexican-navbar.css" // Importamos el archivo CSS específico
import tacoLogo from '../assets/taco.png'

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="mexican-navbar-wrapper">
      {/* Top Menu */}
      <div className="mexican-top-bar">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-none d-md-block">
            <span className="mexican-promo-text">
              <Calendar size={18} className="mexican-icon-danger me-2" />
              Book your first reservation and get 10% off
            </span>
          </div>

          <div className="d-flex align-items-center">
            <div className="d-none d-md-block me-3">
              {/* <div className="mexican-search-group">
                <span className="mexican-search-icon">
                  <Search size={16} />
                </span>
                <input className="mexican-search-input" type="search" placeholder="Buscar" aria-label="Buscar" />
              </div> */}
            </div>
            <Link to="/login" className="me-2 text-decoration-none">
              <button className="mexican-btn-outline">
                <User size={18} className="me-2 d-none d-sm-inline" />
                <span>Login</span>
              </button>
            </Link>
            <Link to="/register" className="text-decoration-none">
              <button className="mexican-btn-outline">
                <UserPlus size={18} className="me-2 d-none d-sm-inline" />
                <span>Register</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="mexican-main-nav">
        <div className="container">
          <Link to="/" className="mexican-brand">
            <img
              src={tacoLogo}
              alt="El Mexicano Logo"
              className="mexican-logo"
            />
            <span className="mexican-brand-text">
              EL <span className="mexican-brand-highlight">MEXICANO</span>
            </span>
          </Link>

          <button
            className="mexican-toggler"
            type="button"
            onClick={toggleMenu}
            aria-controls="mexicanNavbarContent"
            aria-expanded={isMenuOpen ? "true" : "false"}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`mexican-collapse ${isMenuOpen ? "mexican-show" : ""}`} id="mexicanNavbarContent">
            <ul className="mexican-nav-list">
              <li className="mexican-nav-item">
                <Link to="/" className="mexican-nav-link mexican-active">
                  Home
                  <span className="mexican-active-indicator"></span>
                </Link>
              </li>
              <li className="mexican-nav-item">
                <Link to="/about-us" className="mexican-nav-link">
                  About Us
                </Link>
              </li>
              <li className="mexican-nav-item">
                <Link to="/menu" className="mexican-nav-link">
                  Menu
                </Link>
              </li>
              <li className="mexican-nav-item">
                <Link to="/contact" className="mexican-nav-link">
                  Contact
                </Link>
              </li>
            </ul>

            <div className="mexican-cta-container">
              <Link to="/reservations">
                <button className="btn bg-red">Book a Table</button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
