// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Mainscreen from "./screens/Mainscreen";
import Profilescreen from "./screens/Profilescreen";
import StatisticsScreen from "./screens/StatisticsScreen";
import LoginScreen from "./screens/LoginScreen";
import { auth } from "./firebase";
import "./App.css";  // make sure you import CSS

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return <div className="loading">Loading user authentication status...</div>;

  return (
    <div className="App">
      <Router>
        {user && (
          <nav className="navbar">
            <div className="nav-links">
              <Link to="/" className="nav-link">
                Main
              </Link>
              <Link to="/statistics" className="nav-link">
                Statistics
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            </div>
            <button onClick={() => auth.signOut()} className="logout-btn">
              Logout
            </button>
          </nav>
        )}
        <Routes>
          <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Mainscreen /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profilescreen /> : <Navigate to="/login" />} />
          <Route
            path="/statistics"
            element={user ? <StatisticsScreen /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
