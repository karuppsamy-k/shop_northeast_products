export const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.split(' ');
  let initials = '';
  if (parts.length >= 2) {
    initials = parts[0][0] + parts[1][0];
  } else if (parts.length === 1) {
    initials = parts[0][0];
  }
  return initials.toUpperCase();
};

export const getAvatarColor = (name: string): string => {
  if (!name) return 'var(--color-primary-val)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
};
