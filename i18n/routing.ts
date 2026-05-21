import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'hi', 'mr', 'ta', 'te', 'bn'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the default locale (optional)
  localePrefix: 'as-needed'
});

export type Locale = (typeof routing.locales)[number];
