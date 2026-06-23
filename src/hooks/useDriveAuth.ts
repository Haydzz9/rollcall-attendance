import { useCallback, useEffect, useState } from 'react';
import { disconnectDrive, initDriveAuth, requestDriveAccess } from '../lib/googleDriveAuth';
import { isGoogleConfigured } from '../config';

export function useDriveAuth() {
  const [connected, setConnected] = useState(false);
  const [configured] = useState(isGoogleConfigured());

  useEffect(() => {
    initDriveAuth((isConnected) => setConnected(isConnected));
  }, []);

  const connect = useCallback(() => {
    requestDriveAccess(!connected);
  }, [connected]);

  const disconnect = useCallback(() => {
    disconnectDrive();
    setConnected(false);
  }, []);

  return { connected, configured, connect, disconnect };
}
