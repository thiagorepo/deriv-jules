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

export function useDerivBalance(apiToken: string) {
    const [balance, setBalance] = useState<any>(null);
    const api = createDerivApi();

    useEffect(() => {
        const unsubscribe = api.subscribeMessages((data: any) => {
            if (data.msg_type === 'balance') {
                setBalance(data.balance);
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
   const [contracts, setContracts] = useState<any>(null);
   const api = createDerivApi();

    useEffect(() => {
        const unsubscribe = api.subscribeMessages((data: any) => {
            if (data.msg_type === 'active_symbols') {
                setContracts(data.active_symbols);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [api]);

    const fetchContracts = (market: string = 'synthetic_index') => {
        api.send({ active_symbols: 'brief', product_type: 'basic' });
    };

    return { contracts, fetchContracts };
}
