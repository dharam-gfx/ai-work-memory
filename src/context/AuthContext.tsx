import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface DeviceSession {
  id: string;
  deviceName: string;
  lastActive: string;
  isCurrent: boolean;
  ipAddress?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isSupabaseActive: boolean;
  activeSessions: DeviceSession[];
  signIn: ( email: string, pass: string ) => Promise<{ success: boolean; error?: string }>;
  signUp: ( email: string, pass: string, fullName?: string ) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithGit: () => Promise<{ success: boolean; error?: string }>;
  signInWithMagicLink: ( email: string ) => Promise<{ success: boolean; error?: string }>;
  signInWithPhoneOtp: ( phoneNumber: string, fullName: string, otpCode?: string, isVerifying?: boolean ) => Promise<{ success: boolean; error?: string; requiresOtp?: boolean }>;
  signOut: () => Promise<void>;
  revokeSession: ( sessionId: string ) => void;
  openAuthModal: boolean;
  setOpenAuthModal: ( open: boolean ) => void;
}

const DEFAULT_DEMO_USER: AuthUser = {
  id: 'usr-demo-default',
  email: 'alex.rivera@workmemory.ai',
  fullName: 'Alex Rivera',
  createdAt: new Date().toISOString(),
  provider: 'local',
  deviceSessionsCount: 2,
};

