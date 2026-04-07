import {useState} from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import './Login.css';

const Login = () => {

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  
  const handleLocalSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const response = await axios.post('/api/auth/login', credentials);
      console.log(response.data.message);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

   const handleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/google', {
        token: credentialResponse.credential
      });

      console.log("Server Response:", response.data);
      window.location.reload(); // Reload the page to update the UI based on authentication status
    } catch (error) {
      console.error("Login Error:", error.response?.data?.message || error.message);
      alert(`Login failed: ${error.response?.data?.message || error.message}`);
      handleError();
    }
  };
  const handleError = () => {
    console.log("Login Failed");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/rmutk-logo.png" alt="University Logo" className="login-logo" />
        <h1 className="login-title">Website Portal</h1>
        <p className="login-subtitle">
          Please Login with University Email<br />(@mail.rmutk.ac.th)
        </p>
        {/* Local Login Form */}
        <form onSubmit={handleLocalSubmit} className="local-login-form">
          <input
            type="text"
            placeholder="Email"
            value={credentials.email}
            className="login-input"
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            className="login-input"
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <button type="submit" className="login-submit-btn">Login</button>
        </form>

        <div className="divider"><span>OR</span></div>

        {/* Google Login Button */}
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log("Login Failed")}
            useOneTap
            shape="pill" // ลองเปลี่ยนรูปทรงปุ่ม Google เป็นขอบมน
          />
        </div>

      </div>
    </div>
  );
};

export default Login;