# @org/deriv-api

This package exposes a singleton `DerivApiService` which manages persistent WebSocket connections to the Deriv API.

## Features

- Provides an easy singleton getter `createDerivApi()`.
- Built-in reconnection logic and pub/sub mechanisms for component status updates.
- Properly handles cleanup and memory leak prevention during component unmounts.
