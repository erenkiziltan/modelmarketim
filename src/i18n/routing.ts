import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  localeDetection: false, // Tarayıcı diline göre otomatik yönlendirme kapalı
})
