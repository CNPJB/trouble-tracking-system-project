import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    if (!user) return null; // If no user, don't render the navbar
    console.log("Current User Role:", user?.role);
    const avatarSrc = user.avatarUrl ? user.avatarUrl : '/default-avatar.png';

    return (
        <nav className="navbar">
            <div className='navbar-container'>

                {/* Logo */}
                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}> */}
                <div className="navbar-logo">
                    MyWeb App
                </div>

                {/* Menu */}
                <div className="navbar-menu">
                    <NavLink to="/" className="nav-menu-item">
                        Home
                    </NavLink>
                    <NavLink to="/addIssue" className="nav-menu-item">
                        Add Issue
                    </NavLink>
                    <NavLink to="/tracking" className="nav-menu-item">
                        Tracking
                    </NavLink>
                    <NavLink to="/statistics" className="nav-menu-item">
                        Statistics
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
                            Menu admin
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
            </div>
        </nav>
    );
};

export default Navbar;
