// Script untuk memperbaiki masalah Enter key di Stagewise Toolbar
(function() {
  // Fungsi untuk mendeteksi apakah kita berada di mode development
  function isDevelopmentMode() {
    // Cek URL untuk localhost atau development server
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('192.168.');
    
    // Cek port development yang umum digunakan
    const isDevelopmentPort = window.location.port === '3000' || 
                             window.location.port === '8080' ||
                             window.location.port === '8081' ||
                             window.location.port === '8082' ||
                             window.location.port === '5173';
    
    return isLocalhost || isDevelopmentPort;
  }
  
  // Hanya jalankan di mode development
  if (!isDevelopmentMode()) {
    console.log('Stagewise Patch: Not in development mode, skipping patch');
    return;
  }
  
  console.log('Stagewise Patch: Development mode detected, initializing patch...');
  
  // Patch untuk crypto.randomUUID jika tidak tersedia
  if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
    console.log('Stagewise Patch: Adding crypto.randomUUID polyfill');
    crypto.randomUUID = function() {
      // Implementasi sederhana dari UUID v4
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    };
  }
  
  // Muat CSS tambahan
  function loadAdditionalCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/stagewise-styles.css';
    link.id = 'stagewise-additional-styles';
    document.head.appendChild(link);
    console.log('Stagewise Patch: Additional CSS loaded');
  }
  
  // Muat CSS tambahan
  loadAdditionalCSS();
  
  // Tunggu hingga DOM selesai dimuat
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Stagewise Patch: DOM loaded, initializing...');
    
    // Fungsi untuk menambahkan event listener pada elemen Stagewise
    function patchStagewiseElements() {
      console.log('Stagewise Patch: Looking for Stagewise elements...');
      
      // Cari elemen toolbar
      const toolbar = document.querySelector('.stagewise-toolbar');
      
      if (toolbar) {
        console.log('Stagewise Patch: Found Stagewise toolbar');
        
        // Cari semua elemen input dan textarea dalam toolbar
        const inputs = toolbar.querySelectorAll('input, textarea');
        
        if (inputs.length > 0) {
          console.log('Stagewise Patch: Found', inputs.length, 'input elements');
          
          // Tambahkan event listener pada setiap input
          inputs.forEach((input, index) => {
            console.log('Stagewise Patch: Patching input element', index);
            
            // Hapus event listener lama jika ada
            input.removeEventListener('keydown', handleKeyDown);
            
            // Tambahkan event listener untuk Enter key
            input.addEventListener('keydown', handleKeyDown);
            
            // Tambahkan class untuk styling
            input.classList.add('stagewise-patched-input');
          });
        } else {
          console.log('Stagewise Patch: No input elements found yet, will retry later');
          // Jika tidak ditemukan, coba lagi nanti
          setTimeout(patchStagewiseElements, 1000);
        }
      } else {
        console.log('Stagewise Patch: Stagewise toolbar not found yet, will retry later');
        // Jika tidak ditemukan, coba lagi nanti
        setTimeout(patchStagewiseElements, 1000);
      }
    }
    
    // Handler untuk keydown event
    function handleKeyDown(e) {
      if (e.key === 'Enter') {
        console.log('Stagewise Patch: Enter key pressed in input');
        
        // Cari tombol submit terdekat
        const submitButton = e.target.closest('form')?.querySelector('button[type="submit"]') || 
                           e.target.parentElement?.querySelector('button') ||
                           e.target.parentElement?.parentElement?.querySelector('button');
        
        if (submitButton) {
          console.log('Stagewise Patch: Found submit button, clicking it');
          e.preventDefault();
          e.stopPropagation();
          submitButton.click();
        }
      }
    }
    
    // Jalankan patch setelah beberapa detik untuk memastikan Stagewise sudah dimuat
    setTimeout(patchStagewiseElements, 2000);
    
    // Tambahkan MutationObserver untuk mendeteksi perubahan DOM
    const observer = new MutationObserver(function(mutations) {
      let shouldPatch = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          // Jika ada node baru, periksa apakah itu elemen Stagewise
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              if (node.classList?.contains('stagewise-toolbar') || 
                  node.querySelector?.('.stagewise-toolbar')) {
                console.log('Stagewise Patch: Detected new Stagewise element, patching...');
                shouldPatch = true;
              }
            }
          });
        }
      });
      
      if (shouldPatch) {
        patchStagewiseElements();
      }
    });
    
    // Mulai observasi
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('Stagewise Patch: Initialization complete');
  });
})(); 