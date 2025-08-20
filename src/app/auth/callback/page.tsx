'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard or home
          router.push('/');
        } else {
          // No session, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        router.push('/login?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Completing sign in...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
