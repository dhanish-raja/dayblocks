import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';

import { Dashboard } from '@/pages/Dashboard';
import { Journal } from '@/pages/Journal';
import { CalendarPage } from '@/pages/CalendarPage';
import { SearchPage } from '@/pages/SearchPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected application routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="journal" element={<Journal />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
