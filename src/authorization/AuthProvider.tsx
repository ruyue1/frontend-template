import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useRequest } from 'ahooks';
import { AuthorizationApiError, getMyResources } from '@/apis/authorization';

export type AuthState = 'loading' | 'ready' | 'unauthenticated' | 'forbidden' | 'not-ready' | 'error';
type AuthContextValue = {
  resourceKeys: string[];
  state: AuthState;
  loading: boolean;
  error?: unknown;
  can: (resourceKey: string) => boolean;
  refreshPermissions: () => Promise<unknown>;
};

const AuthContext = createContext<AuthContextValue>({
  resourceKeys: [], state: 'loading', loading: true, can: () => false, refreshPermissions: async () => undefined,
});
const statusOf = (error: unknown) => (error as { response?: { status?: number } })?.response?.status;
export const AUTHORIZATION_RESOURCE_KEY = 'system_authorization_management';

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, loading, error, refreshAsync } = useRequest(getMyResources);
  const resourceKeys = data?.resourceKeys ?? [];
  const returnCode = error instanceof AuthorizationApiError ? error.returnCode : undefined;
  const state: AuthState = loading ? 'loading' : error
    ? statusOf(error) === 401 || returnCode === 'XCD1B11' ? 'unauthenticated' : statusOf(error) === 403 || returnCode === 'XCD1B10' ? 'forbidden' : statusOf(error) === 503 || returnCode === 'XCD1B12' ? 'not-ready' : 'error'
    : 'ready';
  const value = useMemo(() => ({
    resourceKeys, state, loading, error,
    can: (resourceKey: string) => state === 'ready' && resourceKeys.includes(resourceKey),
    refreshPermissions: refreshAsync,
  }), [error, loading, refreshAsync, resourceKeys, state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
