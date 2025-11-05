import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

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
              className="inline-flex items-center justify-center rounded font-medium transition-smooth touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] bg-primary text-white border border-primary-dark hover:bg-primary-dark text-body px-6 py-3"
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
                    className="text-body-small text-white/80 hover:text-white transition-smooth"
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
                    className="text-body-small text-white/80 hover:text-white transition-smooth"
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
                  יגאל אלון 26, תל אביב
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <a
                  href="tel:035555555"
                  className="text-body-small text-white/80 hover:text-white transition-smooth"
                >
                  03-5555555
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <a
                  href="mailto:info@law4us.co.il"
                  className="text-body-small text-white/80 hover:text-white transition-smooth"
                >
                  info@law4us.co.il
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
                    className="touch-target p-2 rounded-full bg-white/10 hover:bg-white/20 transition-smooth"
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
            <p className="text-body-small text-white/60 flex items-center gap-2">
              <span>Built & designed by</span>
              <span className="text-white font-medium">| POINTLINE</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
