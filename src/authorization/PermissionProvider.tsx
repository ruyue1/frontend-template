import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { getMyEffectivePermissions } from './authorizationApi';

export type PermissionState = 'loading' | 'ready' | 'unauthenticated' | 'forbidden' | 'not-ready' | 'error';
type PermissionContextValue = { state: PermissionState; can: (resourceKey: string) => boolean; retry: () => void };
const PermissionContext = createContext<PermissionContextValue>({ state: 'loading', can: () => false, retry: () => {} });

const statusOf = (error: unknown) => (error as { response?: { status?: number } })?.response?.status;

export function PermissionProvider({ children }: PropsWithChildren) {
  const [resourceKeys, setResourceKeys] = useState<string[]>([]);
  const [state, setState] = useState<PermissionState>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState('loading');
    setResourceKeys([]);
    getMyEffectivePermissions().then(({ resourceKeys: keys }) => {
      if (!active) return;
      setResourceKeys(keys);
      setState('ready');
    }).catch((error) => {
      if (!active) return;
      setResourceKeys([]);
      const status = statusOf(error);
      setState(status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : status === 503 ? 'not-ready' : 'error');
      // service's global response interceptor remains responsible for the login redirect flow.
    });
    return () => { active = false; };
  }, [attempt]);

  const value = useMemo(() => ({
    state,
    can: (resourceKey: string) => state === 'ready' && resourceKeys.includes(resourceKey),
    retry: () => setAttempt((value) => value + 1),
  }), [resourceKeys, state]);
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export const usePermission = () => useContext(PermissionContext);
export const AUTHORIZATION_RESOURCE_KEY = 'system_authorization_management';
