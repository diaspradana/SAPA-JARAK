import { useEffect, useState } from 'react';

export default function useHamletOptions() {
  const [hamlets, setHamlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchHamlets = async () => {
      try {
        const response = await fetch('/api/public/hamlets', {
          headers: { Accept: 'application/json' }
        });
        const payload = await response.json();
        if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
          throw new Error(payload.message || 'Data dusun dan RT/RW gagal dimuat dari server.');
        }
        if (active) setHamlets(payload.data);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Data dusun dan RT/RW gagal dimuat dari server.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHamlets();
    return () => { active = false; };
  }, []);

  return { hamlets, loading, error };
}
