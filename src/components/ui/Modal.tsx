import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg z-10"
          >
            <Card className="glass-card border-white/20 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                {title && <h2 className="text-xl font-bold">{title}</h2>}
                <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div>{children}</div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
