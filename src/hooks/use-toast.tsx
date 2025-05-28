import { useToast as useToastOriginal } from "@/components/ui/use-toast";

export function useToast() {
  const originalToast = useToastOriginal();
  
  const toast = (props: Parameters<typeof originalToast.toast>[0]) => {
    return originalToast.toast({
      ...props,
      // Memperkecil ukuran toast dengan menambahkan class tambahan
      className: `${props.className || ''} max-w-xs text-sm py-2`,
      // Mempercepat waktu hilangnya toast (dalam milidetik)
      duration: props.duration || 2000, // 2 detik default alih-alih 5 detik
    });
  };
  
  return {
    ...originalToast,
    toast,
  };
} 