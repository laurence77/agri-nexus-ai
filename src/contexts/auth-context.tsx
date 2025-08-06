import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { logger } from '@/lib/logger';

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  lastLogin?: Date;
  mfaEnabled: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiry: Date | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, mfaCode?: string) => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Security configurations
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'users.read', 'users.write', 'users.delete',
    'system.read', 'system.write', 'system.config',
    'audit.read', 'reports.read', 'reports.write',
    'farms.read', 'farms.write', 'farms.delete'
  ],
  manager: [
    'users.read', 'users.write',
    'farms.read', 'farms.write',
    'reports.read', 'reports.write',
    'audit.read'
  ],
  operator: [
    'farms.read', 'farms.write',
    'reports.read'
  ],
  viewer: [
    'farms.read',
    'reports.read'
  ]
};

// Simulated secure storage with encryption
class SecureStorage {
  private static encrypt(data: string): string {
    // In production, use proper encryption like AES
    return btoa(data);
  }

  private static decrypt(data: string): string {
    try {
      return atob(data);
    } catch {
      return '';
    }
  }

  static setItem(key: string, value: string): void {
    sessionStorage.setItem(key, this.encrypt(value));
  }

  static getItem(key: string): string | null {
    const item = sessionStorage.getItem(key);
    return item ? this.decrypt(item) : null;
  }

  static removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionExpiry: null,
  });

  // Session management
  useEffect(() => {
    checkExistingSession();
    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Token refresh
  useEffect(() => {
    if (authState.isAuthenticated) {
      const interval = setInterval(refreshSession, TOKEN_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated]);

  const checkExistingSession = async () => {
    try {
      const token = SecureStorage.getItem('auth_token');
      const userStr = SecureStorage.getItem('auth_user');
      const expiry = SecureStorage.getItem('session_expiry');

      if (token && userStr && expiry) {
        const sessionExpiry = new Date(expiry);
        if (sessionExpiry > new Date()) {
          const user = JSON.parse(userStr);
          setAuthState({
            user: {
              ...user,
              permissions: ROLE_PERMISSIONS[user.role] || []
            },
            isAuthenticated: true,
            isLoading: false,
            sessionExpiry,
          });
          return;
        }
      }
    } catch (error) {
      logger.error('Session validation failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'AuthContext');
    }

    logout();
  };

  const checkSessionExpiry = () => {
    if (authState.sessionExpiry && authState.sessionExpiry <= new Date()) {
      logout();
    }
  };

  const login = async (email: string, password: string, mfaCode?: string): Promise<boolean> => {
    try {
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
      }

      // Simulated API call with security measures
      const response = await simulateSecureLogin(email, password, mfaCode);
      
      if (response.success && response.user) {
        const sessionExpiry = new Date(Date.now() + SESSION_TIMEOUT);
        const userWithPermissions = {
          ...response.user,
          permissions: ROLE_PERMISSIONS[response.user.role] || []
        };

        // Secure token storage
        SecureStorage.setItem('auth_token', response.token);
        SecureStorage.setItem('auth_user', JSON.stringify(userWithPermissions));
        SecureStorage.setItem('session_expiry', sessionExpiry.toISOString());

        setAuthState({
          user: userWithPermissions,
          isAuthenticated: true,
          isLoading: false,
          sessionExpiry,
        });

        // Audit log
        auditLog('user_login', { userId: response.user.id, email });

        return true;
      }

      return false;
    } catch (error) {
      logger.error('Login attempt failed', { email, error: error instanceof Error ? error.message : 'Unknown error' }, 'AuthContext');
      auditLog('login_failed', { email, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  };

  const logout = () => {
    if (authState.user) {
      auditLog('user_logout', { userId: authState.user.id });
    }

    SecureStorage.removeItem('auth_token');
    SecureStorage.removeItem('auth_user');
    SecureStorage.removeItem('session_expiry');

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpiry: null,
    });
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const token = SecureStorage.getItem('auth_token');
      if (!token || !authState.user) return false;

      // Simulated token refresh
      const response = await simulateTokenRefresh(token);
      
      if (response.success) {
        const newExpiry = new Date(Date.now() + SESSION_TIMEOUT);
        SecureStorage.setItem('auth_token', response.token);
        SecureStorage.setItem('session_expiry', newExpiry.toISOString());

        setAuthState(prev => ({
          ...prev,
          sessionExpiry: newExpiry,
        }));

        return true;
      }

      logout();
      return false;
    } catch (error) {
      logger.error('Session refresh failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'AuthContext');
      logout();
      return false;
    }
  };

  const checkPermission = (permission: string): boolean => {
    return authState.user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    checkPermission,
    hasRole,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simulated secure backend calls
async function simulateSecureLogin(email: string, password: string, mfaCode?: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // SECURITY: Only allow demo authentication in development
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') {
    throw new Error('Demo authentication disabled in production');
  }

  // Use environment variables for demo credentials (never hardcode)
  const validCredentials = [
    {
      email: process.env.REACT_APP_DEMO_ADMIN_EMAIL || 'admin@agrinexus.ai',
      password: process.env.REACT_APP_DEMO_ADMIN_PASSWORD,
      user: {
        id: '1',
        email: process.env.REACT_APP_DEMO_ADMIN_EMAIL || 'admin@agrinexus.ai',
        name: 'System Administrator',
        role: 'admin' as UserRole,
        permissions: [],
        lastLogin: new Date(),
        mfaEnabled: true,
      }
    },
    {
      email: process.env.REACT_APP_DEMO_MANAGER_EMAIL || 'manager@agrinexus.ai',
      password: process.env.REACT_APP_DEMO_MANAGER_PASSWORD,
      user: {
        id: '2',
        email: process.env.REACT_APP_DEMO_MANAGER_EMAIL || 'manager@agrinexus.ai',
        name: 'Farm Manager',
        role: 'manager' as UserRole,
        permissions: [],
        lastLogin: new Date(),
        mfaEnabled: false,
      }
    }
  ];

  const userRecord = validCredentials.find(
    cred => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
  );
  
  if (!userRecord) {
    throw new Error('Invalid credentials');
  }

  // MFA validation
  if (userRecord.user.mfaEnabled && !mfaCode) {
    throw new Error('MFA code required');
  }

  if (userRecord.user.mfaEnabled && mfaCode !== process.env.REACT_APP_DEMO_MFA_CODE) {
    throw new Error('Invalid MFA code');
  }

  return {
    success: true,
    user: userRecord.user,
    token: generateSecureToken(),
  };
}

async function simulateTokenRefresh(token: string) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    token: generateSecureToken(),
  };
}

function generateSecureToken(): string {
  // In production, use proper JWT or similar
  return btoa(JSON.stringify({
    timestamp: Date.now(),
    random: Math.random().toString(36),
  }));
}

function auditLog(action: string, details: Record<string, unknown>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userAgent: navigator.userAgent,
    ip: 'client-side', // In production, capture from server
  };
  
  logger.audit(logEntry.action, { details: logEntry.details, timestamp: logEntry.timestamp }, 'AuditLogger');
  
  // In production, send to secure audit service
  // await fetch('/api/audit', { method: 'POST', body: JSON.stringify(logEntry) });
}