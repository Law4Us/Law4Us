import type { Metadata, Viewport } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-assistant",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://law-4-us.co.il"),
  title: {
    default: "Law4Us - גירושין אונליין | הכנת תביעות משפחה במחיר הוגן | עו\"ד אריאל דרור",
    template: "%s | Law4Us",
  },
  description:
    "פלטפורמה דיגיטלית להכנת תביעות משפחה: תביעת גירושין, רכושית, משמורת ילדים, מזונות והסכם גירושין. שירות מהיר, שקוף ומקצועי במחיר הוגן עם עו\"ד אריאל דרור. הליך מקוון פשוט ונוח מכל מקום בישראל.",
  keywords: [
    "גירושין אונליין",
    "תביעת גירושין",
    "עורך דין גירושין",
    "תביעת רכושית",
    "תביעת משמורת ילדים",
    "תביעת מזונות",
    "הסכם גירושין",
    "עורך דין משפחה תל אביב",
    "הליך גירושין מהיר",
    "עורך דין במחיר הוגן",
    "כתב הגנה משמורת",
    "חלוקת רכוש גירושין",
    "מזונות ילדים",
    "הכנת תביעה משפטית",
    "עו\"ד אריאל דרור",
    "Law4Us",
    "דיני משפחה",
    "בית משפט משפחה",
  ],
  authors: [{ name: "עו\"ד אריאל דרור", url: "https://law-4-us.co.il/about" }],
  creator: "Law4Us - עורכי דין אונליין",
  publisher: "Law4Us",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Law4Us - גירושין אונליין | הכנת תביעות משפחה במחיר הוגן",
    description:
      "פלטפורמה דיגיטלית להכנת תביעות משפחה: גירושין, רכושית, משמורת, מזונות. שירות מהיר ומקצועי במחיר הוגן. הליך פשוט ונוח מכל מקום בישראל.",
    url: "https://law-4-us.co.il",
    type: "website",
    locale: "he_IL",
    siteName: "Law4Us - עורכי דין אונליין",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Law4Us - גירושין אונליין ותביעות משפחה",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Law4Us - גירושין אונליין | הכנת תביעות משפחה במחיר הוגן",
    description:
      "פלטפורמה דיגיטלית להכנת תביעות משפחה במחיר הוגן. שירות מהיר ומקצועי מכל מקום בישראל.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={assistant.variable}>
      <body className="font-sans bg-neutral-light text-neutral-darkest antialiased">
        {children}
      </body>
    </html>
  );
}
