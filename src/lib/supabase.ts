// Demo-safe Supabase client that gracefully handles missing configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Supabase configuration with fallbacks for demo mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Check if we're in demo mode (no real credentials)
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.VITE_SUPABASE_URL === 'your-supabase-url' ||
                   supabaseUrl === 'https://demo.supabase.co';

if (isDemoMode) {
  console.warn('🚨 Running in demo mode - Supabase features disabled');
}

// Create client with demo-safe configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: !isDemoMode,
    persistSession: !isDemoMode,
    detectSessionInUrl: !isDemoMode
  },
  realtime: {
    params: {
      eventsPerSecond: isDemoMode ? 0 : 10
    }
  }
});

// Demo-safe authentication service
export class AuthService {
  
  static async getTenantId(): Promise<string | null> {
    if (isDemoMode) return 'demo-tenant';
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      return (profile as any)?.tenant_id || null;
    } catch (error) {
      console.error('Error getting tenant ID:', error);
      return null;
    }
  }

  static async getUserProfile() {
    if (isDemoMode) {
      return {
        id: 'demo-user',
        user_id: 'demo-user',
        tenant_id: 'demo-tenant',
        email: 'demo@agrinexus.ai',
        full_name: 'Demo User',
        role: 'admin',
        permissions: { 'all': true },
        is_active: true
      };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async hasPermission(permission: string): Promise<boolean> {
    if (isDemoMode) return true; // Allow all permissions in demo mode
    
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      if (profile.permissions && profile.permissions[permission]) {
        return true;
      }

      const { ROLE_PERMISSIONS } = await import('@/types/agricultural');
      const rolePermissions = ROLE_PERMISSIONS[profile.role as keyof typeof ROLE_PERMISSIONS];
      
      return rolePermissions?.includes(permission) || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  static async hasRole(role: string): Promise<boolean> {
    if (isDemoMode) return role === 'admin';
    
    try {
      const profile = await this.getUserProfile();
      return profile?.role === role;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  static async signIn(email: string, password: string) {
    if (isDemoMode) {
      throw new Error('Authentication disabled in demo mode');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(`Sign in error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signOut() {
    if (isDemoMode) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(`Sign out error: ${error.message}`);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
}

// Export configured client
export default supabase;