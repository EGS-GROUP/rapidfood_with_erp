import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';

export default function LoginView() {
  const { loginDirect, loginStep1, loginStep2, loading, authError, clearError, proxyMode, setProxyMode } = useAuth();
  
  // Obtener la configuración del perfil definida en el Panel de Control
  const profileConfig = AuthService.getProfileConfig() || {};
  const defaultParams = profileConfig.defaultParameters || {};

  // Modo de Login: Por defecto siempre 'direct' (1 paso garantizado)
  const [loginMode, setLoginMode] = useState('direct');

  // Estados de formulario
  const [userName, setUserName] = useState('admin @ gardenworld.com');
  const [password, setPassword] = useState('GardenAdmin');
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (loginMode === 'direct') {
      // 1 SOLO PASO: Autenticación directa garantizada y validada
      try {
        await loginDirect(
          { userName, password },
          {
            clientId: Number(selectedContext.clientId || 11),
            roleId: Number(selectedContext.roleId || 102),
            organizationId: Number(selectedContext.organizationId || 11),
            warehouseId: Number(selectedContext.warehouseId || 103),
            language: selectedContext.language || 'es_PE'
          }
        );
      } catch (err) {
        // El error se muestra en authError
      }
    } else {
      // 2 PASOS ASISTIDO MULTI-TENANT
      if (step === 1) {
        try {
          const res = await loginStep1({ userName, password });
          setStep1Data(res);
          setStep(2);
        } catch (err) {
          // authError
        }
      } else {
        // Paso 2: Confirmar contexto elegido
        try {
          await loginStep2(
            { userName, password },
            step1Data?.tempToken,
            selectedContext
          );
        } catch (err) {
          // authError
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
        maxWidth: '460px',
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
          margin: '0 0 28px 0',
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
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            <strong>Error de Acceso:</strong> {authError}
          </div>
        )}

        {/* Selector de Modo: 1 Paso Directo vs 2 Pasos Asistido */}
        <div style={{
          display: 'flex',
          backgroundColor: '#201c18',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '22px',
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
              <div style={{ marginBottom: '20px' }}>
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
                      fontWeight: '600'
                    }}
                  />
                </div>
              </div>

              {/* Campo 2: Contraseña de Acceso */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#a3a3a3',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px'
                }}>
                  CONTRASEÑA DE ACCESO
                </label>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#edf2f7',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1'
                }}>
                  <span style={{ fontSize: '1rem', marginRight: '10px', color: '#64748b' }}>🔒</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      outline: 'none',
                      color: '#0f172a',
                      fontSize: '0.92rem',
                      letterSpacing: '0.1em'
                    }}
                  />
                  <span style={{ fontSize: '1rem', color: '#94a3b8' }}>🔒</span>
                </div>
              </div>

              {/* Campo 3: Selector de Proxy CORS (Bypass de errores 403 / CORS) */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: '#a3a3a3',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    MODO DE PROXY / BYPASS CORS
                  </label>
                  <span style={{
                    fontSize: '0.68rem',
                    color: proxyMode === 'local' ? '#10b981' : (proxyMode === 'none' ? '#38bdf8' : '#f59e0b'),
                    fontWeight: '700'
                  }}>
                    {proxyMode === 'local' && '● Recomendado'}
                    {proxyMode === 'none' && '● Directo'}
                    {proxyMode === 'allorigins' && '● Libre'}
                    {proxyMode === 'corsproxy' && '● Requiere Key'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#edf2f7',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  border: '1px solid #cbd5e1'
                }}>
                  <span style={{ fontSize: '1.1rem', marginRight: '10px' }}>🌐</span>
                  <select
                    value={proxyMode}
                    onChange={(e) => setProxyMode(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      outline: 'none',
                      color: '#0f172a',
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="local">🛡️ Opción 2: Proxy Local Backend (/api/idempiere-proxy) [Recomendado]</option>
                    <option value="none">⚡ Opción 1: Sin Proxy (Conexión Directa)</option>
                    <option value="allorigins">🌍 Opción 3: Proxy Público AllOrigins (Gratuito)</option>
                    <option value="corsproxy">🔑 Opción 4: Proxy corsproxy.io (Requiere API Key)</option>
                  </select>
                </div>
                <p style={{
                  fontSize: '0.7rem',
                  color: '#78716c',
                  margin: '6px 0 0 2px',
                  lineHeight: '1.3'
                }}>
                  {proxyMode === 'local' && '✓ Enruta por el backend Node.js local. Bypasea CORS y evita el error 403 de proxies externos.'}
                  {proxyMode === 'none' && '• Conecta directamente a iDempiere (puede fallar si el navegador bloquea CORS).'}
                  {proxyMode === 'allorigins' && '• Enruta a través de AllOrigins (proxy público abierto sin clave).'}
                  {proxyMode === 'corsproxy' && '⚠️ Requiere API Key; corsproxy.io bloqueó el acceso anónimo gratuito con 403.'}
                </p>
              </div>

              {/* Botón para ver/ajustar parámetros ERP de 1 Paso */}
              {loginMode === 'direct' && (
                <div style={{ marginBottom: '22px' }}>
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
                        <label style={{ display: 'block', fontSize: '0.68rem', color: '#a8a29e', marginBottom: '2px' }}>Org ID:</label>
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
            /* PASO 2 ASISTIDO MULTI-TENANT (Solo si se activó en el Perfil) */
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                backgroundColor: '#24211d',
                border: '1px solid #3d372e',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase', marginBottom: '8px' }}>
                  🏢 Selección de Entidad & Rol (iDempiere Multi-Tenant)
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px' }}>
                    Tenant (Client ID):
                  </label>
                  <input
                    type="number"
                    value={selectedContext.clientId}
                    onChange={(e) => setSelectedContext({ ...selectedContext, clientId: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4a4338', background: '#181715', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px' }}>
                    Rol Asignado (Role ID):
                  </label>
                  <input
                    type="number"
                    value={selectedContext.roleId}
                    onChange={(e) => setSelectedContext({ ...selectedContext, roleId: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4a4338', background: '#181715', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px' }}>
                      Org ID:
                    </label>
                    <input
                      type="number"
                      value={selectedContext.organizationId}
                      onChange={(e) => setSelectedContext({ ...selectedContext, organizationId: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4a4338', background: '#181715', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '4px' }}>
                      Warehouse ID:
                    </label>
                    <input
                      type="number"
                      value={selectedContext.warehouseId}
                      onChange={(e) => setSelectedContext({ ...selectedContext, warehouseId: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4a4338', background: '#181715', color: '#fff' }}
                    />
                  </div>
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
          marginTop: '32px',
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
