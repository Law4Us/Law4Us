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
  title: {
    default: "גירושין אונליין | אריאל דרור",
    template: "%s | Law4Us",
  },
  description:
    "פתיחת תיק גירושין אונליין – פשוט, מהיר ובמחיר הוגן.\n\nהאתר שלנו מאפשר לכם לפתוח תיק גירושין באינטרנט מכל מקום בארץ, בצורה מהירה ובטוחה. כל תיק מנוהל על ידי עורכי דין מנוסים, עם ליווי אישי לכל אורך התהליך ובמחיר הוגן ושקוף.",
  keywords: [
    "גירושין",
    "עורך דין גירושין",
    "תביעת גירושין",
    "הסכם גירושין",
    "משפחה",
    "משמורת",
    "מזונות",
    "חלוקת רכוש",
    "גירושין אונליין",
    "Law4Us",
    "עו\"ד אריאל דרור",
  ],
  authors: [{ name: "Law4Us", url: "https://law4us.co.il" }],
  creator: "Law4Us",
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
    title: "גירושין אונליין | אריאל דרור",
    description:
      "פתיחת תיק גירושין אונליין – פשוט, מהיר ובמחיר הוגן.\n\nהאתר שלנו מאפשר לכם לפתוח תיק גירושין באינטרנט מכל מקום בארץ, בצורה מהירה ובטוחה. כל תיק מנוהל על ידי עורכי דין מנוסים, עם ליווי אישי לכל אורך התהליך ובמחיר הוגן ושקוף.",
    type: "website",
    locale: "he_IL",
    siteName: "Law4Us",
  },
  twitter: {
    card: "summary_large_image",
    title: "גירושין אונליין | אריאל דרור",
    description:
      "פתיחת תיק גירושין אונליין – פשוט, מהיר ובמחיר הוגן.\n\nהאתר שלנו מאפשר לכם לפתוח תיק גירושין באינטרנט מכל מקום בארץ, בצורה מהירה ובטוחה. כל תיק מנוהל על ידי עורכי דין מנוסים, עם ליווי אישי לכל אורך התהליך ובמחיר הוגן ושקוף.",
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
