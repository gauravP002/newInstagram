
import React, { useState } from 'react';
import LoginCard from './components/LoginCard';
import Footer from './components/Footer';
import { AuthMode } from './types';

const App: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-[#fafafa]">
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-[350px] pt-8 md:pt-12 px-4">
        <LoginCard mode={authMode} onToggleMode={() => setAuthMode(prev => prev === AuthMode.LOGIN ? AuthMode.SIGNUP : AuthMode.LOGIN)} />
        
        <div className="mt-4 flex flex-col items-center space-y-4">
          <p className="text-sm text-[#262626]">Get the app.</p>
          <div className="flex space-x-2">
            <a href="#" className="h-10">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                alt="Download on the App Store" 
                className="h-full"
              />
            </a>
            <a href="#" className="h-10">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Get it on Google Play" 
                className="h-full"
              />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
