import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap around the app and provide authentication state
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkLoginStatus = async () => {
        try {
            const response = await axios.get('/api/auth/checkme');
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    
    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
            window.location.href = '/'; // Redirect to home page after logout
        } catch (error) {
            console.error("Logout Error:", error.response?.data?.message || error.message);
            alert(`Logout failed: ${error.response?.data?.message || error.message}`);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, checkLoginStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
