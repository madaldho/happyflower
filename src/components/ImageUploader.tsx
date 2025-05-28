
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Upload, Image as ImageIcon, Pin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
  showPinIcon?: boolean;
  onImageSelect?: (imageUUID: string) => void;
}

export function ImageUploader({ 
  onImageUpload, 
  currentImage, 
  className, 
  showPinIcon = false,
  onImageSelect 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(currentImage || null);
  const [imageUUID, setImageUUID] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WEBP, BMP, or GIF image.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        try {
          // Upload image using Runware edge function
          const { data, error } = await supabase.functions.invoke('upload-image-runware', {
            body: { 
              image: base64String,
              taskUUID: crypto.randomUUID()
            }
          });

          if (error) throw error;

          if (data?.imageUUID) {
            // Store both the preview and UUID
            setUploadedImage(base64String);
            setImageUUID(data.imageUUID);
            
            // Create a reference URL for the uploaded image
            const imageUrl = `runware://${data.imageUUID}`;
            onImageUpload(imageUrl);
            
            // Call onImageSelect if provided
            if (onImageSelect) {
              onImageSelect(data.imageUUID);
            }
            
            toast({
              title: "Image uploaded successfully!",
              description: "You can now use this image for generation.",
            });
          } else {
            throw new Error('No image UUID returned');
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Failed to read file",
          description: "Please try selecting the file again.",
          variant: "destructive"
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process the selected image.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageUUID(null);
    onImageUpload('');
    if (onImageSelect) {
      onImageSelect('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePinClick = () => {
    if (imageUUID && onImageSelect) {
      onImageSelect(imageUUID);
      toast({
        title: "Image selected for manipulation",
        description: "This image will be used as the base for image-to-image generation.",
      });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
        id="image-upload"
      />
      
      {uploadedImage ? (
        <div className="relative">
          <img 
            src={uploadedImage} 
            alt="Uploaded preview" 
            className="w-full h-32 object-cover rounded-lg border"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {showPinIcon && imageUUID && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePinClick}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                title="Use for image manipulation"
              >
                <Pin className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              disabled={isUploading}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <label 
          htmlFor="image-upload" 
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coral-500"></div>
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> an image
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP, BMP, GIF (MAX. 10MB)</p>
                {showPinIcon && (
                  <p className="text-xs text-blue-500 mt-1">📌 Use pin icon to select for image manipulation</p>
                )}
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
