import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard'; 

function App() {
    return (
        <Router>
            <div className="App">
                <h1>Welcome to the Login Page</h1>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />  
                </Routes>
            </div>
        </Router>
    );
}

export default App;
