export const authConfig = {
  pages: {
    signIn: '/login',
  },
};

// Berikan tipe parameter string | null pada safeAuthNext
export function safeAuthNext(nextParam: string | null): string {
  if (nextParam && nextParam.startsWith('/')) {
    return nextParam;
  }
  return '/dashboard';
}

export const workspaceAllowed = (role?: string): boolean => {
  return true;
};