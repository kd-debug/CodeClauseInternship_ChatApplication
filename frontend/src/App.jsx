import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RoomChat from './pages/RoomChat';
import { useAuth } from './context/AuthContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 130px)' }}>Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 130px)' }}>Loading...</div>;
    }
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main className="app-container" style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    Loading application...
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main className="app-container" style={{ flexGrow: 1 }}>
                    <Routes>
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
                        <Route
                            path="/"
                            element={
                                user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;