const AuthContext = createContext<AuthContextType | undefined>( undefined );

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ( { children } ) => {
  const [user, setUser] = useState<AuthUser | null>( null );
  const [loading, setLoading] = useState<boolean>( true );
  const [openAuthModal, setOpenAuthModal] = useState<boolean>( false );
  const [activeSessions, setActiveSessions] = useState<DeviceSession[]>( [] );

  useEffect( () => {
    async function initAuth() {
      if ( isSupabaseConfigured && supabase ) {
        try {
          const { data } = await supabase.auth.getSession();
          if ( data.session?.user ) {
            setUser( {
              id: data.session.user.id,
              email: data.session.user.email || '',
              fullName: data.session.user.user_metadata?.full_name || data.session.user.email?.split( '@' )[0],
              avatarUrl: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture || '',
              createdAt: data.session.user.created_at,
              provider: 'supabase',
              deviceSessionsCount: 1,
            } );
            setActiveSessions( [{
              id: data.session.access_token.slice( -8 ),
              deviceName: `${navigator.userAgent.includes( 'Chrome' ) ? 'Chrome' : navigator.userAgent.includes( 'Firefox' ) ? 'Firefox' : 'Browser'} on ${navigator.userAgent.includes( 'Mac' ) ? 'macOS' : navigator.userAgent.includes( 'Windows' ) ? 'Windows' : 'Linux'} (Current Device)`,
              lastActive: 'Just now',
              isCurrent: true,
            }] );
          } else {
            // Check local persistence
            const localSaved = localStorage.getItem( 'ai_work_memory_user' );
            if ( localSaved ) {
              setUser( JSON.parse( localSaved ) );
            } else {
              setUser( null );
            }
          }
        } catch ( e ) {
          console.warn( 'Supabase auth check failed:', e );
          setUser( null );
        }
      } else {
        // Local mode initialization
        const localSaved = localStorage.getItem( 'ai_work_memory_user' );
        if ( localSaved ) {
          try {
            setUser( JSON.parse( localSaved ) );
          } catch {
            setUser( null );
          }
        } else {
          setUser( null );
        }
      }
      setLoading( false );
    }

    initAuth();

    // Listen to Supabase Auth state changes if active
    if ( isSupabaseConfigured && supabase ) {
      const { data: authListener } = supabase.auth.onAuthStateChange( ( event: AuthChangeEvent, session: Session | null ) => {
        if ( session?.user ) {
          const newUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split( '@' )[0],
            avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
            createdAt: session.user.created_at,
            provider: 'supabase',
            deviceSessionsCount: 1,
          };
          setUser( newUser );
          localStorage.setItem( 'ai_work_memory_user', JSON.stringify( newUser ) );
          setActiveSessions( [{
            id: session.access_token.slice( -8 ),
            deviceName: `${navigator.userAgent.includes( 'Chrome' ) ? 'Chrome' : navigator.userAgent.includes( 'Firefox' ) ? 'Firefox' : 'Browser'} on ${navigator.userAgent.includes( 'Mac' ) ? 'macOS' : navigator.userAgent.includes( 'Windows' ) ? 'Windows' : 'Linux'} (Current Device)`,
            lastActive: 'Just now',
            isCurrent: true,
          }] );
        } else if ( event === 'SIGNED_OUT' ) {
          setUser( null );
          localStorage.removeItem( 'ai_work_memory_user' );
          setActiveSessions( [] );
        }
      } );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [] );

  const signIn = async ( email: string, pass: string ): Promise<{ success: boolean; error?: string }> => {
    if ( isSupabaseConfigured && supabase ) {
      const { data, error } = await supabase.auth.signInWithPassword( { email, password: pass } );
      if ( error ) {
        return { success: false, error: error.message };
      }
      if ( data.user ) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split( '@' )[0],
          createdAt: data.user.created_at,
          provider: 'supabase',
          deviceSessionsCount: 1,
        };
        setUser( authUser );
        localStorage.setItem( 'ai_work_memory_user', JSON.stringify( authUser ) );
        return { success: true };
      }
    }

    // Local authentication fallback / simulator
    if ( !email || !pass ) {
      return { success: false, error: 'Email and password are required.' };
    }

    const localUser: AuthUser = {
      id: `usr-${email.toLowerCase().replace( /[^a-z0-9]/g, '_' )}`,
      email: email.trim(),
      fullName: email.split( '@' )[0].replace( '.', ' ' ),
      createdAt: new Date().toISOString(),
      provider: 'local',
      deviceSessionsCount: activeSessions.length,
    };

    setUser( localUser );
    localStorage.setItem( 'ai_work_memory_user', JSON.stringify( localUser ) );

    // Register active device session
    const newSession: DeviceSession = {
      id: `sess-${Date.now()}`,
      deviceName: `${navigator.userAgent.includes( 'Mac' ) ? 'macOS' : 'Windows'} Browser (Current)`,
      lastActive: 'Just now',
      isCurrent: true,
      ipAddress: '192.168.1.100',
    };
    setActiveSessions( prev => [newSession, ...prev.map( s => ( { ...s, isCurrent: false } ) )] );

    return { success: true };
  };

  const signUp = async ( email: string, pass: string, fullName?: string ): Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }> => {
    if ( isSupabaseConfigured && supabase ) {
      const { data, error } = await supabase.auth.signUp( {
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName || email.split( '@' )[0],
          },
        },
      } );
      if ( error ) {
        // Walk prototype chain to find code/message (AuthApiError stores them non-enumerably)
        let code = '';
        let msg = '';
        try {
          const allProps: Record<string, unknown> = {};
          let obj: object | null = error as object;
          while ( obj ) {
            Object.getOwnPropertyNames( obj ).forEach( ( k ) => {
              if ( !( k in allProps ) ) allProps[k] = ( error as any )[k];
            } );
            obj = Object.getPrototypeOf( obj );
          }
          code = String( allProps.code ?? allProps.error_code ?? '' );
          msg = String( allProps.message ?? allProps.msg ?? allProps.error_description ?? '' );
          console.error( '[signUp error]', allProps );
        } catch {
          console.error( '[signUp error raw]', error );
        }

        const isEmailIssue =
          !msg ||
          msg === 'undefined' ||
          code.includes( 'unexpected' ) ||
          code.includes( 'email' ) ||
          code.includes( 'rate' ) ||
          msg.toLowerCase().includes( 'email' ) ||
          msg.toLowerCase().includes( 'sending' ) ||
          msg.toLowerCase().includes( 'rate' );

        if ( isEmailIssue ) {
          return {
            success: false,
            error: 'Email delivery failed — Supabase free plan cannot send emails. Please use Google or GitHub sign-in instead.',
          };
        }

        // Other errors (e.g. email already registered, weak password)
        return { success: false, error: msg || 'Sign up failed. Please try again.' };
      }
      if ( data.user ) {
        // If session is null, Supabase requires email confirmation before login
        if ( !data.session ) {
          return { success: true, requiresEmailVerification: true };
        }
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: fullName || email.split( '@' )[0],
          createdAt: data.user.created_at,
          provider: 'supabase',
          deviceSessionsCount: 1,
        };
        setUser( authUser );
        localStorage.setItem( 'ai_work_memory_user', JSON.stringify( authUser ) );
        return { success: true };
      }
    }

    // Local signup simulator
    if ( !email || pass.length < 6 ) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const localUser: AuthUser = {
      id: `usr-${email.toLowerCase().replace( /[^a-z0-9]/g, '_' )}`,
      email: email.trim(),
      fullName: fullName || email.split( '@' )[0],
      createdAt: new Date().toISOString(),
      provider: 'local',
      deviceSessionsCount: 1,
    };

    setUser( localUser );
    localStorage.setItem( 'ai_work_memory_user', JSON.stringify( localUser ) );
    return { success: true };
  };

  const signInWithMagicLink = async ( email: string ): Promise<{ success: boolean; error?: string }> => {
    if ( !email || !email.includes( '@' ) ) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if ( isSupabaseConfigured && supabase ) {
      const { error } = await supabase.auth.signInWithOtp( {
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard/chat` },
      } );
      if ( error ) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: false, error: 'Supabase is not configured.' };
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if ( isSupabaseConfigured && supabase ) {
      const { error } = await supabase.auth.signInWithOAuth( {
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard/chat` }
      } );
      if ( error ) return { success: false, error: error.message };
      return { success: true };
    }

    // Simulated Google OAuth login
    const googleUser: AuthUser = {
      id: `usr-google-${Date.now()}`,
      email: 'alex.rivera.gmail@workmemory.ai',
      fullName: 'Alex Rivera (Google)',
      createdAt: new Date().toISOString(),
      provider: 'local',
      deviceSessionsCount: 1,
    };
    setUser( googleUser );
    localStorage.setItem( 'ai_work_memory_user', JSON.stringify( googleUser ) );
    return { success: true };
  };

  const signInWithGit = async (): Promise<{ success: boolean; error?: string }> => {
    if ( isSupabaseConfigured && supabase ) {
      const { error } = await supabase.auth.signInWithOAuth( {
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/dashboard/chat` }
      } );
      if ( error ) return { success: false, error: error.message };
      return { success: true };
    }

    // Simulated GitHub / Git login
    const gitUser: AuthUser = {
      id: `usr-git-${Date.now()}`,
      email: 'alex.rivera@github.user',
      fullName: 'Alex Rivera (GitHub)',
      createdAt: new Date().toISOString(),
      provider: 'local',
      deviceSessionsCount: 1,
    };
    setUser( gitUser );
    localStorage.setItem( 'ai_work_memory_user', JSON.stringify( gitUser ) );
    return { success: true };
  };

  const signInWithPhoneOtp = async (
    phoneNumber: string,
    fullName: string,
    otpCode?: string,
    isVerifying?: boolean
  ): Promise<{ success: boolean; error?: string; requiresOtp?: boolean }> => {
    if ( !phoneNumber || phoneNumber.length < 8 ) {
      return { success: false, error: 'Please enter a valid phone number.' };
    }

    if ( isSupabaseConfigured && supabase ) {
      if ( !isVerifying ) {
        // Step 1: Send real OTP via Supabase
        const { error } = await supabase.auth.signInWithOtp( { phone: phoneNumber } );
        if ( error ) return { success: false, error: error.message };
        return { success: true, requiresOtp: true };
      } else {
        // Step 2: Verify real OTP via Supabase
        if ( !otpCode || otpCode.length < 4 ) {
          return { success: false, error: 'Please enter the 6-digit verification code sent via SMS.' };
        }
        const { data, error } = await supabase.auth.verifyOtp( {
          phone: phoneNumber,
          token: otpCode,
          type: 'sms',
        } );
        if ( error ) return { success: false, error: error.message };
        if ( data.user ) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.phone || phoneNumber,
            fullName: fullName || 'Mobile Phone User',
            createdAt: data.user.created_at,
            provider: 'supabase',
            deviceSessionsCount: 1,
          };
          setUser( authUser );
          localStorage.setItem( 'ai_work_memory_user', JSON.stringify( authUser ) );
          return { success: true };
        }
      }
    }

    // Local simulation fallback (no Supabase configured)
    if ( !isVerifying ) {
      return { success: true, requiresOtp: true };
    }

    if ( !otpCode || otpCode.length < 4 ) {
      return { success: false, error: 'Please enter the 6-digit verification code sent via SMS.' };
    }

    const phoneUser: AuthUser = {
      id: `usr-phone-${phoneNumber.replace( /[^0-9]/g, '' )}`,
      email: `${phoneNumber.replace( /[^0-9]/g, '' )}@sms.workmemory.ai`,
      fullName: fullName || 'Mobile Phone User',
      createdAt: new Date().toISOString(),
      provider: 'local',
      deviceSessionsCount: 1,
    };

    setUser( phoneUser );
    localStorage.setItem( 'ai_work_memory_user', JSON.stringify( phoneUser ) );
    return { success: true };
  };

  const signOut = async () => {
    if ( isSupabaseConfigured && supabase ) {
      await supabase.auth.signOut();
    }
    setUser( null );
    localStorage.removeItem( 'ai_work_memory_user' );
  };

  const revokeSession = ( sessionId: string ) => {
    setActiveSessions( prev => prev.filter( s => s.id !== sessionId ) );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseActive: isSupabaseConfigured,
        activeSessions,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGit,
        signInWithMagicLink,
        signInWithPhoneOtp,
        signOut,
        revokeSession,
        openAuthModal,
        setOpenAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext( AuthContext );
  if ( !context ) {
    throw new Error( 'useAuth must be used within an AuthProvider' );
  }
  return context;
};
