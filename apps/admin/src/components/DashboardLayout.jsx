import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OrderManagement from './OrderManagement';
import GeneralSummaryView from './GeneralSummaryView';
import IDempiereIntegrationView from './IDempiereIntegrationView';
import BurgerCatalogView from './BurgerCatalogView';
import CustomerMetricsView from './CustomerMetricsView';
import DatabaseStatusView from './DatabaseStatusView';
import ProfileConfigView from './ProfileConfigView';
import TokenInfoModal from './TokenInfoModal';

export default function DashboardLayout() {
  const { session, logout } = useAuth();
  
  // Vista activa: 'summary' | 'catalog' | 'orders' | 'customers' | 'database' | 'idempiere' | 'profile'
  const [activeView, setActiveView] = useState('summary');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 1. SIDEBAR IZQUIERDA (Exacto a Imágenes 4 y 5) */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          {/* Logo Brand */}
          <div style={{
            padding: '20px 18px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              backgroundColor: '#ea580c',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)'
            }}>
              🍔
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', lineHeight: 1.1 }}>
                Hamburger Rapid
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#ea580c', letterSpacing: '0.05em' }}>
                CONTROL DASHBOARD v1
              </div>
            </div>
          </div>

          {/* Menú de Navegación Lateral */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'summary', label: 'Resumen General', icon: '📊' },
              { id: 'catalog', label: 'Catálogo Hamburguesas', icon: '🍔', badge: '10' },
              { id: 'orders', label: 'Bandeja Pedidos', icon: '📦', badge: '5' },
              { id: 'customers', label: 'Métricas de Clientes', icon: '👥' },
              { id: 'database', label: 'Estado Base de Datos', icon: '💾' },
              { id: 'idempiere', label: 'iDempiere ERP v1', icon: '🛡️', liveBadge: 'Live' },
              { id: 'profile', label: 'Perfil & Conexión ERP', icon: '👤' }
            ].map(item => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#fef3c7' : 'transparent',
                    color: isActive ? '#b45309' : '#475569',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.05rem' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span style={{
                      backgroundColor: isActive ? '#f59e0b' : '#e2e8f0',
                      color: isActive ? '#ffffff' : '#64748b',
                      borderRadius: '9999px',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      padding: '2px 7px'
                    }}>
                      {item.badge}
                    </span>
                  )}

                  {item.liveBadge && (
                    <span style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '2px 7px'
                    }}>
                      {item.liveBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Parte Inferior Sidebar: Contexto de Usuario y Accesos Rápidos */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #f1f5f9' }}>
          {/* Card de Usuario */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.85rem' }}>🛡️</span>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.userName || 'admin@gardenworld.com'}
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '8px' }}>
              {session?.roleName || 'GardenAdmin'} &bull; Org {session?.organizationId ?? 11}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setIsTokenModalOpen(true)}
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Token Info
              </button>
              <button
                onClick={logout}
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#dc2626',
                  cursor: 'pointer'
                }}
              >
                Salir
              </button>
            </div>
          </div>

          {/* Accesos Rápidos */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              ACCESO RÁPIDO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#0284c7',
                  textDecoration: 'none',
                  fontWeight: '700',
                  padding: '4px 6px',
                  borderRadius: '6px'
                }}
              >
                <span>🌐</span> Landing E-commerce
              </a>
              <a
                href="/app"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#ea580c',
                  textDecoration: 'none',
                  fontWeight: '700',
                  padding: '4px 6px',
                  borderRadius: '6px'
                }}
              >
                <span>📱</span> App Móvil PWA
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL CON HEADER SUPERIOR */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header Superior (Exacto a Imágenes 4 y 5) */}
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              {activeView === 'summary' && 'Panel de Control & Indicadores'}
              {activeView === 'catalog' && 'Catálogo de Hamburguesas (10 Variantes)'}
              {activeView === 'orders' && 'Bandeja Central de Gestión de Pedidos'}
              {activeView === 'customers' && 'Segmentación & Métricas de Clientes'}
              {activeView === 'database' && 'Estado del Datamart & Servidor'}
              {activeView === 'idempiere' && 'Integración iDempiere ERP REST v1'}
              {activeView === 'profile' && 'Perfil de Usuario & Conexión ERP'}
            </h1>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Plataforma comercial y operacional de Hamburger Rapid &bull; Dokploy CI/CD Live &bull; Nextcollege 2027
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Pill Usuario y Rol */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem'
            }}>
              <span style={{ color: '#0284c7' }}>👤 {session?.userName || 'admin@gardenworld.com'}</span>
              <span style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: '700'
              }}>
                {session?.roleName || 'GardenAdmin'}
              </span>
            </div>

            {/* Pill SQLite Datamart */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#b45309',
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700'
            }}>
              ⚡ SQLite Datamart
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🔄 Refrescar
            </button>

            {/* Botón Salir */}
            <button
              onClick={logout}
              style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#dc2626',
                cursor: 'pointer'
              }}
            >
              🚪 Salir
            </button>
          </div>
        </header>

        {/* 3. CONTENIDO SEGÚN LA VISTA SELECCIONADA */}
        <main key={refreshKey} style={{ flex: 1, padding: '24px 28px', maxWidth: '1440px', width: '100%' }}>
          {activeView === 'summary' && (
            <GeneralSummaryView onNavigate={setActiveView} />
          )}

          {activeView === 'catalog' && (
            <BurgerCatalogView />
          )}

          {activeView === 'orders' && (
            <OrderManagement />
          )}

          {activeView === 'customers' && (
            <CustomerMetricsView />
          )}

          {activeView === 'database' && (
            <DatabaseStatusView />
          )}

          {activeView === 'idempiere' && (
            <IDempiereIntegrationView />
          )}

          {activeView === 'profile' && (
            <ProfileConfigView />
          )}
        </main>
      </div>

      {/* Modal Inspector de Sesión iDempiere ERP REST (Exacto a Imagen 1) */}
      <TokenInfoModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
}
