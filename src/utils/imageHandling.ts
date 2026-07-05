import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "handicrafts": "/defaults/handicrafts.webp",
  "textiles": "/defaults/textiles.webp",
  "food": "/defaults/food.webp",
  "tea": "/defaults/tea.webp",
  "spices": "/defaults/spices.webp",
  "default": "/defaults/generic-product.webp"
};

/**
 * Returns the provided image URL if valid, otherwise falls back to the category default
 * or the generic default image.
 */
export const getProductImageUrl = (imageUrl?: string, category?: string): string => {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  const catKey = category?.toLowerCase() || '';
  return DEFAULT_CATEGORY_IMAGES[catKey] || DEFAULT_CATEGORY_IMAGES['default'];
};

/**
 * Compresses an image file to WebP format using an HTML Canvas.
 */
export const compressToWebP = (file: File, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      
      // Calculate new dimensions (optional: max width/height limits can be added here)
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'));
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Uploads an image (File or Blob) to Firebase Storage and returns the download URL.
 */
export const uploadProductImage = async (file: File | Blob, category: string, productId: string): Promise<string> => {
  const fileExtension = 'webp'; // Since we compress to webp
  const path = `products/${category.toLowerCase()}/${productId}.${fileExtension}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file, { contentType: 'image/webp' });
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
};
