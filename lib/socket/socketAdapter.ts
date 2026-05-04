// socketAdapter.ts

import { mockSimulator } from './mockSimulator';
import { socketService } from './socketService';
import type { SocketClient } from './socketTypes';

// Use mock when NEXT_PUBLIC_USE_MOCK=true or NEXT_PUBLIC_USE_MOCK_SOCKET=true.
// Defaults to real backend; explicit false disables mock even in development.
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK?.toLowerCase() === 'true' ||
  process.env.NEXT_PUBLIC_USE_MOCK_SOCKET?.toLowerCase() === 'true';

// Log mode
console.log(
  `[Socket] Running in ${USE_MOCK ? 'MOCK MODE' : 'REAL BACKEND MODE'}`
);

// Unified socket instance
export const socket: SocketClient = USE_MOCK ? mockSimulator : socketService;

// Shared type
export type { BusLocation } from './socketService';