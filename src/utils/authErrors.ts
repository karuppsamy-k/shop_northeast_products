/** Maps Firebase Auth error codes to user-friendly messages. */
const AUTH_ERROR_MAP: Record<string, string> = {
  'auth/email-already-in-use':      'An account with this email already exists.',
  'auth/user-not-found':            'No account found with this email.',
  'auth/wrong-password':            'The password you entered is incorrect.',
  'auth/invalid-email':             'Please enter a valid email address.',
  'auth/invalid-credential':        'The email or password is incorrect.',
  'auth/network-request-failed':    'No internet connection. Please try again.',
  'auth/too-many-requests':         'Too many attempts. Please try again later.',
  'auth/weak-password':             'Password must be at least 6 characters.',
  'auth/requires-recent-login':     'Please sign in again to continue.',
  'auth/user-disabled':             'This account has been disabled.',
  'auth/operation-not-allowed':     'This sign-in method is not enabled.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    if (AUTH_ERROR_MAP[code]) return AUTH_ERROR_MAP[code];
  }
  if (error instanceof Error && error.message) {
    // Prevent raw Firebase codes leaking to UI
    if (error.message.startsWith('Firebase:')) return 'Something went wrong. Please try again.';
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
