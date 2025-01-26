import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; 
import AddMessage from './pages/AddMessage';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />  
                    <Route path="/addmsg" element={<AddMessage />} />  
                </Routes>
            </div>
        </Router>
    );
}

export default App;
