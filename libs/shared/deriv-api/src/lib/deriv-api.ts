/**
 * DerivApiService
 *
 * A singleton WebSocket manager for connecting to the Deriv API.
 * Automatically handles reconnection, state management, and pub/sub listener registration.
 */
class DerivApiService {
  private ws: any = null;
  private appId: string | null = null;
  private endpoint: string | null = null;
  private status: string = 'Disconnected';
  private listeners: Set<Function> = new Set();
  private reconnectTimeout: any = null;
  private static instance: DerivApiService;

  constructor() {
    this.ws = null;
    this.appId = null;
    this.endpoint = null;
    this.status = 'Disconnected';
    this.listeners = new Set();
    this.reconnectTimeout = null;
  }

  /**
   * Retrieves the singleton instance of the Deriv API service.
   * @returns {DerivApiService}
   */
  static getInstance(): DerivApiService {
    if (!DerivApiService.instance) {
      DerivApiService.instance = new DerivApiService();
    }
    return DerivApiService.instance;
  }

  /**
   * Connects to the Deriv WebSocket API.
   * @param {string} appId - The Deriv Application ID.
   * @param {string} [endpoint='wss://ws.binaryws.com/websockets/v3'] - The Deriv WS endpoint.
   */
  connect(
    appId: string,
    endpoint: string = 'wss://ws.binaryws.com/websockets/v3'
  ) {
    // Prevent double connections (React 18 Strict Mode or fast re-renders)
    if (this.status === 'Connecting' || this.status === 'Connected') {
      console.log(`[Deriv API] Already ${this.status}. Skipping connect.`);
      return;
    }

    this.appId = appId;
    this.endpoint = endpoint;
    this.updateStatus('Connecting');

    console.log(
      `[Deriv API] Connecting to ${this.endpoint}?app_id=${this.appId}...`
    );

    try {
      this.ws = new (globalThis as any).WebSocket(
        `${this.endpoint}?app_id=${this.appId}`
      );

      this.ws.onopen = () => {
        console.log('[Deriv API] Connection opened');
        this.updateStatus('Connected');
        // Clear any pending reconnect attempts
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
      };

      this.ws.onmessage = (_msg: any) => {
        // In a real app, parse msg.data and notify specific stores (like Redux/Zustand)
        console.log('[Deriv API] Received message');
      };

      this.ws.onclose = () => {
        console.log('[Deriv API] Connection closed');
        this.updateStatus('Disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err: any) => {
        console.error('[Deriv API] WebSocket Error:', err);
      };
    } catch (err) {
      console.error('[Deriv API] Failed to instantiate WebSocket:', err);
      this.updateStatus('Disconnected');
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) return;
    console.log('[Deriv API] Scheduling reconnect in 5s...');
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect(this.appId as string, this.endpoint as string);
    }, 5000);
  }

  /**
   * Gracefully disconnects the WebSocket and cleans up listeners
   * to prevent memory leaks across React re-renders or unmounts.
   */
  disconnect() {
    if (this.ws) {
      // Remove event listeners to prevent memory leaks across React re-renders or unmounts
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      this.ws.close();
      this.ws = null;
    }
    this.updateStatus('Disconnected');
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  ping() {
    if (this.ws && this.status === 'Connected') {
      this.ws.send(JSON.stringify({ ping: 1 }));
      return Promise.resolve({ ping: 'pong' });
    }
    return Promise.reject(new Error('WebSocket not connected'));
  }

  // Subscribe to raw status changes (for React hooks to display)
  subscribeStatus(callback: Function) {
    this.listeners.add(callback);
    callback(this.status); // Immediately emit current status
    return () => this.listeners.delete(callback);
  }

  updateStatus(newStatus: string) {
    this.status = newStatus;
    this.listeners.forEach((cb) => cb(this.status));
  }
}

/**
 * Returns the singleton instance of DerivApiService.
 * Included to maintain backward compatibility with legacy UI code structure.
 * @returns {DerivApiService}
 */
export function createDerivApi() {
  return DerivApiService.getInstance();
}
