import React, { useState, useEffect } from "react";
import { Outlet, Route, Routes, useNavigate, Navigate } from "react-router-dom"; // FIX: Added Navigate import
import Layout from "./components/Layout";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./pages/Dashboard"
import CompletePage from "./pages/CompletePage";
import PendingPage from "./pages/PendingPage";
import Profile from "./components/Profile";

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser"); // Corrected typo 'currentUSer' to 'currentUser'
    }
  }, [currentUser]);

  const handleAuthSubmit = data => {
    const user = {
      email: data.email,
      name: data.name || "USER",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name || "User"
      )}&background=random`,
    };
    setCurrentUser(user);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  // Component to protect routes
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      // User is not authenticated, redirect to login page
      return <Navigate to="/login" replace />;
    }
    return children; // User is authenticated, render the child routes
  };

  return (
    <Routes>
      {/* Public routes (accessible without login) */}
      <Route
        path="/login"
        element={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Login
              onSubmit={handleAuthSubmit}
              onSwitchMode={() => navigate("/signup")}
            />
          </div>
        }
      />

      <Route
        path="/signup"
        element={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <SignUp
              onSubmit={handleAuthSubmit}
              onSwitchMode={() => navigate("/login")}
            />
          </div>
        }
      />

  <Route element={<ProtectedRoute><Layout user={currentUser} onLogout={handleLogout} /></ProtectedRoute>}>
  <Route index element={<Dashboard />} /> {/* default route when path is "/" */}
  <Route path="pending" element={<PendingPage />} />
  <Route path="complete" element={<CompletePage />} />
  <Route path="profile" element={<Profile user={currentUser} setCurrentUser={setCurrentUser} onLogout={handleLogout} />} />
</Route>


      {/* Fallback route for any unmatched paths */}
      {/* Redirects to home if logged in, otherwise to login */}
      <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default App;
