import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
        bg-[var(--color-surface)] border border-[var(--color-border)]
        text-[var(--color-foreground)] hover:border-[var(--color-primary)]
        transition-colors duration-300"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.div>
    </motion.button>
  );
};
