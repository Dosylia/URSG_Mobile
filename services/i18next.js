import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import de from '../locales/de.json';

export const languageResources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
};

// Custom language detector
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    const savedDataJSON = await AsyncStorage.getItem('user-language');
    const lng = savedDataJSON || 'en';
    callback(lng);
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.error('Failed to save language to AsyncStorage:', error);
    }
  },
};

i18next
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    resources: languageResources,
    debug: false,
  });

export default i18next;