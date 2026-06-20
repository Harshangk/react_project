import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LockKeyhole, LogIn, Moon, Sun, UserRound, Car, CheckCircle2 } from "lucide-react";
import { loginUser } from "../../api/authService";
import appConfig from "../../config/appConfig";
import { getPreferredTheme, toggleTheme as switchTheme } from "../../utils/theme";
import { useUser } from "../../context/UserContext";

const FEATURES = [
    "Buyer lead management & followup",
    "Pre-owned inventory tracking",
    "Role-based access & team assignment",
    "Deal & pre-price workflow",
];

function Login() {
    const navigate = useNavigate();
    const { refreshUser } = useUser();
    const [form, setForm] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState(() => getPreferredTheme());

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        const newErrors = {};
        if (!form.username.trim()) newErrors.username = "Username is required";
        if (!form.password)        newErrors.password = "Password is required";
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
            await refreshUser();
            navigate("/dashboard");
        } catch {
            toast.error("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-center login-page">
            {/* Theme toggle */}
            <button
                type="button"
                className="icon-btn login-theme-toggle"
                onClick={handleThemeToggle}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <main className="login-shell">
                {/* LEFT — brand showcase */}
                <section className="login-showcase" aria-label={`${appConfig.appName} product overview`}>
                    <div className="login-showcase-brand">
                        <div className="jm-badge jm-badge--lg">JM</div>
                        <span className="jm-brand-name jm-brand-name--lg">
                            <span className="jm-accent">Jolly</span>CRM
                        </span>
                    </div>

                    <div className="login-showcase-copy">
                        <span className="login-kicker">Pre-owned car dealership CRM</span>
                        <div className="login-showcase-title">
                            Run your dealership smarter.
                        </div>
                        <p>One dashboard for leads, followups, pre-pricing, and team coordination.</p>

                        <div className="login-showcase-features" style={{ marginTop: 20 }}>
                            {FEATURES.map((f) => (
                                <div
                                    key={f}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: "var(--text-main)",
                                    }}
                                >
                                    <CheckCircle2 size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="login-showcase-panel" aria-hidden="true">
                        <div className="login-showcase-badge">
                            <Car size={18} />
                            <span>Trusted by dealerships</span>
                        </div>
                        <div className="login-showcase-road">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </section>

                {/* RIGHT — form */}
                <section className="login-panel card--login" aria-label="Sign in">
                    <div className="login-brand">
                        <div className="jm-badge jm-badge--lg">JM</div>
                        <div className="login-brand-text">
                            <div className="jm-brand-name jm-brand-name--lg">
                                <span className="jm-accent">Jolly</span>CRM
                            </div>
                            <div className="login-brand-subtitle">Pre-Owned Car Dealership CRM</div>
                        </div>
                    </div>

                    <div className="login-heading">
                        <span className="login-heading-icon">
                            <Car size={20} />
                        </span>
                        <h1>Welcome back</h1>
                        <p>Sign in to your account to continue</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="login-fields">
                            {/* Username */}
                            <div className="login-field">
                                <label htmlFor="username">Username</label>
                                <div className={`login-input-wrap ${errors.username ? "error" : ""}`}>
                                    <UserRound size={17} aria-hidden="true" />
                                    <input
                                        id="username"
                                        className="input"
                                        type="text"
                                        name="username"
                                        placeholder="Enter your username"
                                        value={form.username}
                                        onChange={handleChange}
                                        autoComplete="username"
                                        aria-invalid={!!errors.username}
                                        aria-describedby={errors.username ? "username-error" : undefined}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="error-text" id="username-error" role="alert">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="login-field">
                                <label htmlFor="password">Password</label>
                                <div className={`login-input-wrap ${errors.password ? "error" : ""}`}>
                                    <LockKeyhole size={17} aria-hidden="true" />
                                    <input
                                        id="password"
                                        className="input"
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="error-text" id="password-error" role="alert">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            className="btn login-submit"
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <span
                                        style={{
                                            width: 16, height: 16,
                                            border: "2px solid rgba(255,255,255,0.35)",
                                            borderTopColor: "#fff",
                                            borderRadius: "50%",
                                            display: "inline-block",
                                            animation: "spin 0.7s linear infinite",
                                            flexShrink: 0,
                                        }}
                                        aria-hidden="true"
                                    />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <LogIn size={17} />
                                    Sign in
                                </>
                            )}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default Login;
