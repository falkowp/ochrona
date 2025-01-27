import React from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMessage from "./pages/AddMessage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Trasa domyœlna */}
                    <Route
                        path="/"
                        element={
                            localStorage.getItem("jwtToken")
                                ? <Navigate to="/dashboard" />
                                : <Navigate to="/login" />
                        }
                    />

                    {/* Trasy publiczne */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Trasy chronione */}
                    <Route path="/dashboard" element={<PrivateRoute element={Dashboard} />} />
                    <Route path="/addmsg" element={<PrivateRoute element={AddMessage} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
