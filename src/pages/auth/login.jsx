import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LockKeyhole, LogIn, Moon, Sun, UserRound, Car } from "lucide-react";
import { loginUser } from "../../api/authService";
import appConfig from "../../config/appConfig";
import { getPreferredTheme, toggleTheme as switchTheme } from "../../utils/theme";

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState(() => getPreferredTheme());

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        let newErrors = {};
        if (!form.username) newErrors.username = "Username is required";
        if (!form.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleThemeToggle = () => {
        setTheme(switchTheme());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            await loginUser(form.username, form.password);
            navigate("/dashboard");
        } catch (error) {
            toast.error("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-center login-page">
            <button
                type="button"
                className="icon-btn login-theme-toggle"
                onClick={handleThemeToggle}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <main className="login-shell">
                <section className="login-showcase" aria-label={`${appConfig.appName} login`}>
                    <div className="login-showcase-brand">
                        <img src={appConfig.logo} alt="" className="login-showcase-logo" />
                        <span>{appConfig.appName}</span>
                    </div>

                    <div className="login-showcase-copy">
                        <span className="login-kicker">Pre-owned car dealership</span>
                        <div className="login-showcase-title">{appConfig.appName}</div>
                        <p>Manage used-car inventory, buyer enquiries, and sales workflows from one smart dashboard.</p>
                    </div>

                    <div className="login-showcase-features">
                        <span>Certified inventory</span>
                        <span>Buyer follow-up</span>
                        <span>Deal & finance tracking</span>
                    </div>

                    <div className="login-showcase-panel" aria-hidden="true">
                        <div className="login-showcase-badge">
                            <Car size={20} />
                            <span>POC Car CRM</span>
                        </div>
                        <p className="login-showcase-copyline">Designed for pre-owned car dealerships, this login page brings a clean automotive feel without extra dashboard clutter.</p>
                        <div className="login-showcase-road" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </section>

                <section className="login-panel card--login" aria-label="Sign in form">
                    <div className="login-brand">
                        <img src={appConfig.logo} alt={`${appConfig.appName} logo`} className="logo-img" />
                        <span>{appConfig.appName}</span>
                    </div>

                    <div className="login-heading">
                        <span className="login-heading-icon">
                            <Car size={20} />
                        </span>
                        <h1>Welcome back</h1>
                        <p>Sign in to continue</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-fields">
                            <div className="login-field">
                                <label htmlFor="username">Username</label>
                                <div className={`login-input-wrap ${errors.username ? "error" : ""}`}>
                                    <UserRound size={18} />
                                    <input
                                        id="username"
                                        className={`input ${errors.username ? "input-error" : ""}`}
                                        type="text"
                                        name="username"
                                        placeholder="Enter username"
                                        value={form.username}
                                        onChange={handleChange}
                                        autoComplete="username"
                                        aria-invalid={!!errors.username}
                                    />
                                </div>
                                {errors.username && <p className="error-text">{errors.username}</p>}
                            </div>

                            <div className="login-field">
                                <label htmlFor="password">Password</label>
                                <div className={`login-input-wrap ${errors.password ? "error" : ""}`}>
                                    <LockKeyhole size={18} />
                                    <input
                                        id="password"
                                        className={`input ${errors.password ? "input-error" : ""}`}
                                        type="password"
                                        name="password"
                                        placeholder="Enter password"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        aria-invalid={!!errors.password}
                                    />
                                </div>
                                {errors.password && <p className="error-text">{errors.password}</p>}
                            </div>
                        </div>

                        <button className="btn login-submit" type="submit" disabled={loading}>
                            <LogIn size={18} />
                            {loading ? "Signing in..." : "Login"}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default Login;
