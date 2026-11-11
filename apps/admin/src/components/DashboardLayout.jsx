import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { session, logout, baseUrl } = useAuth();
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopyToken = () => {
    if (session?.token) {
      navigator.clipboard.writeText(session.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0f19',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Barra de Navegacion Superior */}
      <header style={{
        background: '#111827',
        borderBottom: '1px solid #1f2937',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo y Titulo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#2563eb',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 2px 8px rgba(37,99,235,0.4)'
            }}>
              🍔
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                  RapidFood <span style={{ color: '#38bdf8' }}>Backoffice</span>
                </span>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: '700'
                }}>
                  ● ERP CONECTADO
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Hub de Sincronización PWA &bull; E-commerce &bull; iDempiere REST API v1
              </div>
            </div>
          </div>

          {/* Links a las otras 2 capas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#172033',
                color: '#94a3b8',
                border: '1px solid #26334d',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🌐 E-commerce
            </a>
            <a
              href="/app"
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#172033',
                color: '#94a3b8',
                border: '1px solid #26334d',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📱 PWA Mobile
            </a>

            {/* Boton Cerrar Sesion */}
            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Purgar token y contexto local de iDempiere"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Franja de Contexto Activo de iDempiere (Requerimiento 1.1) */}
        <div style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.75rem'
        }}>
          {/* Pills de Contexto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#94a3b8', fontWeight: '700' }}>Contexto ERP:</span>
            
            <span style={{
              background: '#1e293b',
              padding: '3px 8px',
              borderRadius: '4px',
              color: '#cbd5e1',
              border: '1px solid #334155'
            }}>
              👤 <strong>Usuario:</strong> {session?.userName || 'Usuario ERP'}
            </span>

            <span style={{
              background: '#1e293b',
              padding: '3px 8px',
              borderRadius: '4px',
              color: '#38bdf8',
              border: '1px solid #334155'
            }}>
              🏢 <strong>Tenant (Client):</strong> [{session?.clientId}] {session?.clientName || 'GardenWorld'}
            </span>

            <span style={{
              background: '#1e293b',
              padding: '3px 8px',
              borderRadius: '4px',
              color: '#a78bfa',
              border: '1px solid #334155'
            }}>
              🛡️ <strong>Rol:</strong> [{session?.roleId}] {session?.roleName || 'Admin'}
            </span>

            <span style={{
              background: '#1e293b',
              padding: '3px 8px',
              borderRadius: '4px',
              color: '#34d399',
              border: '1px solid #334155'
            }}>
              🏛️ <strong>Org:</strong> [{session?.organizationId ?? session?.orgId}] {session?.organizationName || 'HQ'}
            </span>

            <span style={{
              background: '#1e293b',
              padding: '3px 8px',
              borderRadius: '4px',
              color: '#fbbf24',
              border: '1px solid #334155'
            }}>
              📦 <strong>Almacén:</strong> [{session?.warehouseId}] {session?.warehouseName || 'HQ Warehouse'}
            </span>

            <span style={{
              background: '#1e293b',
              padding: '3px 8px',
              borderRadius: '4px',
              color: '#94a3b8',
              border: '1px solid #334155'
            }}>
              🌐 <strong>Idioma:</strong> {session?.language || 'en_US'}
            </span>
          </div>

          {/* Token Status y Servidor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b' }}>
              Servidor: <strong style={{ color: '#94a3b8' }}>{session?.baseUrl || baseUrl}</strong>
            </span>
            <button
              onClick={handleCopyToken}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: copiedToken ? '#10b981' : '#38bdf8',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
              title="Copiar Bearer Token de iDempiere al portapapeles"
            >
              {copiedToken ? '✓ Token Copiado' : '🔑 Copiar Token'}
            </button>
          </div>
        </div>
      </header>

      {/* Cuerpo Central */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>

      {/* Pie de Pagina */}
      <footer style={{
        background: '#0d1322',
        borderTop: '1px solid #1f2937',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        NextCollege RapidFood Platform &bull; Solución 3 Capas: E-commerce + PWA Preventa + Admin ERP Hub
      </footer>
    </div>
  );
}

