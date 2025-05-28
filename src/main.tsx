import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './stagewise.css'

// Render aplikasi utama
createRoot(document.getElementById("root")!).render(<App />);

// Log mode aplikasi
if (import.meta.env.DEV) {
  console.log('Running in development mode - Stagewise Toolbar should be available');
  
  // Tambahkan event listener global untuk tombol Enter
  document.addEventListener('keydown', (e) => {
    // Log semua keydown events untuk debugging
    console.log('Global keydown event:', e.key);
    
    // Cek apakah ada elemen dengan class stagewise yang sedang aktif/fokus
    const activeElement = document.activeElement;
    const isStageWiseActive = activeElement?.closest('.stagewise-toolbar-wrapper') || 
                             activeElement?.classList.contains('stagewise-toolbar') ||
                             activeElement?.closest('.stagewise-toolbar');
    
    if (isStageWiseActive && e.key === 'Enter') {
      console.log('Enter key pressed while Stagewise is active');
      // Mencegah default behavior jika tombol Enter ditekan pada elemen Stagewise
      e.preventDefault();
      e.stopPropagation();
      
      // Coba trigger click event pada elemen yang aktif
      if (activeElement instanceof HTMLElement) {
        activeElement.click();
      }
    }
  }, true); // Gunakan capture phase untuk menangkap event sebelum elemen lain
} else {
  console.log('Running in production mode - Stagewise Toolbar is disabled');
}

// Fungsi untuk membersihkan cache yang tidak valid
function cleanupExpiredCache() {
  try {
    const CACHE_DURATION = 30 * 60 * 1000; // 30 menit
    const now = Date.now();
    
    // Dapatkan semua kunci dari localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Cek apakah ini adalah item cache
      if (key && key.startsWith('cache_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsedItem = JSON.parse(item);
            
            // Jika item sudah kedaluwarsa atau tidak memiliki timestamp yang valid
            if (!parsedItem.timestamp || now - parsedItem.timestamp > CACHE_DURATION) {
              console.log(`Removing expired cache item: ${key}`);
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // Jika ada masalah dengan format item, hapus saja
          console.error(`Error parsing cache item ${key}, removing it:`, e);
          localStorage.removeItem(key);
        }
      }
    }
    console.log('Cache cleanup completed');
  } catch (e) {
    console.error('Failed to clean up cache:', e);
  }
}

// Jalankan pembersihan cache saat aplikasi dimulai
cleanupExpiredCache();
