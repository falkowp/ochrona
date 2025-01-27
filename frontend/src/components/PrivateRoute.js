import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Component }) => {
    const token = localStorage.getItem("jwtToken");

    // Je�li token istnieje, zwracamy komponent, inaczej przekierowujemy na login
    return token ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
