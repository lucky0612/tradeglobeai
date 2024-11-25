import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Drawback from './pages/Drawback';
import Rodtep from './pages/Rodtep';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/documents" element={
                <ProtectedRoute>
                    <Documents />
                </ProtectedRoute>
            } />
            <Route path="/drawback" element={
                <ProtectedRoute>
                    <Drawback />
                </ProtectedRoute>
            } />
            <Route path="/rodtep" element={
                <ProtectedRoute>
                    <Rodtep />
                </ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute>
                    <Analytics />
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

export default AppRoutes;