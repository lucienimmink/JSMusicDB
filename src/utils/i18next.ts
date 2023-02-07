import { i18next } from '@weavedev/lit-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

export const i18nInit = () => {
  return i18next
    .use(LanguageDetector)
    .use(HttpApi)
    .init({
      lowerCaseLng: true,
      fallbackLng: 'en-gb',
      load: 'currentOnly',
      backend: {
        loadPath: `/translations/{{lng}}.json`,
      },
    });
};
