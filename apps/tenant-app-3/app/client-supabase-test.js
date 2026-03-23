'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@org/supabase';

export default function ClientSupabaseTest() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize Client Component Supabase
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'mock-url',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'
    );

    // 2. Fetch data
    const fetchData = async () => {
      setLoading(true);
      console.log('[Supabase CSR] Fetching mock profiles...');
      const { data: profiles, error } = await supabase.from('profiles').select('*');
      
      if (!error && profiles) {
        setData(profiles);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      <p style={{ marginBottom: '1rem' }}>
        Fetching mock profiles via Browser Client.
      </p>
      {loading ? (
         <p>Loading profiles...</p>
      ) : (
         <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '2rem' }}>
            Profiles Loaded: {data.length > 0 ? 'Yes' : 'No'}
         </p>
      )}

      {/* Button using Theme Context (simulated) */}
      <button style={{
        backgroundColor: 'transparent',
        border: `1px solid var(--primary-color, #10b981)`,
        color: 'var(--primary-color, #10b981)',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Sign In (CSR)
      </button>
    </div>
  );
}
