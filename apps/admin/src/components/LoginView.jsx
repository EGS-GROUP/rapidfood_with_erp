import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';
import { DEFAULT_GARDENWORLD_PARAMS } from '../services/idempiereAuthService';

export default function LoginView() {
  const {
    loginDirect,
    loginStep1,
    loginStep2,
    loading,
    authError,
    clearError,
    connectionMode,
    setConnectionMode,
    erpBaseUrl,
    setErpBaseUrl
  } = useAuth();
  
  // Obtener la configuración del perfil definida en el Panel de Control
  const profileConfig = AuthService.getProfileConfig() || {};
  const defaultParams = profileConfig.defaultParameters || DEFAULT_GARDENWORLD_PARAMS.parameters;

  // Modo de Login: Por defecto 'direct' (1 paso garantizado)
  const [loginMode, setLoginMode] = useState('direct');

  // Estados de formulario
  const [userName, setUserName] = useState(DEFAULT_GARDENWORLD_PARAMS.userName);
  const [password, setPassword] = useState(DEFAULT_GARDENWORLD_PARAMS.password);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para modo asistido de 2 pasos
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);

  const [selectedContext, setSelectedContext] = useState({
    clientId: defaultParams.clientId || 11,
    clientName: 'GardenWorld, Inc.',
    roleId: defaultParams.roleId || 102,
    roleName: 'GardenAdmin',
    organizationId: defaultParams.organizationId || 11,
    organizationName: 'HQ - Headquarters',
    warehouseId: defaultParams.warehouseId || 103,
    warehouseName: 'HQ Warehouse',
    language: defaultParams.language || 'es_PE'
  });

  // Rellenar Demo GardenWorld
  const handleFillDemo = (e) => {
    e?.preventDefault();
    setUserName(DEFAULT_GARDENWORLD_PARAMS.userName);
    setPassword(DEFAULT_GARDENWORLD_PARAMS.password);
    setSelectedContext({
      clientId: DEFAULT_GARDENWORLD_PARAMS.parameters.clientId,
      clientName: 'GardenWorld, Inc.',
      roleId: DEFAULT_GARDENWORLD_PARAMS.parameters.roleId,
      roleName: 'GardenWorld Admin',
      organizationId: DEFAULT_GARDENWORLD_PARAMS.parameters.organizationId,
      organizationName: 'HQ - Headquarters',
      warehouseId: DEFAULT_GARDENWORLD_PARAMS.parameters.warehouseId,
      warehouseName: 'HQ Warehouse',
      language: DEFAULT_GARDENWORLD_PARAMS.parameters.language
    });
    setErpBaseUrl(DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl);
    clearError();
    setStep(1);
    setStep1Data(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (loginMode === 'direct') {
      // 1 SOLO PASO: Autenticación directa garantizada y validada
      try {
        await loginDirect(
          {
            userName: userName.trim(),
            password,
            parameters: {
              clientId: Number(selectedContext.clientId || 11),
              roleId: Number(selectedContext.roleId || 102),
              organizationId: Number(selectedContext.organizationId || 11),
              warehouseId: Number(selectedContext.warehouseId || 103),
              language: selectedContext.language || 'es_PE'
            },
            erpBaseUrl
          },
          connectionMode
        );
      } catch (err) {
        // authError gestionado por el AuthContext
      }
    } else {
      // 2 PASOS ASISTIDO MULTI-TENANT
      if (step === 1) {
        try {
          const res = await loginStep1(
            { userName: userName.trim(), password, erpBaseUrl },
            connectionMode
          );
          setStep1Data(res);
          // Si nos devolvió listas dinámicas, preseleccionar las primeras opciones
          if (res?.clients?.length > 0) {
            setSelectedContext(prev => ({
              ...prev,
              clientId: res.clients[0].id,
              clientName: res.clients[0].name,
              roleId: res.roles?.[0]?.id || prev.roleId,
              organizationId: res.organizations?.[0]?.id || prev.organizationId,
              warehouseId: res.warehouses?.[0]?.id || prev.warehouseId
            }));
          }
          setStep(2);
        } catch (err) {
          // authError gestionado por el AuthContext
        }
      } else {
        // Paso 2: Confirmar contexto elegido y obtener token definitivo
        try {
          const stageToken = step1Data?.stage1Token || step1Data?.tempToken || step1Data?.token;
          await loginStep2(
            {
              userName: userName.trim(),
              password,
              erpBaseUrl,
              stage1Token: stageToken
            },
            {
              clientId: Number(selectedContext.clientId || 11),
              roleId: Number(selectedContext.roleId || 102),
              organizationId: Number(selectedContext.organizationId || 11),
              warehouseId: Number(selectedContext.warehouseId || 103),
              language: selectedContext.language || 'es_PE'
            },
            connectionMode
          );
        } catch (err) {
          // authError gestionado por el AuthContext
        }
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#11100e',
      backgroundImage: 'radial-gradient(circle at 50% 30%, #1f1b16 0%, #0c0b0a 80%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* TARJETA DE LOGIN CENTRAL (Exacto a Imagen 3) */}
      <div style={{
        backgroundColor: '#181715',
        border: '1px solid #2a2824',
        borderRadius: '28px',
        padding: '44px 36px 36px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(234, 88, 12, 0.05)',
        textAlign: 'center'
      }}>
        {/* Ícono de Corona Naranja en Cuadrado Redondeado */}
        <div style={{
          width: '68px',
          height: '68px',
          backgroundColor: '#ea580c',
          backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
          borderRadius: '20px',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          boxShadow: '0 12px 24px rgba(234, 88, 12, 0.35)'
        }}>
          👑
        </div>

        {/* Título y Subtítulo */}
        <h1 style={{
          fontSize: '1.65rem',
          fontWeight: '800',
          color: '#ffffff',
          margin: '0 0 6px 0',
          letterSpacing: '-0.02em'
        }}>
          Tasty Bites <span style={{ color: '#ea580c' }}>&bull;</span> Central
        </h1>

        <p style={{
          fontSize: '0.85rem',
          color: '#a3a3a3',
          margin: '0 0 24px 0',
          lineHeight: '1.4'
        }}>
          Acceso seguro al Panel de Control Corporativo
        </p>

        {/* Mensaje de Error si ocurre */}
        {authError && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            textAlign: 'left',
            marginBottom: '20px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <div>
              <strong>Error de Acceso:</strong> {authError}
            </div>
          </div>
        )}

        {/* Selector de Modo: 1 Paso Directo vs 2 Pasos Asistido */}
        <div style={{
          display: 'flex',
          backgroundColor: '#201c18',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '20px',
          border: '1px solid #332b25'
        }}>
          <button
            type="button"
            onClick={() => { setLoginMode('direct'); clearError(); setStep(1); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: loginMode === 'direct' ? '#ea580c' : 'transparent',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>⚡</span> 1 Paso (Directo)
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('assisted'); clearError(); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: loginMode === 'assisted' ? '#ea580c' : 'transparent',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🏢</span> 2 Pasos (Asistido)
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {step === 1 ? (
            <>
              {/* Campo 1: Usuario / Correo Corporativo */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#a3a3a3',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px'
                }}>
                  USUARIO / CORREO CORPORATIVO
                </label>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#edf2f7',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1'
                }}>
                  <span style={{ fontSize: '1.1rem', marginRight: '10px', color: '#64748b' }}>👤</span>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="admin @ gardenworld.com"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      outline: 'none',
                      color: '#0f172a',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      fontWeight: '600'
                    }}
                  />
                </div>
              </div>

              {/* Campo 2: Contraseña de Acceso */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: '#a3a3a3',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    CONTRASEÑA DE ACCESO
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ea580c',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '700'
                    }}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#edf2f7',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1'
                }}>
                  <span style={{ fontSize: '1.1rem', marginRight: '10px', color: '#64748b' }}>🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      outline: 'none',
                      color: '#0f172a',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      fontWeight: '600'
                    }}
                  />
                  <span style={{ fontSize: '1.1rem', marginLeft: '10px', color: '#f97316' }}>🔐</span>
                </div>
              </div>

              {/* Selector de Modo de Conexión (Proxy vs Directo) */}
              <div style={{
                marginBottom: '18px',
                padding: '12px 14px',
                backgroundColor: '#1c1917',
                border: '1px solid #332b25',
                borderRadius: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    color: '#a8a29e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Canal de Conexión ERP
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Cargar Demo GardenWorld
                  </button>
                </div>

                <select
                  value={connectionMode}
                  onChange={(e) => setConnectionMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    backgroundColor: '#11100e',
                    border: '1px solid #44403c',
                    borderRadius: '8px',
                    color: '#f5f5f4',
                    fontSize: '0.78rem',
                    outline: 'none',
                    fontWeight: '600'
                  }}
                >
                  <option value="proxy">🛡️ Proxy Backend Local (/api/auth/login) [Recomendado]</option>
                  <option value="direct">⚡ Conexión Directa REST (Navegador a iDempiere)</option>
                </select>
              </div>

              {/* Botón para ver/ajustar parámetros ERP de 1 Paso */}
              {loginMode === 'direct' && (
                <div style={{ marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedParams(!showAdvancedParams)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ea580c',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <span>{showAdvancedParams ? '▼ Ocultar' : '▶ Configurar'} Parámetros de Tenant ERP</span>
                    <span style={{ color: '#78716c', fontWeight: '500' }}>
                      ({selectedContext.clientName} &bull; Org #{selectedContext.organizationId})
                    </span>
                  </button>

                  {showAdvancedParams && (
                    <div style={{
                      marginTop: '10px',
                      backgroundColor: '#1c1917',
                      border: '1px solid #332b25',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px'
                    }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: '#a8a29e', marginBottom: '2px' }}>Client ID:</label>
                        <input
                          type="number"
                          value={selectedContext.clientId}
                          onChange={(e) => setSelectedContext({ ...selectedContext, clientId: Number(e.target.value) })}
                          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #44403c', background: '#0c0a09', color: '#fff', fontSize: '0.78rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: '#a8a29e', marginBottom: '2px' }}>Role ID:</label>
                        <input
                          type="number"
                          value={selectedContext.roleId}
                          onChange={(e) => setSelectedContext({ ...selectedContext, roleId: Number(e.target.value) })}
                          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #44403c', background: '#0c0a09', color: '#fff', fontSize: '0.78rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: '#a8a29e', marginBottom: '2px' }}>Org ID (organizationId):</label>
                        <input
                          type="number"
                          value={selectedContext.organizationId}
                          onChange={(e) => setSelectedContext({ ...selectedContext, organizationId: Number(e.target.value) })}
                          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #44403c', background: '#0c0a09', color: '#fff', fontSize: '0.78rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: '#a8a29e', marginBottom: '2px' }}>Warehouse ID:</label>
                        <input
                          type="number"
                          value={selectedContext.warehouseId}
                          onChange={(e) => setSelectedContext({ ...selectedContext, warehouseId: Number(e.target.value) })}
                          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #44403c', background: '#0c0a09', color: '#fff', fontSize: '0.78rem' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* PASO 2 ASISTIDO MULTI-TENANT CON SELECTORES DINÁMICOS */
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                backgroundColor: '#24211d',
                border: '1px solid #3d372e',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase' }}>
                    🏢 Paso 2: Selección Multitenant
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStep(1); clearError(); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a3a3a3',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '700'
                    }}
                  >
                    ← Cambiar Credenciales
                  </button>
                </div>

                {/* Selector de Cliente / Tenant */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px', fontWeight: '700' }}>
                    Cliente / Tenant:
                  </label>
                  {step1Data?.clients?.length > 0 ? (
                    <select
                      value={selectedContext.clientId}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const c = step1Data.clients.find(x => x.id === val);
                        setSelectedContext(prev => ({ ...prev, clientId: val, clientName: c?.name || prev.clientName }));
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff', fontSize: '0.82rem' }}
                    >
                      {step1Data.clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={selectedContext.clientId}
                      onChange={(e) => setSelectedContext({ ...selectedContext, clientId: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff' }}
                    />
                  )}
                </div>

                {/* Selector de Rol */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px', fontWeight: '700' }}>
                    Rol Asignado:
                  </label>
                  {step1Data?.roles?.length > 0 ? (
                    <select
                      value={selectedContext.roleId}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const r = step1Data.roles.find(x => x.id === val);
                        setSelectedContext(prev => ({ ...prev, roleId: val, roleName: r?.name || prev.roleName }));
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff', fontSize: '0.82rem' }}
                    >
                      {step1Data.roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name} (#{r.id})</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={selectedContext.roleId}
                      onChange={(e) => setSelectedContext({ ...selectedContext, roleId: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff' }}
                    />
                  )}
                </div>

                {/* Selector de Organización & Almacén */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px', fontWeight: '700' }}>
                      Organización:
                    </label>
                    {step1Data?.organizations?.length > 0 ? (
                      <select
                        value={selectedContext.organizationId}
                        onChange={(e) => setSelectedContext({ ...selectedContext, organizationId: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff', fontSize: '0.8rem' }}
                      >
                        {step1Data.organizations.map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={selectedContext.organizationId}
                        onChange={(e) => setSelectedContext({ ...selectedContext, organizationId: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff' }}
                      />
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px', fontWeight: '700' }}>
                      Almacén:
                    </label>
                    {step1Data?.warehouses?.length > 0 ? (
                      <select
                        value={selectedContext.warehouseId}
                        onChange={(e) => setSelectedContext({ ...selectedContext, warehouseId: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff', fontSize: '0.8rem' }}
                      >
                        {step1Data.warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={selectedContext.warehouseId}
                        onChange={(e) => setSelectedContext({ ...selectedContext, warehouseId: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff' }}
                      />
                    )}
                  </div>
                </div>

                {/* Idioma */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px', fontWeight: '700' }}>
                    Idioma de Sesión:
                  </label>
                  <select
                    value={selectedContext.language}
                    onChange={(e) => setSelectedContext({ ...selectedContext, language: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4a4338', background: '#181715', color: '#fff', fontSize: '0.8rem' }}
                  >
                    <option value="es_PE">Español (Perú)</option>
                    <option value="en_US">English (US)</option>
                    <option value="es_ES">Español (España)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Botón Principal de Acceso (Naranja / Gradiente) */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#ea580c',
              backgroundImage: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '16px 20px',
              fontSize: '1rem',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px rgba(234, 88, 12, 0.45)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
          >
            {loading ? 'Validando con iDempiere ERP...' : (
              step === 1 ? 'Acceder al Panel de Control ➔' : 'Confirmar Contexto y Entrar ➔'
            )}
          </button>
        </form>

        {/* Pie de Página de Seguridad (Exacto a Imagen 3) */}
        <div style={{
          marginTop: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: '#737373',
          fontSize: '0.75rem'
        }}>
          <span>🔒</span>
          <span>Conexión cifrada de extremo a extremo &bull; Panel Corporativo v2.0</span>
        </div>
      </div>
    </div>
  );
}
