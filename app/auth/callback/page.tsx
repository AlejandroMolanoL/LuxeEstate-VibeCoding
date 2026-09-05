'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
            setStatus('error');
            setErrorMessage(error.message);
            return;
          }
        } else {
          // Check if session is already present or handled automatically
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error retrieving session:', error);
            setStatus('error');
            setErrorMessage(error.message);
            return;
          }
        }

        router.replace('/');
      } catch (err: any) {
        console.error('Unexpected callback error:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Error completing authentication');
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light p-4 font-display">
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-mosque/30 border-t-mosque rounded-full animate-spin" />
          <p className="text-nordic/70 text-sm font-medium">Completing authentication...</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-soft max-w-sm w-full text-center border border-red-100">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
            <span className="material-icons">error_outline</span>
          </div>
          <h2 className="text-lg font-bold text-nordic mb-2">Authentication Failed</h2>
          <p className="text-sm text-nordic/70 mb-6">{errorMessage || 'Could not complete login.'}</p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Login
          </a>
        </div>
      )}
    </div>
  );
}
