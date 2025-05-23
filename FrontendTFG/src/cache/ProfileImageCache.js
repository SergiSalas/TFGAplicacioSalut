import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clave para almacenar los metadatos de la imagen de perfil
 */
const CACHE_KEY = 'profile_image_cache';

/**
 * Tiempo de expiración de la caché (24 horas)
 */
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Directorio donde se almacenan las imágenes de perfil
 */
const CACHE_DIR = Platform.OS === 'ios' 
  ? `${RNFS.CachesDirectoryPath}/profileImages` 
  : `${RNFS.CachesDirectoryPath}/profileImages`;

/**
 * Crea el directorio de caché si no existe
 */
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

/**
 * Clase para gestionar la caché de imágenes de perfil
 */
export class ProfileImageCache {
  /**
   * Obtiene la imagen de perfil desde la caché
   */
  static async getImageFromCache() {
    try {
      const cacheData = await AsyncStorage.getItem(CACHE_KEY);
      if (!cacheData) return null;
      
      const { filePath, timestamp } = JSON.parse(cacheData);
      
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        await this.clearCache();
        return null;
      }
      
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        await this.clearCache();
        return null;
      }
      
      return Platform.OS === 'ios' 
        ? filePath 
        : `file://${filePath}`;
    } catch (error) {
      console.error('Error retrieving image from cache:', error);
      return null;
    }
  }
  
  /**
   * Guarda una imagen en la caché
   */
  static async saveImageToCache(imageUri) {
    try {
      await ensureCacheDirectory();
      
      const filename = `profile_${Date.now()}.jpg`;
      const filePath = `${CACHE_DIR}/${filename}`;
      
      if (typeof imageUri === 'string' && imageUri.startsWith('http')) {
        await RNFS.downloadFile({
          fromUrl: imageUri,
          toFile: filePath,
        }).promise;
      } 
      else if (typeof imageUri === 'string' && (imageUri.startsWith('file://') || imageUri.startsWith('/'))) {
        const sourceUri = imageUri.replace('file://', '');
        await RNFS.copyFile(sourceUri, filePath);
      }
      else if (typeof imageUri === 'string' && imageUri.includes('base64')) {
        const base64Data = imageUri.includes('data:image') 
          ? imageUri.split(',')[1] 
          : imageUri;
        
        await RNFS.writeFile(filePath, base64Data, 'base64');
      }
      else if (imageUri && typeof imageUri === 'object' && imageUri.uri) {
        const sourceUri = imageUri.uri.replace('file://', '');
        await RNFS.copyFile(sourceUri, filePath);
      }
      else {
        console.log('Formato de imagen no soportado:', typeof imageUri, imageUri?.substring ? imageUri.substring(0, 30) + '...' : 'No es string');
        throw new Error('Formato de URI de imagen no soportado');
      }
      
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
  
  /**
   * Elimina todas las imágenes de la caché
   */
  static async clearCache() {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      
      const exists = await RNFS.exists(CACHE_DIR);
      if (exists) {
        const files = await RNFS.readDir(CACHE_DIR);
        
        for (const file of files) {
          await RNFS.unlink(file.path);
        }
      }
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  }
}