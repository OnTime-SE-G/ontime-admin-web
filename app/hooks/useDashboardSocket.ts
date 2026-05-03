'use client';

import { useEffect, useState, useCallback } from 'react';
import { dashboardSocket } from '@/lib/socket/dashboard/dashboardSocketAdapter';
import type { DashboardStats } from '@/lib/socket/dashboard/dashboardTypes';

const INITIAL_STATS: DashboardStats = {
  totalRoutes:     21,
  totalBuses:      48,
  activeBuses:     32,
  assignedDrivers: 44,
  lastUpdated:     Date.now(),
};

export function useDashboardSocket() {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ==============================
  // Handlers
  // ==============================

  const onConnect = useCallback(() => {
    console.log('[useDashboardSocket] connected');
    setIsConnected(true);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDisconnect = useCallback((reason: string) => {
    console.warn('[useDashboardSocket] disconnected:', reason);
    setIsConnected(false);
    setIsLoading(false);
  }, []);

  const onConnectError = useCallback((err: Error) => {
    console.error('[useDashboardSocket] error:', err.message);
    setIsConnected(false);
    setIsLoading(false);
    setError(err);
  }, []);

  const onStats = useCallback((data: DashboardStats) => {
    setStats(data);
    setIsLoading(false);
  }, []);

  // ==============================
  // Effect
  // ==============================

  useEffect(() => {
    console.log('[useDashboardSocket] mount → subscribe');

    // Ensure no duplicate listeners
    dashboardSocket.off('connect', onConnect);
    dashboardSocket.off('disconnect', onDisconnect);
    dashboardSocket.off('connect_error', onConnectError);
    dashboardSocket.off('dashboard:stats', onStats);

    dashboardSocket.on('connect', onConnect);
    dashboardSocket.on('disconnect', onDisconnect);
    dashboardSocket.on('connect_error', onConnectError);
    dashboardSocket.on('dashboard:stats', onStats);

    // Connect only if needed
    if (!dashboardSocket.isConnected) {
      dashboardSocket.connect();
    }

    return () => {
      console.log('[useDashboardSocket] unmount → cleanup');

      dashboardSocket.off('connect', onConnect);
      dashboardSocket.off('disconnect', onDisconnect);
      dashboardSocket.off('connect_error', onConnectError);
      dashboardSocket.off('dashboard:stats', onStats);

      // ⚠️ DO NOT disconnect here in shared socket architecture
      // Let adapter or provider control lifecycle
    };
  }, [onConnect, onDisconnect, onConnectError, onStats]);

  return {
    stats,
    isConnected,
    isLoading,
    error,
  };
}