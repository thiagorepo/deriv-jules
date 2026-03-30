import { createDerivApi } from './deriv-api';

describe('DerivApiService (Singleton)', () => {
  let api: ReturnType<typeof createDerivApi>;

  beforeEach(() => {
    api = createDerivApi();
    // Reset state between tests
    api.disconnect();
    api.status = 'Disconnected';
    api.listeners.clear();
    api.messageListeners.clear();
  });

  it('returns the same singleton instance on multiple calls', () => {
    const api1 = createDerivApi();
    const api2 = createDerivApi();
    expect(api1).toBe(api2);
  });

  it('starts in Disconnected status', () => {
    expect(api.status).toBe('Disconnected');
  });

  it('subscribeStatus emits current status immediately', () => {
    const statuses: string[] = [];
    api.subscribeStatus((s) => statuses.push(s));
    expect(statuses).toEqual(['Disconnected']);
  });

  it('updateStatus notifies all status listeners', () => {
    const received: string[] = [];
    api.subscribeStatus((s) => received.push(s));
    api.updateStatus('Connected');
    expect(received).toContain('Connected');
  });

  it('subscribeStatus returns an unsubscribe function', () => {
    const received: string[] = [];
    const unsubscribe = api.subscribeStatus((s) => received.push(s));
    unsubscribe();
    api.updateStatus('Connected');
    // After unsubscribing, only the initial emit is captured
    expect(received).toHaveLength(1);
  });

  it('subscribeMessages registers and calls callback on message', () => {
    const messages: Record<string, unknown>[] = [];
    api.subscribeMessages((data) => messages.push(data));
    const testMsg = { msg_type: 'ping', ping: 'pong' };
    api.messageListeners.forEach((cb) => cb(testMsg));
    expect(messages).toContain(testMsg);
  });

  it('subscribeMessages returns an unsubscribe function', () => {
    const received: Record<string, unknown>[] = [];
    const unsubscribe = api.subscribeMessages((d) => received.push(d));
    unsubscribe();
    api.messageListeners.forEach((cb) => cb({ msg_type: 'test' }));
    expect(received).toHaveLength(0);
  });

  it('warn if send is called when not connected', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    api.send({ ping: 1 });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('ping rejects when not connected', async () => {
    await expect(api.ping()).rejects.toThrow('WebSocket not connected');
  });

  it('does not double-connect when already Connecting', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    api.status = 'Connecting';
    api.connect('1089');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Already Connecting'));
    log.mockRestore();
  });
});
