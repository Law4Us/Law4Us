import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { animations } from "@/lib/utils/animations";

const companyLinks = [
  { name: "מי אנחנו", href: "/about" },
  { name: "מה אומרים עלינו", href: "/#testimonials" },
  { name: "הבלוג שלנו", href: "/#blog" },
];

const infoLinks = [
  { name: "סרטון", href: "/#video" },
  { name: "איך זה עובד", href: "/#how" },
  { name: "סוגי תביעות", href: "/#claim-types" },
  { name: "שאלות ותשובות", href: "/#faq" },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-h2 font-bold mb-6">Law4Us</h3>
            <p className="text-body-small text-white/80 mb-6">
              פתיחת תיק גירושין אונליין מנוהל על ידי עורכי דין מנוסים ובמחיר הוגן
            </p>
            <Link
              href="/wizard"
              className={`inline-flex items-center justify-center rounded font-medium touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white border border-primary-dark hover:bg-primary-dark text-body px-6 py-3 ${animations.primaryCTAHover}`}
            >
              התחילו בהליך גירושין
            </Link>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-h3 font-semibold mb-6">החברה</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-body-small text-white/80 ${animations.footerLinkHover}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="text-h3 font-semibold mb-6">מידע</h4>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-body-small text-white/80 ${animations.footerLinkHover}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-h3 font-semibold mb-6">צור קשר</h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-body-small text-white/80">
                  ברקוביץ 4, מגדל המוזיאון, קומה שישית, תל אביב
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <a
                  href="tel:036951408"
                  className={`text-body-small text-white/80 ${animations.footerLinkHover}`}
                >
                  טלפון: 03-6951408
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <a
                  href="tel:0507529938"
                  className={`text-body-small text-white/80 ${animations.footerLinkHover}`}
                >
                  נייד: 050-7529938
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <a
                  href="mailto:info@law-4-us.co.il"
                  className={`text-body-small text-white/80 ${animations.footerLinkHover}`}
                >
                  info@law-4-us.co.il
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`touch-target flex items-center justify-center p-2 rounded-full bg-white/10 ${animations.socialIconHover}`}
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-body-small text-white/60">
              © {currentYear} - eDivorce
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://pointline.agency"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center transition-opacity hover:opacity-80"
                aria-label="POINTLINE Agency"
              >
                <svg
                  display="block"
                  role="presentation"
                  viewBox="0 0 177 32"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-auto"
                >
                  <path
                    d="M 30.656 4.532 L 39.296 4.532 C 41.024 4.532 42.517 4.82 43.776 5.396 C 45.035 5.95 45.995 6.772 46.656 7.86 C 47.339 8.926 47.68 10.195 47.68 11.668 C 47.68 13.161 47.339 14.452 46.656 15.54 C 45.995 16.628 45.035 17.46 43.776 18.035 C 42.517 18.611 41.024 18.899 39.296 18.899 L 34.464 18.899 L 34.464 27.251 L 30.656 27.251 Z M 39.136 15.508 C 40.629 15.508 41.76 15.188 42.528 14.548 C 43.318 13.908 43.712 12.948 43.712 11.668 C 43.712 10.452 43.317 9.524 42.528 8.884 C 41.76 8.244 40.63 7.924 39.136 7.924 L 34.464 7.924 L 34.464 15.507 L 39.136 15.507 Z M 59.396 27.764 C 57.178 27.764 55.258 27.294 53.636 26.355 C 52.036 25.395 50.81 24.03 49.956 22.259 C 49.103 20.468 48.676 18.355 48.676 15.924 C 48.676 13.492 49.103 11.38 49.956 9.588 C 50.81 7.796 52.036 6.42 53.636 5.46 C 55.258 4.5 57.178 4.02 59.396 4.02 C 61.616 4.02 63.525 4.5 65.124 5.46 C 66.746 6.42 67.984 7.796 68.837 9.588 C 69.69 11.38 70.117 13.492 70.117 15.924 C 70.117 18.355 69.69 20.468 68.837 22.259 C 67.983 24.03 66.746 25.395 65.124 26.355 C 63.524 27.295 61.615 27.764 59.397 27.764 Z M 59.396 24.372 C 60.804 24.372 62.01 24.041 63.013 23.38 C 64.037 22.697 64.815 21.726 65.349 20.468 C 65.903 19.188 66.18 17.673 66.18 15.924 C 66.18 14.153 65.903 12.638 65.348 11.38 C 64.815 10.1 64.037 9.118 63.013 8.436 C 62.01 7.753 60.804 7.412 59.397 7.412 C 57.989 7.412 56.773 7.752 55.749 8.436 C 54.746 9.118 53.967 10.1 53.412 11.38 C 52.879 12.638 52.612 14.153 52.612 15.923 C 52.612 17.673 52.879 19.187 53.412 20.468 C 53.967 21.726 54.746 22.697 55.749 23.38 C 56.772 24.04 57.989 24.372 59.397 24.372 Z M 71.535 4.532 L 75.343 4.532 L 75.343 27.252 L 71.535 27.252 Z M 77.99 4.532 L 82.63 4.532 L 92.774 22.355 L 92.774 4.532 L 96.582 4.532 L 96.582 27.252 L 91.814 27.252 L 81.798 9.907 L 81.798 27.25 L 77.99 27.25 Z M 105.096 7.924 L 98.152 7.924 L 98.152 4.532 L 115.848 4.532 L 115.848 7.924 L 108.904 7.924 L 108.904 27.252 L 105.096 27.252 Z M 117.431 4.532 L 121.239 4.532 L 121.239 25.972 L 119.191 23.859 L 132.151 23.859 L 132.151 27.251 L 117.431 27.251 Z M 134.23 4.532 L 138.038 4.532 L 138.038 27.252 L 134.23 27.252 Z M 140.685 4.532 L 145.325 4.532 L 155.469 22.355 L 155.469 4.532 L 159.277 4.532 L 159.277 27.252 L 154.509 27.252 L 144.493 9.907 L 144.493 27.25 L 140.685 27.25 Z M 161.921 4.532 L 176.961 4.532 L 176.961 7.924 L 165.729 7.924 L 165.729 14.195 L 176.577 14.195 L 176.577 17.523 L 165.729 17.523 L 165.729 23.86 L 177.217 23.86 L 177.217 27.252 L 161.921 27.252 Z M 12.8 1.422 C 12.8 0.637 13.437 0 14.222 0 C 17.364 0 19.911 2.547 19.911 5.689 L 19.911 26.31 C 19.911 27.819 19.312 29.266 18.245 30.333 C 17.178 31.4 15.731 32 14.222 32 C 13.437 32 12.8 31.363 12.8 30.578 Z M 0 16 C 0.001 14.036 1.592 12.445 3.556 12.445 L 5.689 12.445 C 6.474 12.445 7.111 13.082 7.111 13.867 L 7.111 18.134 C 7.111 18.92 6.474 19.556 5.689 19.556 L 3.556 19.556 C 2.613 19.556 1.708 19.182 1.042 18.515 C 0.375 17.848 0 16.944 0 16.001 Z"
                    fill="rgb(255, 255, 255)"
                  />
                </svg>
              </a>
              <span className="text-body-small text-white/60">|</span>
              <span className="text-body-small text-white/60">Built and designed by</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
