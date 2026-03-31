# @org/deriv-api

WebSocket API client and React hooks for the Deriv trading API.

## Overview

This package exposes a **Singleton** `DerivApiService` that manages a persistent WebSocket connection to the Deriv API endpoint (`wss://ws.derivws.com/websockets/v3`). The Singleton pattern ensures exactly one connection is maintained across all React component renders and hot module replacements.

## DerivApiService

```ts
import { createDerivApi } from '@org/deriv-api';

const api = createDerivApi(); // Always returns the same instance

// Connect
api.connect('YOUR_DERIV_APP_ID');

// Send a request
api.send({ ping: 1 });

// Subscribe to messages
const unsubscribe = api.subscribeMessages((data) => {
  console.log(data);
});

// Disconnect (cleans up all listeners)
api.disconnect();
```

### Auto-reconnect

The service automatically schedules a 5-second reconnect when the WebSocket closes unexpectedly. Call `api.disconnect()` explicitly to prevent reconnection.

## React Hooks

### `useDerivConnection(appId)`

Manages the WebSocket lifecycle and exposes connection status.

```tsx
import { useDerivConnection } from '@org/deriv-api';

function TradingWidget() {
  const { status, api } = useDerivConnection('1089');

  return <div>Status: {status}</div>;
  // status: 'Connecting' | 'Connected' | 'Disconnected'
}
```

### `useDerivBalance(apiToken)`

Subscribes to real-time balance updates after authorisation.

```tsx
import { useDerivBalance } from '@org/deriv-api';

function BalanceDisplay({ token }: { token: string }) {
  const { balance, fetchBalance } = useDerivBalance(token);

  return <div>Balance: {balance?.balance}</div>;
}
```

### `useDerivContracts()`

Fetches available trading symbols/contracts.

```tsx
import { useDerivContracts } from '@org/deriv-api';

function MarketList() {
  const { contracts, fetchContracts } = useDerivContracts();

  useEffect(() => {
    fetchContracts('synthetic_index');
  }, []);

  return <ul>{contracts?.map(c => <li key={String(c.symbol)}>{String(c.display_name)}</li>)}</ul>;
}
```

## Configuration

Set `DERIV_APP_ID` in your `.env.local`. The Deriv App ID is obtained from the [Deriv API portal](https://api.deriv.com).

## Status Values

| Status         | Description                        |
|----------------|------------------------------------|
| `Disconnected` | Not connected (initial state)      |
| `Connecting`   | Connection attempt in progress     |
| `Connected`    | Active WebSocket connection         |
