import { useEffect, useState } from 'react';
import { createDerivApi } from './deriv-api';

export function useDerivConnection(appId: string) {
    const [status, setStatus] = useState('Disconnected');
    const api = createDerivApi();

    useEffect(() => {
        const unsubscribe = api.subscribeStatus((newStatus) => {
            setStatus(newStatus);
        });

        api.connect(appId);

        return () => {
            unsubscribe();
            // Don't disconnect here if it's a singleton meant to be reused
        };
    }, [appId, api]);

    return { status, api };
}

interface BalanceMessage {
  balance?: number;
  currency?: string;
}

export function useDerivBalance(apiToken: string) {
    const [balance, setBalance] = useState<BalanceMessage | null>(null);
    const api = createDerivApi();

    useEffect(() => {
        const unsubscribe = api.subscribeMessages((data) => {
            if (data['msg_type'] === 'balance') {
                setBalance(data['balance'] as BalanceMessage);
            }
        });

        // Ensure we are connected
        if (apiToken) {
           api.send({ authorize: apiToken });
        }

        return () => {
            unsubscribe();
        };
    }, [apiToken, api]);

    // Function to trigger balance update
    const fetchBalance = () => {
        api.send({ balance: 1, subscribe: 1 });
    };

    return { balance, fetchBalance };
}

export function useDerivContracts() {
   const [contracts, setContracts] = useState<Record<string, unknown>[] | null>(null);
   const api = createDerivApi();

    useEffect(() => {
        const unsubscribe = api.subscribeMessages((data) => {
            if (data['msg_type'] === 'active_symbols') {
                setContracts(data['active_symbols'] as Record<string, unknown>[]);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [api]);

    const fetchContracts = (_market: string = 'synthetic_index') => {
        api.send({ active_symbols: 'brief', product_type: 'basic' });
    };

    return { contracts, fetchContracts };
}
