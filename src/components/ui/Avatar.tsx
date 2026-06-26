import React from 'react';
import { getInitials, getAvatarColor } from '../../utils/avatar';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 48, className = '' }) => {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div 
      className={`flex items-center justify-center rounded-full text-white font-bold shadow-md ${className}`}
      style={{
        width: size,
        height: size,
        background: bgColor,
        fontSize: size * 0.4
      }}
    >
      {initials}
    </div>
  );
};
