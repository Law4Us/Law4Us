import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Law4Us - גירושין אונליין | עורכי דין לענייני משפחה',
    short_name: 'Law4Us',
    description: 'פלטפורמה אונליין להכנת תביעות משפחה: גירושין, רכושית, משמורת, מזונות והסכם גירושין במחיר הוגן. עו"ד אריאל דרור.',
    start_url: '/',
    display: 'standalone',
    background_color: '#EEF2F3',
    theme_color: '#019FB7',
    lang: 'he',
    dir: 'rtl',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
