import React, { useState } from 'react'
import './Navbar.css'
import { NavLink } from 'react-router-dom'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  }
  const closeMenu = () => {
    setIsOpen(false);
  };
  return (
    <nav className='Navbar'>
      <div className='logo'>
        <img src="" alt="logo" />
      </div>

      <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
      
      <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
        <ul className="nav-links">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/report">Report</NavLink></li>
          <li><NavLink to="/my-problems">My Problems</NavLink></li>
          <li><NavLink to="/static">Static</NavLink></li>
        </ul>
        <NavLink to="/login" className='btnLogin' onClick={closeMenu}>
          Login
        </NavLink>
      </div>
    </nav>
  )
}
