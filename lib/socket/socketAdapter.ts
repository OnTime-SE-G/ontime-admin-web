// socketAdapter.ts

import { mockSimulator } from './mockSimulator';
import { socketService } from './socketService';
import type { SocketClient } from './socketTypes';

// Decide mode based on env
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_SOCKET?.toLowerCase() === 'true';

// Log mode
console.log(
  `[Socket] Running in ${USE_MOCK ? 'MOCK MODE' : 'REAL BACKEND MODE'}`
);

// Unified socket instance
export const socket: SocketClient = USE_MOCK ? mockSimulator : socketService;

// Shared type
export type { BusLocation } from './socketService';