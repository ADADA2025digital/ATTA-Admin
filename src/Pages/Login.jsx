import React, { useState, useEffect } from "react";
import InputField from "../Components/InputField";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, authToken, userManager, setCookie, getCookie, deleteCookie } from "../api.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  /* Prefill from cookies if the user chose Remember me */
  useEffect(() => {
    const remembered = getCookie("rememberMe") === "true";
    const savedEmail = getCookie("rememberEmail");

    if (remembered) setRememberMe(true);
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }

    // Redirect if already authenticated
    if (userManager.isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "rememberMe") {
      setRememberMe(checked);
      return;
    }
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    const newErrors = {};

    // Validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const result = await authAPI.login(formData.email.trim(), formData.password);

        if (result.success) {
          const { data } = result;
          
          // Store token in cookies
          authToken.set({
            access_token: data.access_token,
            token_type: data.token_type,
            expires_in: 30 // 30 days
          });

          // Store user data in session storage
          userManager.setUser(data.user);

          // Remember me functionality
          if (rememberMe) {
            setCookie("rememberMe", "true", 30);
            setCookie("rememberEmail", formData.email.trim(), 30);
          } else {
            deleteCookie("rememberMe");
            deleteCookie("rememberEmail");
          }

          showMessage(data.message || "Login successful!", "success");
          
          // Redirect to home page
          setTimeout(() => {
            navigate("/");
            window.location.reload();
          }, 1000);
        } else {
          showMessage(result.error || "Login failed", "error");
        }
      } catch (error) {
        console.error("Login error:", error);
        showMessage("Network error. Please try again later.", "error");
      }
    }
    setIsLoading(false);
  };

  return (
    <div
      className="login-container bg-light w-100"
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="container d-flex align-items-center justify-content-center">
        <div
          className="login-form p-4 p-md-5 rounded-4 shadow-sm bg-white"
          style={{
            border: "2px dotted #7a70ba",
            width: "100%",
            maxWidth: "450px",
          }}
        >
          <h2 className="pb-4 text-center" style={{ color: "#7a70ba" }}>
            Login
          </h2>
          
          {/* Message Alert */}
          {message.text && (
            <div 
              className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"} mb-3`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-dark">
              <InputField
                label="Email"
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="bg-white text-dark"
              />
            </div>

            {/* Password Field with Show/Hide */}
            <div className="mb-2 position-relative text-dark">
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                className="bg-white text-dark"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "38px",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#7a70ba",
                }}
              >
                {showPassword ? (
                  <i className="bi bi-eye-slash-fill"></i>
                ) : (
                  <i className="bi bi-eye-fill"></i>
                )}
              </span>
            </div>

            {/* Remember me */}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2"
              style={{
                backgroundColor: "#7a70ba",
                color: "white",
                border: "none",
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* <div className="mt-3 text-end">
              <Link
                to="/forgot-password"
                style={{ color: "#7a70ba", textDecoration: "none" }}
              >
                Forgot Password?
              </Link>
            </div> */}
          </form>

    
        </div>
      </div>
    </div>
  );
};

export default Login;