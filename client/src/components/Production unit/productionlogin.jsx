import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./productionlogin.css";

const Productionlogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Production login failed");
      }

      // Store production username
      localStorage.setItem("productionUser", data.user.username);
      navigate("/production-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToAdminLogin = () => {
    navigate("/login");
  };

  return (
    <div className="production-login-container">
      <div className="production-login-logo-container">
        <div className="production-logo-main">
          <span className="production-logo-d">D</span>
          <span className="production-logo-h">H</span>
        </div>
        <div className="production-logo-text">
          <span className="production-logo-title">DH Industries</span>
          <span className="production-logo-subtitle">Production Portal</span>
        </div>
      </div>

      <div className="production-login-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Production Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="production-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="production-admin-login-link">
          <span onClick={goToAdminLogin}>Admin Portal Login</span>
        </div>
      </div>
    </div>
  );
};

export default Productionlogin;