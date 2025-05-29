import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "welcome": "Welcome to Online Literacy Platform",
        "courses": "Courses"
      }
    },
    es: {
      translation: {
        "welcome": "Bienvenido a la Plataforma de Alfabetización en Línea",
        "courses": "Cursos"
      }
    }
  },
  lng: 'en',
  fallbackLng: 'en'
});

export default i18n;