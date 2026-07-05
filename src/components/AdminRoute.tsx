import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/70">Checking authorization...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.email !== 'karuppasamy.k.dev@gmail.com')) {
    return <Navigate to="/" replace />;
  }

  return children;
};
