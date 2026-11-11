import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';

export default function LoginView() {
  const { loginDirect, loginStep1, loginStep2, loading, authError, clearError } = useAuth();
  
  // Obtener la configuración del perfil definida en el Panel de Control (Imagen 4)
  const profileConfig = AuthService.getProfileConfig();

  // Estados de formulario
  const [userName, setUserName] = useState('admin @ gardenworld.com');
  const [password, setPassword] = useState('GardenAdmin');
  
  // Estado para modo asistido de 2 pasos (si está habilitado en el perfil)
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [selectedContext, setSelectedContext] = useState({
    clientId: profileConfig.defaultParameters.clientId || 11,
    clientName: 'GardenWorld, Inc.',
    roleId: profileConfig.defaultParameters.roleId || 102,
    roleName: 'GardenAdmin',
    organizationId: profileConfig.defaultParameters.organizationId || 11,
    organizationName: 'HQ - Headquarters',
    warehouseId: profileConfig.defaultParameters.warehouseId || 103,
    warehouseName: 'HQ Warehouse',
    language: profileConfig.defaultParameters.language || 'es_PE'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const isAssisted = Boolean(profileConfig.assistedMultiTenant);

    if (!isAssisted) {
      // 1 SOLO PASO: Autenticación directa utilizando los parámetros configurados en el perfil
      try {
        await loginDirect(
          { userName, password },
          profileConfig.defaultParameters
        );
      } catch (err) {
        // Error se gestiona a través de authError
      }
    } else {
      // 2 PASOS ASISTIDO MULTI-TENANT: Paso 1 validar credenciales en iDempiere
      if (step === 1) {
        try {
          const res = await loginStep1({ userName, password });
          setStep1Data(res);
          setStep(2);
        } catch (err) {
          // Error en authError
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
          // Error en authError
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
