import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'profile_image_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Define a proper cache directory path based on platform
const CACHE_DIR = Platform.OS === 'ios' 
  ? `${RNFS.CachesDirectoryPath}/profileImages` 
  : `${RNFS.CachesDirectoryPath}/profileImages`;

// Ensure the cache directory exists
const ensureCacheDirectory = async () => {
  try {
    const exists = await RNFS.exists(CACHE_DIR);
    if (!exists) {
      await RNFS.mkdir(CACHE_DIR);
    }
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
};

export class ProfileImageCache {
  static async getImageFromCache() {
    try {
      const cacheData = await AsyncStorage.getItem(CACHE_KEY);
      if (!cacheData) return null;
      
      const { filePath, timestamp } = JSON.parse(cacheData);
      
      // Check if cache is expired
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        await this.clearCache();
        return null;
      }
      
      // Check if file exists
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        await this.clearCache();
        return null;
      }
      
      // Return file URI for React Native to display
      return Platform.OS === 'ios' 
        ? filePath 
        : `file://${filePath}`;
    } catch (error) {
      console.error('Error retrieving image from cache:', error);
      return null;
    }
  }
  
  static async saveImageToCache(imageUri) {
    try {
      // Asegurar que el directorio de caché existe
      await ensureCacheDirectory();
      
      // Generar un nombre de archivo único
      const filename = `profile_${Date.now()}.jpg`;
      const filePath = `${CACHE_DIR}/${filename}`;
      
      // Si imageUri es una URL remota, descargarla
      if (typeof imageUri === 'string' && imageUri.startsWith('http')) {
        await RNFS.downloadFile({
          fromUrl: imageUri,
          toFile: filePath,
        }).promise;
      } 
      // Si es una URI de archivo local, copiarla
      else if (typeof imageUri === 'string' && (imageUri.startsWith('file://') || imageUri.startsWith('/'))) {
        const sourceUri = imageUri.replace('file://', '');
        await RNFS.copyFile(sourceUri, filePath);
      }
      // Si es una cadena base64, escribirla directamente
      else if (typeof imageUri === 'string' && imageUri.includes('base64')) {
        // Extraer solo la parte de datos base64 si tiene el prefijo data:image
        const base64Data = imageUri.includes('data:image') 
          ? imageUri.split(',')[1] 
          : imageUri;
        
        await RNFS.writeFile(filePath, base64Data, 'base64');
      }
      // Si es un objeto con uri (como los que devuelve image-picker)
      else if (imageUri && typeof imageUri === 'object' && imageUri.uri) {
        const sourceUri = imageUri.uri.replace('file://', '');
        await RNFS.copyFile(sourceUri, filePath);
      }
      // De lo contrario, formato no soportado
      else {
        console.log('Formato de imagen no soportado:', typeof imageUri, imageUri?.substring ? imageUri.substring(0, 30) + '...' : 'No es string');
        throw new Error('Formato de URI de imagen no soportado');
      }
      
      // Guardar metadatos de caché
      const cacheData = {
        filePath,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      return filePath;
    } catch (error) {
      console.error('Error al guardar imagen en caché:', error);
      return null;
    }
  }
  
  static async clearCache() {
    try {
      // Remove cache metadata
      await AsyncStorage.removeItem(CACHE_KEY);
      
      // Check if directory exists before attempting to clear it
      const exists = await RNFS.exists(CACHE_DIR);
      if (exists) {
        // List all files in the directory
        const files = await RNFS.readDir(CACHE_DIR);
        
        // Delete each file
        for (const file of files) {
          await RNFS.unlink(file.path);
        }
      }
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  }
}