/**
 * Better Auth configuration for frontend.
 * Handles session management and authentication state.
 * T016: Setup Better Auth configuration
 */

export interface AuthConfig {
  apiUrl: string;
  sessionCookieName: string;
}

export const authConfig: AuthConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  sessionCookieName: 'session',
};

export interface Session {
  user: {
    id: string;
    email: string;
  } | null;
}

/**
 * Placeholder for Better Auth integration.
 * Will be implemented with Better Auth SDK in authentication phase.
 */
export const auth = {
  config: authConfig,
};
