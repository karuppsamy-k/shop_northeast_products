import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "handicrafts": "/defaults/handicrafts.webp",
  "textiles": "/defaults/textiles.webp",
  "food": "/defaults/food.webp",
  "tea": "/defaults/tea.webp",
  "spices": "/defaults/spices.webp",
  "default": "/defaults/generic-product.webp"
};

/**
 * Returns the provided image URL if valid, otherwise falls back to the category default.
 */
export const getProductImageUrl = (imageUrl?: string, category?: string): string => {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  const catKey = category?.toLowerCase() || '';
  return DEFAULT_CATEGORY_IMAGES[catKey] || DEFAULT_CATEGORY_IMAGES['default'];
};

/**
 * Compresses an image file to a small base64 WebP string using canvas.
 * Targets ~400x400px at quality 0.5 — output is ~30-60KB.
 * Returns a base64 data URL that can be stored directly in Firestore.
 * This avoids Firebase Storage entirely and makes saves near-instant.
 */
export const compressToBase64 = (file: File, maxSize = 400, quality = 0.55): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down to fit within maxSize x maxSize
      if (width > height) {
        if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
      } else {
        if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fallback to JPEG
      const dataUrl = canvas.toDataURL('image/webp', quality);
      if (dataUrl && dataUrl !== 'data:,') {
        resolve(dataUrl);
      } else {
        resolve(canvas.toDataURL('image/jpeg', quality));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * @deprecated Use compressToBase64 instead for instant saves.
 * Legacy WebP blob compression kept for backward compatibility.
 */
export const compressToWebP = async (file: File): Promise<File> => file;

/**
 * @deprecated Use compressToBase64 instead.
 * Legacy Firebase Storage uploader — slow due to network round-trip.
 */
export const uploadProductImage = (
  file: File | Blob,
  category: string,
  productId: string,
  onProgress?: (percent: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const path = `products/${category.toLowerCase()}/${productId}.webp`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, { contentType: 'image/webp' });

    uploadTask.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
    );
  });
};
