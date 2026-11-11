import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginView from './LoginView';

/**
 * AuthGuard para el Panel de Administracion:
 * Protege el acceso al backoffice. Si no existe un token valido emitido por iDempiere,
 * presenta el portal de autenticacion. Si existe sesion activa, renderiza la consola.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading && !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0f19',
        color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #1e293b',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.95rem' }}>
          Verificando sesion con iDempiere ERP...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <>{children}</>;
}

