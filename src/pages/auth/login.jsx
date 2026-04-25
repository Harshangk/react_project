import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../../api/authService";
import appConfig from "../../config/appConfig";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            const res = await loginUser(form.username, form.password);
            localStorage.setItem("access_token", res.data.access_token);
            navigate("/dashboard");
        } catch (error) {
            toast.error("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-center">
            <div className="card card--login">
                <h3 className="logo">
                    {loading ? (
                        <Skeleton width="100%" height={24} />
                    ) : (
                        <>
                            <img src={appConfig.logo} alt="logo" style={{ height: "24px", marginRight: "8px" }} />
                            {appConfig.appName}
                        </>
                    )}
                </h3>

                <form onSubmit={handleSubmit}>
                    {loading ? (
                        <>
                            <Skeleton height={40} width="100%" style={{ marginBottom: "12px" }} />
                            <Skeleton height={40} width="100%" style={{ marginBottom: "12px" }} />
                            <Skeleton height={45} width="100%" />
                        </>
                    ) : (
                        <>
                            <input
                                className={`input ${errors.username ? "input-error" : ""}`}
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                            />
                            {errors.username && <p className="error-text">{errors.username}</p>}

                            <input
                                className={`input ${errors.password ? "input-error" : ""}`}
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="error-text">{errors.password}</p>}

                            <button className="btn" type="submit">
                                Login
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default Login;
