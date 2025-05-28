import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Durasi cache 30 menit dalam milidetik
const CACHE_DURATION = 30 * 60 * 1000;

export function useCache<T>(key: string, initialData: T, fetchData: () => Promise<T>) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Menggunakan useRef untuk menyimpan fungsi fetchData agar tidak menyebabkan re-render
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  // Fungsi untuk mengambil data dengan pengecekan cache
  const fetchCachedData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Coba ambil dari localStorage terlebih dahulu
      try {
        const cachedItem = localStorage.getItem(`cache_${key}`);
        
        if (cachedItem) {
          const parsedItem: CacheItem<T> = JSON.parse(cachedItem);
          const now = Date.now();
          
          // Jika cache masih valid (belum 30 menit)
          if (now - parsedItem.timestamp < CACHE_DURATION) {
            setData(parsedItem.data);
            setIsLoading(false);
            return;
          }
        }
      } catch (localStorageError) {
        console.error('Error accessing localStorage:', localStorageError);
        // Lanjutkan jika ada masalah dengan localStorage
      }
      
      // Jika tidak ada cache atau cache sudah kedaluwarsa, ambil data baru
      const freshData = await fetchDataRef.current();
      
      // Simpan data baru ke cache
      try {
        const cacheItem: CacheItem<T> = {
          data: freshData,
          timestamp: Date.now()
        };
        
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      } catch (saveError) {
        console.error('Error saving to localStorage:', saveError);
        // Lanjutkan meskipun gagal menyimpan ke cache
      }
      
      setData(freshData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data'));
      
      // Jika terjadi kesalahan, coba gunakan data cache meskipun sudah kedaluwarsa
      try {
        const cachedItem = localStorage.getItem(`cache_${key}`);
        if (cachedItem) {
          const parsedItem: CacheItem<T> = JSON.parse(cachedItem);
          setData(parsedItem.data);
        }
      } catch (fallbackError) {
        console.error('Error accessing localStorage for fallback:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [key]); // Hanya bergantung pada key

  // Jalankan fetchCachedData saat komponen mount atau key berubah
  useEffect(() => {
    fetchCachedData();
  }, [fetchCachedData]);

  // Fungsi untuk manual refresh data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const freshData = await fetchDataRef.current();
      
      try {
        const cacheItem: CacheItem<T> = {
          data: freshData,
          timestamp: Date.now()
        };
        
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      } catch (saveError) {
        console.error('Error saving to localStorage:', saveError);
      }
      
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat memperbarui data'));
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Fungsi untuk menghapus cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key]);

  return { data, isLoading, error, refreshData, clearCache };
} 