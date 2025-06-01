import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Import Footer
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RoomChat from './pages/RoomChat'; // Will be added later
import { useAuth } from './context/AuthContext'; // Import useAuth
import './App.css';

// Protected route component using AuthContext
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Public route component (redirects if user is authenticated)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    const { user, loading } = useAuth();

    // It's good practice to wait for loading to complete before rendering routes
    // that depend on authentication state for redirection.
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading application...
            </div>
        );
    }

    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main className="app-container" style={{ flexGrow: 1 }}> {/* Use app-container and flexGrow */}
                    <Routes>
                        {/* Public Routes - redirect if logged in */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <PublicRoute>
                                    <Signup />
                                </PublicRoute>
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/room/:roomId"
                            element={
                                <ProtectedRoute>
                                    <RoomChat />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default route */}
                        <Route
                            path="/"
                            element={
                                user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                            }
                        />

                        {/* Fallback for unmatched routes */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <Footer /> {/* Add Footer here */}
            </div>
        </Router>
    );
}

export default App;