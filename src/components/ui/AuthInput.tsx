import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, type = 'text', error, ...props }) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword && showPass ? 'text' : type;

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={currentType}
          className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all ${isPassword ? 'pr-12' : ''}`}
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: `1.5px solid ${error ? 'var(--color-destructive-val)' : 'var(--glass-border)'}`,
            color: 'var(--color-fg)',
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            style={{ color: 'var(--color-muted-fg)' }}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs mt-1.5" style={{ color: 'var(--color-destructive-val)' }}>{error}</p>}
    </div>
  );
};
