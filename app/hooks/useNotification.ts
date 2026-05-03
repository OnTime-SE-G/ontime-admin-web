'use client';

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';

import { notificationMockSimulator } from '@/lib/socket/notification/notificationMockSimulator';
import { notificationSocketService } from '@/lib/socket/notification/notificationSocketService';
import type { Notification } from '@/lib/socket/notification/notificationTypes';

const MAX_NOTIFICATIONS = 50;
const TOAST_DURATION = 5000;

function resolveNotificationSocket() {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK?.trim().toLowerCase();

  if (flag === 'true') return notificationMockSimulator;
  if (flag === 'false') return notificationSocketService;

  return process.env.NODE_ENV !== 'production'
    ? notificationMockSimulator
    : notificationSocketService;
}

export function useNotifications() {
  const notificationSocket = resolveNotificationSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Track active timers (important fix)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ==============================
  // Derived
  // ==============================

  const unreadCount = useMemo(
    () => notifications.reduce((count, n) => count + (n.read ? 0 : 1), 0),
    [notifications]
  );

  // ==============================
  // Handlers
  // ==============================

  const onConnect = useCallback(() => {
    console.log('[useNotifications] connected');
    setIsConnected(true);
  }, []);

  const onDisconnect = useCallback((reason: string) => {
    console.warn('[useNotifications] disconnected:', reason);
    setIsConnected(false);
  }, []);

  const onConnectError = useCallback((err: Error) => {
    console.error('[useNotifications] connection error:', err.message);
    setIsConnected(false);
  }, []);

  const onNew = useCallback((notif: Notification) => {
    console.log('[useNotifications] notification:new →', notif.type);

    // Prevent duplicate notifications
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notif.id)) return prev;
      return [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
    });

    // Prevent duplicate toast
    setToasts((prev) => {
      if (prev.some((t) => t.id === notif.id)) return prev;
      return [...prev, notif];
    });

    // Clear existing timer if any
    const existingTimer = timersRef.current.get(notif.id);
    if (existingTimer) clearTimeout(existingTimer);

    // Create new timer
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== notif.id));
      timersRef.current.delete(notif.id);
    }, TOAST_DURATION);

    timersRef.current.set(notif.id, timer);
  }, []);

  const onClear = useCallback(({ id }: { id: string }) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToasts((prev) => prev.filter((t) => t.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  // ==============================
  // Actions
  // ==============================

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    notificationSocket.emit('notification:read', { id });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setToasts([]);

    // clear all timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  }, []);

  // ==============================
  // Effect
  // ==============================

  useEffect(() => {
    console.log('[useNotifications] mount → subscribe');

    // Prevent duplicates
    notificationSocket.off('connect', onConnect);
    notificationSocket.off('disconnect', onDisconnect);
    notificationSocket.off('connect_error', onConnectError);
    notificationSocket.off('notification:new', onNew);
    notificationSocket.off('notification:clear', onClear);

    notificationSocket.on('connect', onConnect);
    notificationSocket.on('disconnect', onDisconnect);
    notificationSocket.on('connect_error', onConnectError);
    notificationSocket.on('notification:new', onNew);
    notificationSocket.on('notification:clear', onClear);

    if (!notificationSocket.isConnected) {
      notificationSocket.connect();
    }

    return () => {
      console.log('[useNotifications] unmount → cleanup');

      notificationSocket.off('connect', onConnect);
      notificationSocket.off('disconnect', onDisconnect);
      notificationSocket.off('connect_error', onConnectError);
      notificationSocket.off('notification:new', onNew);
      notificationSocket.off('notification:clear', onClear);

      // Clear all timers (critical fix)
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, [onConnect, onDisconnect, onConnectError, onNew, onClear]);

  // ==============================
  // Return
  // ==============================

  return {
    notifications,
    toasts,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    dismissToast,
    clearAll,
  };
}