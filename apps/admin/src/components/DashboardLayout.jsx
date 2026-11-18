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

// Catálogos Maestros Sincronizables iDempiere ERP
import ProductCategoriesView from './ProductCategoriesView';
import ProductsView from './ProductsView';
import PriceListsView from './PriceListsView';
import CustomerCategoriesView from './CustomerCategoriesView';
import CustomersView from './CustomersView';
import TaxesView from './TaxesView';

export default function DashboardLayout() {
  const { session, logout } = useAuth();
  
  // Vista activa
  const [activeView, setActiveView] = useState('summary');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const navGroups = [
    {
      title: 'OPERACIONES & VENTAS',
      items: [
        { id: 'summary', label: 'Resumen General', icon: '📊' },
        { id: 'catalog', label: 'Catálogo Hamburguesas', icon: '🍔', badge: '10' },
        { id: 'orders', label: 'Bandeja Pedidos', icon: '📦', badge: '5' },
        { id: 'customers', label: 'Métricas Clientes', icon: '📈' }
      ]
    },
    {
      title: 'CATÁLOGOS ERP • SQLITE',
      items: [
        { id: 'product_categories', label: 'Categorías Prod.', icon: '📁' },
        { id: 'products', label: 'Maestro Productos', icon: '📦' },
        { id: 'prices', label: 'Listas y Precios', icon: '🏷️' },
        { id: 'customer_categories', label: 'Categorías Clientes', icon: '👥' },
        { id: 'erp_customers', label: 'Clientes / Partners', icon: '🏢' },
        { id: 'taxes', label: 'Impuestos (Solo Lectura)', icon: '⚖️', readOnlyBadge: 'Lectura' }
      ]
    },
    {
      title: 'SISTEMA & CONECTIVIDAD',
      items: [
        { id: 'database', label: 'Estado SQLite DB', icon: '💾' },
        { id: 'idempiere', label: 'iDempiere ERP v1', icon: '🛡️', liveBadge: 'Live' },
        { id: 'profile', label: 'Perfil & Conexión ERP', icon: '👤' }
      ]
    }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Toast Notification flotante */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 99999,
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '0.88rem',
          fontWeight: '600',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          background: notification.type === 'error' ? '#ef4444' : notification.type === 'warning' ? '#f59e0b' : '#10b981',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>{notification.type === 'error' ? '❌' : notification.type === 'warning' ? '⚠️' : '✅'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. SIDEBAR IZQUIERDA */}
      <aside style={{
        width: '265px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
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
                CONTROL DASHBOARD v2
              </div>
            </div>
          </div>

          {/* Menú de Navegación Lateral por Grupos */}
          <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {navGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <div style={{
                  padding: '4px 10px 8px 10px',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  color: '#94a3b8',
                  letterSpacing: '0.06em'
                }}>
                  {group.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {group.items.map(item => {
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
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: isActive ? '#fef3c7' : 'transparent',
                          color: isActive ? '#b45309' : '#475569',
                          fontWeight: isActive ? '800' : '600',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span style={{
                            backgroundColor: isActive ? '#f59e0b' : '#e2e8f0',
                            color: isActive ? '#ffffff' : '#64748b',
                            borderRadius: '9999px',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            padding: '1px 6px'
                          }}>
                            {item.badge}
                          </span>
                        )}

                        {item.readOnlyBadge && (
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            fontSize: '0.62rem',
                            fontWeight: '700',
                            padding: '1px 5px'
                          }}>
                            {item.readOnlyBadge}
                          </span>
                        )}

                        {item.liveBadge && (
                          <span style={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            borderRadius: '9999px',
                            fontSize: '0.62rem',
                            fontWeight: '800',
                            padding: '1px 6px'
                          }}>
                            {item.liveBadge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer del Sidebar con Token Info y Accesos Rápidos */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#fafafa'
        }}>
          {/* Card Usuario Activo y Token Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
              }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                  {session?.userName || 'admin@gardenworld.com'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {session?.roleName || 'GardenAdmin'} &bull; Org #{session?.orgId || session?.organizationId || '11'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTokenModalOpen(true)}
              title="Abrir Inspector de Sesión iDempiere ERP"
              style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🔑 Token
            </button>
          </div>

          {/* Enlaces de Acceso Rápido a Portales */}
          <div style={{ display: 'flex', gap: '6px', fontSize: '0.72rem' }}>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              🍔 E-commerce
            </a>
            <a
              href="/app"
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              📱 PWA Móvil
            </a>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL DERECHA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
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
              {activeView === 'product_categories' && 'Categorías de Productos (M_Product_Category)'}
              {activeView === 'products' && 'Maestro de Productos (M_Product)'}
              {activeView === 'prices' && 'Listas de Precios & Tarifas (M_PriceList)'}
              {activeView === 'customer_categories' && 'Grupos de Clientes (C_BP_Group)'}
              {activeView === 'erp_customers' && 'Directorio de Clientes & Socios (C_BPartner)'}
              {activeView === 'taxes' && 'Catálogo de Impuestos & Tasas (C_Tax) [Solo Lectura]'}
              {activeView === 'database' && 'Estado del Datamart SQLite & Servidor'}
              {activeView === 'idempiere' && 'Integración iDempiere ERP REST v1'}
              {activeView === 'profile' && 'Perfil de Usuario & Conexión ERP'}
            </h1>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Plataforma comercial y operacional RapidFood &bull; Sincronización ERP iDempiere &bull; SQLite Datamart
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
              ⚡ SQLite WAL Activo
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

          {/* Vistas de Catálogos Maestros ERP con SQLite */}
          {activeView === 'product_categories' && (
            <ProductCategoriesView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'products' && (
            <ProductsView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'prices' && (
            <PriceListsView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'customer_categories' && (
            <CustomerCategoriesView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'erp_customers' && (
            <CustomersView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'taxes' && (
            <TaxesView
              session={session}
              onNotify={showNotification}
            />
          )}

          {/* Vistas de Sistema & Configuración */}
          {activeView === 'database' && (
            <DatabaseStatusView
              session={session}
              onNotify={showNotification}
              onGlobalSyncSuccess={() => showNotification('success', 'Todos los catálogos se han sincronizado con SQLite.')}
            />
          )}

          {activeView === 'idempiere' && (
            <IDempiereIntegrationView />
          )}

          {activeView === 'profile' && (
            <ProfileConfigView />
          )}
        </main>
      </div>

      {/* Modal Inspector de Sesión iDempiere ERP REST */}
      <TokenInfoModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
}
