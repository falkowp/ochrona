import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Component }) => {
    const token = localStorage.getItem("jwtToken");

    // Jeœli token istnieje, zwracamy komponent, inaczej przekierowujemy na login
    return token ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
