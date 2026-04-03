import API from "./api";

export const loginUser = (username, password) => {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", username);
    params.append("password", password);

    return API.post("/auth/login", params, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};
