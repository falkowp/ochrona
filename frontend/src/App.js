import React from 'react';
import './App.css';
import Login from './Login';  // Zaimportuj Login.js

function App() {
    return (
        <div className="App">
            <h1>Welcome to the Login Page</h1>
            <Login /> {/* Wywo³aj komponent Login */}
        </div>
    );
}

export default App;
