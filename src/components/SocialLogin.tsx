import React from 'react';
import { supabase } from '../lib/supabase';

interface SocialButtonProps {
  provider: 'google' | 'steam' | 'epicgames' | 'discord' | 'twitch';
  icon: React.ReactNode;
  label: string;
  color: string;
}

const SocialLogin = () => {
  const getRedirectUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5173/GameFind/'
    }
    return 'https://angelo17-py.github.io/GameFind/'
  }

  const handleSocialLogin = async (provider: 'google' | 'steam' | 'epicgames' | 'discord' | 'twitch') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectUrl(),
          flowType: 'pkce',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging in with social provider:', error.message);
      alert('Error al iniciar sesión con ' + provider);
    }
  };
  const socialProviders: SocialButtonProps[] = [
    {
      provider: 'google',
      label: 'Google',
      color: 'hover:bg-white/10 border-white/10',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    }
  ];

  return (
    <div className="space-y-4 w-full">
      <div className="relative flex items-center justify-center">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">O continúa con</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>
      
      <div className="flex flex-col gap-3">
        {socialProviders.map((social) => (
          <button
            key={social.provider}
            onClick={() => handleSocialLogin(social.provider)}
            className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${social.color} w-full`}
          >
            <span className="text-gray-400 group-hover:text-white transition-colors">
              {social.icon}
            </span>
            <span className="text-sm font-bold text-gray-400 group-hover:text-white">
              {social.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialLogin;
