import React, { useEffect } from 'react';
import { StagewiseToolbar } from '@stagewise/toolbar-react';

// Polyfill untuk crypto.randomUUID jika tidak tersedia
if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
  window.crypto.randomUUID = function() {
    return ([1e7] as any +-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c: any) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };
}

interface StagewiseToolbarWrapperProps {
  // Props tambahan jika diperlukan
}

export const StagewiseToolbarWrapper: React.FC<StagewiseToolbarWrapperProps> = () => {
  useEffect(() => {
    console.log('StagewiseToolbarWrapper mounted');

    // Tambahkan event listener untuk keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key);
      
      // Cek apakah ada elemen input atau textarea yang fokus
      const activeElement = document.activeElement;
      const isInputActive = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      // Jika tombol Enter ditekan pada input dalam toolbar
      if (isInputActive && e.key === 'Enter' && activeElement?.closest('.stagewise-toolbar')) {
        console.log('Enter key pressed in Stagewise input');
        e.preventDefault();
        e.stopPropagation();
        
        // Cari tombol submit terdekat
        const submitButton = activeElement.closest('form')?.querySelector('button[type="submit"]') || 
                            activeElement.parentElement?.querySelector('button') ||
                            activeElement.parentElement?.parentElement?.querySelector('button');
        
        // Klik tombol jika ditemukan
        if (submitButton instanceof HTMLElement) {
          console.log('Found submit button, clicking it');
          submitButton.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Gunakan capture phase

    return () => {
      console.log('StagewiseToolbarWrapper unmounted');
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const stagewiseConfig = {
    plugins: [],
    enableHighlighting: true,
    enableInspector: true,
    position: 'bottom-right',
    // Tambahkan konfigurasi tambahan
    enableKeyboardShortcuts: true,
    keyboardShortcutModifier: 'shift',
    allowInputFocus: true,
    captureEnterKey: true,
    // Tambahkan custom UUID generator untuk mengatasi error
    uuidGenerator: () => {
      // Implementasi sederhana jika crypto.randomUUID tidak tersedia
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  };

  return (
    <div 
      className="stagewise-toolbar-wrapper"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        pointerEvents: 'auto',
        tabIndex: 0 // Tambahkan tabIndex untuk memastikan elemen dapat menerima fokus
      }}
      onKeyDown={(e) => {
        console.log('Toolbar key pressed:', e.key);
        // Mencegah event default jika tombol Enter ditekan
        if (e.key === 'Enter') {
          e.preventDefault();
          console.log('Enter key captured in toolbar wrapper');
        }
      }}
    >
      <StagewiseToolbar config={stagewiseConfig} />
    </div>
  );
};

export default StagewiseToolbarWrapper; 