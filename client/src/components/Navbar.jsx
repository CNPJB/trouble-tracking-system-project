import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './componentsStyles/Navbar.css';
// icons {
import { FaHome, FaPlus, FaMapMarkerAlt, FaChartBar, FaUserCog, } from 'react-icons/fa';
import { FiAlignJustify } from 'react-icons/fi';

const Navbar = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    if (!user) return null; // If no user, don't render the navbar
    const avatarSrc = user.avatarUrl ? user.avatarUrl : '/default-avatar.png';
    const toggleMobile = () => {
        setIsMobileOpen(!isMobileOpen);
    };
    return (
        <nav className="navbar">
            <div className='navbar-container'>

                {/* Logo */}
                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}> */}
                <div className="navbar-logo">
                    MyWeb App
                </div>
                <nav>
                    <button className="navbar-toggle" id="navbar-toggle" onClick={toggleMobile}>
                        <FiAlignJustify className="nav-toggle-icon-navbar" />
                    </button>
                    {isMobileOpen && (
                        <div className="navbar-menu-responsive">
                            <NavLink to="/" className="nav-menu-item-responsive"  onClick={toggleMobile}>
                                Home <FaHome className="nav-icon" />
                            </NavLink>
                            <NavLink to="/addIssue" className="nav-menu-item-responsive " onClick={toggleMobile}>
                                Add Issue <FaPlus className="nav-icon" />               
                            </NavLink>
                            <NavLink to="/tracking" className="nav-menu-item-responsive" onClick={toggleMobile}>
                                Tracking <FaMapMarkerAlt className="nav-icon" />
                            </NavLink>
                            <NavLink to="/statistics" className="nav-menu-item-responsive" onClick={toggleMobile}>
                                Statistics <FaChartBar className="nav-icon" />
                            </NavLink>
                            {user.role === 'admin' && (
                                <NavLink
                                    to="/adminPage/AuditIssues"
                                    onClick={toggleMobile}
                                    className={({ isActive }) =>
                                        window.location.pathname.includes('/adminPage')
                                            ? "nav-menu-item-responsive active"
                                            : "nav-menu-item-responsive"
                                    }
                                >
                                    Menu Admin <FaUserCog className="nav-icon" />
                                </NavLink>
                            )}
                        </div>
                    )}
                </nav>
                {/* Menu */}
                <div className="navbar-menu">
                    <NavLink to="/" className="nav-menu-item">
                        Home <FaHome className="nav-icon" />
                    </NavLink>
                    <NavLink to="/addIssue" className="nav-menu-item">
                        Add Issue <FaPlus className="nav-icon" />
                    </NavLink>
                    <NavLink to="/tracking" className="nav-menu-item">
                        Tracking <FaMapMarkerAlt className="nav-icon" />
                    </NavLink>
                    <NavLink to="/statistics" className="nav-menu-item">
                        Statistics <FaChartBar className="nav-icon" />
                    </NavLink>
                    {user.role === 'admin' && (
                        <NavLink
                            to="/adminPage/AuditIssues"
                            className={({ isActive }) =>
                                window.location.pathname.includes('/adminPage')
                                    ? "nav-menu-item active"
                                    : "nav-menu-item"
                            }
                        >
                            Menu Admin <FaUserCog className="nav-icon" />
                        </NavLink>
                    )}
                </div>
                {/* </div> */}
                {/* User Info */}


                <div className="navbar-user-section">

                    <div className="user-info">
                        <span className="user-name">
                            {user.fullName}
                        </span>
                        <span className="user-email">
                            {user.email}
                        </span>
                    </div>

                    <img
                        src={avatarSrc}
                        alt="Profile Avatar"
                        className="navbar-avatar"
                        referrerPolicy="no-referrer" // In case the avatar URL is from a different origin, this prevents CORS issues
                    />

                    <button className="navbar-logout-btn" onClick={logout}>
                        LogOut
                    </button>
                </div>

                <div className="navbar-user-section-responsive">
                    <img
                        src={avatarSrc}
                        alt="Profile Avatar"
                        className="navbar-avatar"
                        referrerPolicy="no-referrer" // In case the avatar URL is from a different origin, this prevents CORS issues
                    />

                    <button className="navbar-logout-btn" onClick={logout}>
                        LogOut
                    </button>
                </div>


            </div>
        </nav>
    );
};

export default Navbar;
