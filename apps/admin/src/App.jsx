import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import DashboardLayout from './components/DashboardLayout';
import OrderManagement from './components/OrderManagement';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGuard>
          <DashboardLayout>
            <OrderManagement />
          </DashboardLayout>
        </AuthGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}
