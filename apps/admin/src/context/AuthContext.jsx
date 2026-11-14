import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService, DEFAULT_DEMO_CONFIG, PROXY_MODES } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => AuthService.getSession());
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Configuracion global de conectividad iDempiere
  const storedConfig = AuthService.getStoredConfig();
  const [baseUrl, setBaseUrlState] = useState(storedConfig?.baseUrl || DEFAULT_DEMO_CONFIG.baseUrl);
  
  // Migración automática: Si estaba en corsproxy (obsoleto/403) o sin configurar, usar LOCAL por defecto
  const initialProxyMode = (storedConfig?.proxyConfig?.mode === PROXY_MODES.CORSPROXY || !storedConfig?.proxyConfig?.mode)
    ? PROXY_MODES.LOCAL
    : storedConfig.proxyConfig.mode;

  const [proxyMode, setProxyModeState] = useState(initialProxyMode);
  const [customProxyUrl, setCustomProxyUrlState] = useState(storedConfig?.proxyConfig?.customUrl || '');

  const persistConfig = (newBaseUrl, newProxyMode, newCustomProxy) => {
    AuthService.saveStoredConfig({
      baseUrl: newBaseUrl,
      proxyConfig: {
        mode: newProxyMode,
        customUrl: newCustomProxy
      }
    });
  };

  const setBaseUrl = (url) => {
    setBaseUrlState(url);
    persistConfig(url, proxyMode, customProxyUrl);
  };

  const setProxyMode = (mode) => {
    setProxyModeState(mode);
    persistConfig(baseUrl, mode, customProxyUrl);
  };

  const setCustomProxyUrl = (url) => {
    setCustomProxyUrlState(url);
    persistConfig(baseUrl, proxyMode, url);
  };

  // Re-validar persistencia al inicio
  useEffect(() => {
    const current = AuthService.getSession();
    if (current && (!session || session.token !== current.token)) {
      setSession(current);
    }
  }, []);

  const getActiveOptions = useCallback(() => {
    return {
      baseUrl,
      proxyConfig: {
        mode: proxyMode,
        customUrl: customProxyUrl
      }
    };
  }, [baseUrl, proxyMode, customProxyUrl]);

  // Modalidad 1: Login Directo / 1 Paso
  const loginDirect = async (credentials, parameters) => {
    setLoading(true);
    setAuthError(null);
    try {
      const newSession = await AuthService.loginDirect(credentials, parameters, getActiveOptions());
      setSession(newSession);
      return newSession;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Modalidad 2 - Paso 1: Descubrimiento
  const loginStep1 = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      const step1Result = await AuthService.loginStep1(credentials, getActiveOptions());
      return step1Result;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Modalidad 2 - Paso 2: Confirmar Contexto
  const loginStep2 = async (credentials, tempToken, selectedContext) => {
    setLoading(true);
    setAuthError(null);
    try {
      const newSession = await AuthService.loginStep2(credentials, tempToken, selectedContext, getActiveOptions());
      setSession(newSession);
      return newSession;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setSession(null);
    setAuthError(null);
  };

  const isAuthenticated = Boolean(session && session.token);

  const value = {
    session,
    isAuthenticated,
    loading,
    authError,
    baseUrl,
    setBaseUrl,
    proxyMode,
    setProxyMode,
    customProxyUrl,
    setCustomProxyUrl,
    loginDirect,
    loginStep1,
    loginStep2,
    logout,
    clearError: () => setAuthError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}

