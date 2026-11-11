import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_DEMO_CONFIG, PROXY_MODES } from '../services/authService';

export default function LoginView() {
  const {
    loginDirect,
    loginStep1,
    loginStep2,
    loading,
    authError,
    clearError,
    baseUrl,
    setBaseUrl,
    proxyMode,
    setProxyMode,
    customProxyUrl,
    setCustomProxyUrl
  } = useAuth();

  // Modalidad: 'direct' (1 Paso) o 'assisted' (2 Pasos)
  const [activeTab, setActiveTab] = useState('direct');

  // Formulario 1 Paso (Directo)
  const [directForm, setDirectForm] = useState({
    userName: DEFAULT_DEMO_CONFIG.userName,
    password: DEFAULT_DEMO_CONFIG.password,
    clientId: DEFAULT_DEMO_CONFIG.parameters.clientId,
    roleId: DEFAULT_DEMO_CONFIG.parameters.roleId,
    organizationId: DEFAULT_DEMO_CONFIG.parameters.organizationId,
    warehouseId: DEFAULT_DEMO_CONFIG.parameters.warehouseId,
    language: DEFAULT_DEMO_CONFIG.parameters.language
  });

  // Formulario 2 Pasos (Asistido)
  const [assistedStep, setAssistedStep] = useState(1); // 1 = Credenciales, 2 = Contexto
  const [assistedCreds, setAssistedCreds] = useState({
    userName: DEFAULT_DEMO_CONFIG.userName,
    password: DEFAULT_DEMO_CONFIG.password
  });
  const [step1ResponseData, setStep1ResponseData] = useState(null);
  const [dynamicOptions, setDynamicOptions] = useState({
    clients: [],
    roles: [],
    organizations: [],
    warehouses: []
  });
  const [selectedContext, setSelectedContext] = useState({
    clientId: '',
    clientName: '',
    roleId: '',
    roleName: '',
    organizationId: '',
    organizationName: '',
    warehouseId: '',
    warehouseName: '',
    language: 'en_US'
  });

  // Visor de JSON de depuración
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [debugLog, setDebugLog] = useState(null);

  // Accion: Cargar Demo GardenWorld
  const handleLoadGardenWorldDemo = () => {
    clearError();
    setBaseUrl(DEFAULT_DEMO_CONFIG.baseUrl);
    setDirectForm({
      userName: DEFAULT_DEMO_CONFIG.userName,
      password: DEFAULT_DEMO_CONFIG.password,
      clientId: DEFAULT_DEMO_CONFIG.parameters.clientId,
      roleId: DEFAULT_DEMO_CONFIG.parameters.roleId,
      organizationId: DEFAULT_DEMO_CONFIG.parameters.organizationId,
      warehouseId: DEFAULT_DEMO_CONFIG.parameters.warehouseId,
      language: DEFAULT_DEMO_CONFIG.parameters.language
    });
    setAssistedCreds({
      userName: DEFAULT_DEMO_CONFIG.userName,
      password: DEFAULT_DEMO_CONFIG.password
    });
    setDebugLog({
      type: 'info',
      message: 'Valores predeterminados de Demo GardenWorld cargados con exito.',
      timestamp: new Date().toLocaleTimeString()
    });
  };

  // Manejo de Login Directo (1 Paso)
  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setDebugLog(null);

    const payloadPreview = {
      userName: directForm.userName,
      password: '***',
      parameters: {
        clientId: Number(directForm.clientId),
        roleId: Number(directForm.roleId),
        organizationId: Number(directForm.organizationId),
        warehouseId: Number(directForm.warehouseId),
        language: directForm.language
      }
    };

    try {
      const session = await loginDirect(
        { userName: directForm.userName, password: directForm.password },
        {
          clientId: directForm.clientId,
          roleId: directForm.roleId,
          organizationId: directForm.organizationId,
          warehouseId: directForm.warehouseId,
          language: directForm.language
        }
      );
      setDebugLog({
        type: 'success',
        message: `Autenticado exitosamente en iDempiere como ${session.userName}. Latencia: ${session.latencyMs}ms`,
        payload: payloadPreview,
        session
      });
    } catch (err) {
      setDebugLog({
        type: 'error',
        message: err.message,
        payload: payloadPreview,
        error: err
      });
    }
  };

  // Manejo de Modalidad 2 - Paso 1: Enviar credenciales
  const handleAssistedStep1Submit = async (e) => {
    e.preventDefault();
    clearError();
    setDebugLog(null);

    try {
      const result = await loginStep1(assistedCreds);
      setStep1ResponseData(result);

      // Extraer lista de clientes, o poblar opciones de respaldo si el ERP responde lista anidada
      const clientsList = result.clients && result.clients.length > 0 
        ? result.clients 
        : [
            { id: 11, name: '11 - GardenWorld', roles: [
              { id: 102, name: '102 - GardenWorld Admin', organizations: [
                { id: 11, name: '11 - HQ', warehouses: [
                  { id: 103, name: '103 - HQ Warehouse' }
                ]}
              ]}
            ]}
          ];

      setDynamicOptions(prev => ({
        ...prev,
        clients: clientsList
      }));

      // Preseleccionar primer cliente
      const defaultClient = clientsList[0];
      const defaultRole = defaultClient?.roles?.[0];
      const defaultOrg = defaultRole?.organizations?.[0];
      const defaultWh = defaultOrg?.warehouses?.[0];

      setSelectedContext({
        clientId: defaultClient?.id ?? 11,
        clientName: defaultClient?.name ?? 'GardenWorld',
        roleId: defaultRole?.id ?? 102,
        roleName: defaultRole?.name ?? 'GardenWorld Admin',
        organizationId: defaultOrg?.id ?? 11,
        organizationName: defaultOrg?.name ?? 'HQ',
        warehouseId: defaultWh?.id ?? 103,
        warehouseName: defaultWh?.name ?? 'HQ Warehouse',
        language: 'en_US'
      });

      setAssistedStep(2);
      setDebugLog({
        type: 'info',
        message: 'Paso 1 completado: Credenciales validadas. Selecciona el contexto empresarial para continuar.',
        data: result
      });
    } catch (err) {
      setDebugLog({
        type: 'error',
        message: err.message,
        error: err
      });
    }
  };

  // Manejo de Modalidad 2 - Paso 2: Confirmar contexto
  const handleAssistedStep2Submit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      const session = await loginStep2(
        assistedCreds,
        step1ResponseData?.tempToken,
        selectedContext
      );
      setDebugLog({
        type: 'success',
        message: `Sesion establecida exitosamente con el contexto ${selectedContext.clientName} / ${selectedContext.roleName}.`,
        session
      });
    } catch (err) {
      setDebugLog({
        type: 'error',
        message: err.message,
        error: err
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #131c31 0%, #0b0f19 70%)',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Contenedor Principal */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Cabecera del Portal */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1px solid #1f2937',
          background: 'linear-gradient(180deg, rgba(37,99,235,0.08) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#2563eb',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
              }}>
                🍔
              </div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                  RapidFood <span style={{ color: '#38bdf8' }}>Admin Hub</span>
                </h1>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Autenticación Centralizada &bull; iDempiere REST API v1
                </p>
              </div>
            </div>

            {/* Boton Acceso Rapido Demo GardenWorld */}
            <button
              type="button"
              onClick={handleLoadGardenWorldDemo}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
              title="Rellena autom&aacute;ticamente credenciales del servidor oficial de pruebas test.idempiere.org"
            >
              ⚡ Cargar Demo GardenWorld
            </button>
          </div>
        </div>

        {/* Barra de Conectividad (URL Base y CORS Proxy) */}
        <div style={{
          padding: '16px 32px',
          background: '#0d1322',
          borderBottom: '1px solid #1f2937',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                🌐 Servidor iDempiere Base URL:
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://test.idempiere.org:443"
                style={{
                  width: '100%',
                  background: '#172033',
                  border: '1px solid #26334d',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                🛡️ Modo de Proxy CORS:
              </label>
              <select
                value={proxyMode}
                onChange={(e) => setProxyMode(e.target.value)}
                style={{
                  width: '100%',
                  background: '#172033',
                  border: '1px solid #26334d',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <option value={PROXY_MODES.CORSPROXY}>corsproxy.io (Recomendado pruebas)</option>
                <option value={PROXY_MODES.LOCAL}>Proxy Local Node (/api/idempiere-proxy)</option>
                <option value={PROXY_MODES.NONE}>Directo (Sin Proxy - Requiere CORS ERP)</option>
                <option value={PROXY_MODES.CUSTOM}>Proxy Personalizado</option>
              </select>
            </div>
          </div>

          {proxyMode === PROXY_MODES.CUSTOM && (
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                value={customProxyUrl}
                onChange={(e) => setCustomProxyUrl(e.target.value)}
                placeholder="https://mi-proxy.ejemplo.com/?url="
                style={{
                  width: '100%',
                  background: '#172033',
                  border: '1px solid #26334d',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          )}
        </div>

        {/* Pestañas de Modalidades de Autenticación */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #1f2937',
          background: '#0f172a'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('direct'); clearError(); }}
            style={{
              flex: 1,
              padding: '14px 16px',
              border: 'none',
              background: activeTab === 'direct' ? '#111827' : 'transparent',
              color: activeTab === 'direct' ? '#38bdf8' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'direct' ? '2px solid #38bdf8' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            🚀 Modalidad 1: Login Directo (1 Paso)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('assisted'); clearError(); }}
            style={{
              flex: 1,
              padding: '14px 16px',
              border: 'none',
              background: activeTab === 'assisted' ? '#111827' : 'transparent',
              color: activeTab === 'assisted' ? '#38bdf8' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'assisted' ? '2px solid #38bdf8' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            🧭 Modalidad 2: Login Asistido (Multitenant 2 Pasos)
          </button>
        </div>

        {/* Mensaje de Error (si existe) */}
        {authError && (
          <div style={{
            margin: '18px 32px 0',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', marginBottom: '2px' }}>Fallo en Autenticación iDempiere</div>
              <div style={{ wordBreak: 'break-word' }}>{authError}</div>
            </div>
            <button
              onClick={clearError}
              style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* CONTENIDO MODALIDAD 1: LOGIN DIRECTO (1 PASO) */}
        {activeTab === 'direct' && (
          <form onSubmit={handleDirectSubmit} style={{ padding: '24px 32px 32px' }}>
            <div style={{ marginBottom: '16px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Envío directo de credenciales y contexto fijo en una sola petición a 
              <code style={{ color: '#38bdf8', background: '#1e293b', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>
                POST /api/v1/auth/tokens
              </code>
            </div>

            {/* Credenciales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Usuario ERP (userName)
                </label>
                <input
                  type="text"
                  required
                  value={directForm.userName}
                  onChange={(e) => setDirectForm({ ...directForm, userName: e.target.value })}
                  placeholder="admin @ gardenworld.com"
                  style={{
                    width: '100%',
                    background: '#172033',
                    border: '1px solid #26334d',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Contraseña (password)
                </label>
                <input
                  type="password"
                  required
                  value={directForm.password}
                  onChange={(e) => setDirectForm({ ...directForm, password: e.target.value })}
                  placeholder="GardenAdmin"
                  style={{
                    width: '100%',
                    background: '#172033',
                    border: '1px solid #26334d',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Parametros de Contexto iDempiere (Objeto parameters) */}
            <div style={{
              background: '#0d1322',
              border: '1px solid #1f2937',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '22px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📦 Parámetros de Contexto ERP (Objeto "parameters")
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Valores numéricos ID de iDempiere
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Client ID:
                  </label>
                  <input
                    type="number"
                    required
                    value={directForm.clientId}
                    onChange={(e) => setDirectForm({ ...directForm, clientId: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#172033',
                      border: '1px solid #26334d',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Role ID:
                  </label>
                  <input
                    type="number"
                    required
                    value={directForm.roleId}
                    onChange={(e) => setDirectForm({ ...directForm, roleId: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#172033',
                      border: '1px solid #26334d',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Organization ID:
                  </label>
                  <input
                    type="number"
                    required
                    value={directForm.organizationId}
                    onChange={(e) => setDirectForm({ ...directForm, organizationId: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#172033',
                      border: '1px solid #26334d',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Warehouse ID:
                  </label>
                  <input
                    type="number"
                    required
                    value={directForm.warehouseId}
                    onChange={(e) => setDirectForm({ ...directForm, warehouseId: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#172033',
                      border: '1px solid #26334d',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Language:
                  </label>
                  <input
                    type="text"
                    required
                    value={directForm.language}
                    onChange={(e) => setDirectForm({ ...directForm, language: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#172033',
                      border: '1px solid #26334d',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Botones de Accion */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? '#475569' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? 'Validando con iDempiere...' : '🔐 Ingresar al Panel de Administración'}
              </button>

              <button
                type="button"
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                style={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  color: '#94a3b8',
                  borderRadius: '10px',
                  padding: '13px 16px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                title="Inspeccionar Payload JSON para iDempiere REST API v1"
              >
                {showJsonInspector ? 'Ocultar JSON' : '🔍 Ver Payload'}
              </button>
            </div>
          </form>
        )}

        {/* CONTENIDO MODALIDAD 2: LOGIN ASISTIDO (MULTITENANT 2 PASOS) */}
        {activeTab === 'assisted' && (
          <div style={{ padding: '24px 32px 32px' }}>
            {/* Indicador de pasos */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '20px',
              fontSize: '0.82rem'
            }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                background: assistedStep === 1 ? '#2563eb' : '#1e293b',
                color: assistedStep === 1 ? '#ffffff' : '#94a3b8',
                fontWeight: '700'
              }}>
                Paso 1: Validar Credenciales
              </span>
              <span style={{ color: '#475569' }}>&rarr;</span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                background: assistedStep === 2 ? '#2563eb' : '#1e293b',
                color: assistedStep === 2 ? '#ffffff' : '#94a3b8',
                fontWeight: '700'
              }}>
                Paso 2: Seleccionar Tenant y Rol
              </span>
            </div>

            {assistedStep === 1 ? (
              <form onSubmit={handleAssistedStep1Submit}>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
                  iDempiere validará el usuario y devolverá la jerarquía de clientes, roles y almacenes permitidos para su cuenta.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                      Usuario ERP (userName)
                    </label>
                    <input
                      type="text"
                      required
                      value={assistedCreds.userName}
                      onChange={(e) => setAssistedCreds({ ...assistedCreds, userName: e.target.value })}
                      style={{
                        width: '100%',
                        background: '#172033',
                        border: '1px solid #26334d',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#f8fafc',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                      Contraseña (password)
                    </label>
                    <input
                      type="password"
                      required
                      value={assistedCreds.password}
                      onChange={(e) => setAssistedCreds({ ...assistedCreds, password: e.target.value })}
                      style={{
                        width: '100%',
                        background: '#172033',
                        border: '1px solid #26334d',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#f8fafc',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#475569' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px 20px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
                  }}
                >
                  {loading ? 'Consultando Tenants...' : 'Continuar al Paso 2 &rarr;'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAssistedStep2Submit}>
                <div style={{
                  background: '#0d1322',
                  border: '1px solid #1f2937',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Cliente / Tenant:
                      </label>
                      <select
                        value={selectedContext.clientId}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const client = dynamicOptions.clients.find(c => c.id === id);
                          setSelectedContext(prev => ({
                            ...prev,
                            clientId: id,
                            clientName: client?.name || `Client #${id}`
                          }));
                        }}
                        style={{
                          width: '100%',
                          background: '#172033',
                          border: '1px solid #26334d',
                          borderRadius: '6px',
                          padding: '9px 10px',
                          color: '#f8fafc',
                          fontSize: '0.85rem'
                        }}
                      >
                        {dynamicOptions.clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name || `Cliente #${c.id}`}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Rol de Acceso:
                      </label>
                      <input
                        type="number"
                        value={selectedContext.roleId}
                        onChange={(e) => setSelectedContext(prev => ({ ...prev, roleId: Number(e.target.value) }))}
                        placeholder="Ej. 102 (Admin)"
                        style={{
                          width: '100%',
                          background: '#172033',
                          border: '1px solid #26334d',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#f8fafc',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Organización ID:
                      </label>
                      <input
                        type="number"
                        value={selectedContext.organizationId}
                        onChange={(e) => setSelectedContext(prev => ({ ...prev, organizationId: Number(e.target.value) }))}
                        placeholder="Ej. 11 (HQ)"
                        style={{
                          width: '100%',
                          background: '#172033',
                          border: '1px solid #26334d',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#f8fafc',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Almacén ID:
                      </label>
                      <input
                        type="number"
                        value={selectedContext.warehouseId}
                        onChange={(e) => setSelectedContext(prev => ({ ...prev, warehouseId: Number(e.target.value) }))}
                        placeholder="Ej. 103 (HQ Warehouse)"
                        style={{
                          width: '100%',
                          background: '#172033',
                          border: '1px solid #26334d',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#f8fafc',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setAssistedStep(1)}
                    style={{
                      background: '#1f2937',
                      color: '#94a3b8',
                      border: '1px solid #374151',
                      borderRadius: '10px',
                      padding: '12px 18px',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    &larr; Volver
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: loading ? '#475569' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 20px',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(16,185,129,0.3)'
                    }}
                  >
                    {loading ? 'Confirmando sesión...' : 'Confirmar Contexto y Entrar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Visor de Payload / Debug JSON */}
        {showJsonInspector && (
          <div style={{
            background: '#090d16',
            borderTop: '1px solid #1f2937',
            padding: '18px 32px',
            fontSize: '0.78rem',
            fontFamily: 'monospace'
          }}>
            <div style={{ color: '#38bdf8', fontWeight: '700', marginBottom: '8px' }}>
              📡 Estructura del Payload JSON (Strict iDempiere REST API v1):
            </div>
            <pre style={{
              background: '#111827',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #1f2937',
              color: '#34d399',
              overflowX: 'auto',
              margin: 0
            }}>
{JSON.stringify({
  userName: directForm.userName,
  password: directForm.password ? '••••••••' : '',
  parameters: {
    clientId: Number(directForm.clientId),
    roleId: Number(directForm.roleId),
    organizationId: Number(directForm.organizationId),
    warehouseId: Number(directForm.warehouseId),
    language: directForm.language
  }
}, null, 2)}
            </pre>
            <div style={{ marginTop: '8px', color: '#64748b' }}>
              Endpoint: <code>POST {baseUrl}/api/v1/auth/tokens</code> | Cabeceras: <code>Content-Type: application/json</code>
            </div>
          </div>
        )}

        {/* Registro de Depuracion en Vivo */}
        {debugLog && (
          <div style={{
            background: debugLog.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            borderTop: '1px solid #1f2937',
            padding: '14px 32px',
            fontSize: '0.8rem',
            color: debugLog.type === 'error' ? '#fca5a5' : '#86efac'
          }}>
            <div style={{ fontWeight: '700' }}>
              {debugLog.type === 'error' ? '❌ Registro de Error:' : '✅ Registro de Éxito:'}
            </div>
            <div>{debugLog.message}</div>
          </div>
        )}

        {/* Pie de Pagina de la Tarjeta */}
        <div style={{
          padding: '14px 32px',
          background: '#0d1322',
          borderTop: '1px solid #1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>NextCollege RapidFood &bull; Masterclass ERP Sync</div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <a href="/" style={{ color: '#38bdf8', textDecoration: 'none' }}>🌐 E-commerce</a>
            <span>&bull;</span>
            <a href="/app" style={{ color: '#38bdf8', textDecoration: 'none' }}>📱 PWA Preventa</a>
          </div>
        </div>
      </div>
    </div>
  );
}

