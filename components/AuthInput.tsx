
import React, { useState } from 'react';

interface AuthInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  name: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, type = 'text', value, onChange, name }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative w-full mb-2 group">
      <input
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full bg-[#fafafa] border border-[#dbdbdb] rounded-[3px] 
          px-2 pb-1 pt-4 text-xs focus:outline-none focus:border-[#a8a8a8] 
          peer placeholder-transparent
        `}
        placeholder={label}
      />
      <label
        className={`
          absolute left-2 text-[#8e8e8e] transition-all pointer-events-none
          ${value ? 'top-1 text-[10px]' : 'top-[10px] text-xs'}
          peer-focus:top-1 peer-focus:text-[10px]
        `}
      >
        {label}
      </label>
      {isPassword && value && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#262626] hover:opacity-70 focus:outline-none"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
  );
};

export default AuthInput;
