import type { BusLocation } from './socketService';
import type {
  SocketClient,
  SocketEventHandler,
  SocketEventMap,
} from './socketTypes';

// const INITIAL_BUSES: BusLocation[] = [
//   { busId: 'BUS-01', routeId: 'R138', lat: 6.930, lng: 79.851, speed: 32, heading: 60,  timestamp: Date.now(), occupancy: 'low'    },
//   { busId: 'BUS-02', routeId: 'R154', lat: 6.918, lng: 79.862, speed: 25, heading: 135, timestamp: Date.now(), occupancy: 'medium' },
//   { busId: 'BUS-03', routeId: 'R120', lat: 6.944, lng: 79.841, speed: 0,  heading: 0,   timestamp: Date.now(), occupancy: 'high'   },
// ];

const INITIAL_BUSES: BusLocation[] = [
  {
    busId: 'BUS-01', routeId: 'R138',
    lat: 6.930, lng: 79.851, speed: 32, heading: 60,
    timestamp: Date.now(), occupancy: 'low',
    status: 'active', driverName: 'Kamal Perera', eta: 8,
  },
  {
    busId: 'BUS-02', routeId: 'R154',
    lat: 6.918, lng: 79.862, speed: 25, heading: 135,
    timestamp: Date.now(), occupancy: 'medium',
    status: 'active', driverName: 'Nimal Silva', eta: 14,
  },
  {
    busId: 'BUS-03', routeId: 'R120',
    lat: 6.944, lng: 79.841, speed: 0, heading: 0,
    timestamp: Date.now(), occupancy: 'high',
    status: 'delayed', driverName: 'Suresh Fernando', eta: 22,
  },
];

type AnyHandler = (data: unknown) => void;

class MockSocketSimulator implements SocketClient {
  private handlers = new Map<string, Set<AnyHandler>>();
  private buses: BusLocation[] = structuredClone(INITIAL_BUSES);
  private interval: ReturnType<typeof setInterval> | null = null;
  private connectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Two flags prevent the double-connect caused by React Strict Mode
  private _connected = false;
  private _connecting = false;

  connect() {
    // Guard: already connected or mid-handshake → do nothing
    if (this._connected || this._connecting) {
      console.log('[MockSocket] Already connected or connecting — skipping');
      return;
    }

    this._connecting = true;
    console.log('[MockSocket] Connecting...');

    // Clear any pending timeout from a previous interrupted connect
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
    }

    this.connectTimeout = setTimeout(() => {
      this._connecting = false;
      this._connected = true;
      console.log('[MockSocket] Connected ✓');
      this._emit('connect', undefined);
      this._startSimulation();
    }, 350);
  }

  private _startSimulation() {
    // Always clear before starting — prevents stacked intervals on re-connect
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    console.log('[MockSocket] Simulation started');

    this.interval = setInterval(() => {
      this.buses = this.buses.map(this._moveBus);
      this.buses.forEach((bus) => this._emit('bus:location', bus));
    }, 1600);
  }

  private _moveBus = (bus: BusLocation): BusLocation => {
    const rad    = (bus.heading * Math.PI) / 180;
    const factor = (bus.speed / 80) * 0.0006;

    let newLat = bus.lat + Math.cos(rad) * factor + (Math.random() - 0.5) * 0.00008;
    let newLng = bus.lng + Math.sin(rad) * factor + (Math.random() - 0.5) * 0.00008;
    let newHeading = (bus.heading + (Math.random() - 0.5) * 12 + 360) % 360;

    // Soft-bounce off the Colombo bounding box so buses stay on screen
    const BOUNDS = { minLat: 6.900, maxLat: 6.960, minLng: 79.830, maxLng: 79.890 };
    if (newLat < BOUNDS.minLat || newLat > BOUNDS.maxLat) {
      newHeading = (360 - newHeading) % 360;
      newLat = Math.max(BOUNDS.minLat, Math.min(BOUNDS.maxLat, newLat));
    }
    if (newLng < BOUNDS.minLng || newLng > BOUNDS.maxLng) {
      newHeading = (180 - newHeading + 360) % 360;
      newLng = Math.max(BOUNDS.minLng, Math.min(BOUNDS.maxLng, newLng));
    }

    return {
      ...bus,
      lat:      newLat,
      lng:      newLng,
      speed:    Math.max(0, Math.min(60, bus.speed + (Math.random() - 0.5) * 5)),
      heading:  newHeading,
      timestamp: Date.now(),
      eta: Math.max(1, bus.eta - 1),
    };
  };

  on<K extends keyof SocketEventMap>(event: K, handler: SocketEventHandler<K>) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as AnyHandler);
  }

  off<K extends keyof SocketEventMap>(event: K, handler?: SocketEventHandler<K>) {
    if (!handler) {
      this.handlers.delete(event);
      return;
    }
    this.handlers.get(event)?.delete(handler as AnyHandler);
  }

  private _emit(event: string, data: unknown) {
    this.handlers.get(event)?.forEach((h) => h(data));
  }

  emit(event: string, data?: unknown) {
    // Mock doesn't need to send anything to a server — no-op
    console.log(`[MockSocket] emit "${event}"`, data);
  }

  disconnect() {
    console.log('[MockSocket] Disconnecting...');

    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this._connected = false;
    this._connecting = false;
    this._emit('disconnect', 'manual');
  }

  get isConnected() {
    return this._connected;
  }
}

// Singleton — one instance shared across the entire app
export const mockSimulator: SocketClient = new MockSocketSimulator();