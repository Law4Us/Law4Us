"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "איך זה עובד", href: "/#how" },
  { name: "מי אנחנו", href: "/about" },
  { name: "צריכים עזרה?", href: "/help" },
  { name: "מהו הליך הגירושין", href: "/divorce" },
  { name: "צור קשר", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-smooth",
        isScrolled
          ? "border-b"
          : ""
      )}
      style={{
        backgroundColor: '#EEF2F3',
        borderBottomColor: isScrolled ? 'rgba(12, 23, 25, 0.1)' : 'transparent',
        borderBottomWidth: '1px'
      }}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo + Navigation Links - RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/law4uslogo-blac.svg"
                alt="Law4Us Logo"
                width={96}
                height={24}
                priority
                style={{ height: '24px', width: 'auto' }}
              />
            </Link>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="transition-smooth hover:text-primary"
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  lineHeight: '100%',
                  letterSpacing: '-0.02em',
                  color: '#0C1719'
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Button - LEFT SIDE */}
          <div className="hidden lg:block">
            <Link
              href="/wizard"
              className="inline-flex items-center justify-center font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
              style={{
                backgroundColor: '#019FB7',
                border: '0.5px solid #018DA2',
                borderRadius: '4px',
                color: 'white',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '110%',
                letterSpacing: '0'
              }}
            >
              התחילו בהליך גירושין
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden touch-target p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="פתח תפריט"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t" style={{ backgroundColor: '#EEF2F3', borderColor: '#C7CFD1' }}>
          <div className="container-custom py-6">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="hover:text-primary transition-smooth py-2"
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    lineHeight: '100%',
                    letterSpacing: '-0.02em',
                    color: '#0C1719'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/wizard"
                className="mt-4 inline-flex items-center justify-center font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
                style={{
                  backgroundColor: '#019FB7',
                  border: '0.5px solid #018DA2',
                  borderRadius: '4px',
                  color: 'white',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: '110%',
                  letterSpacing: '0'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                התחילו בהליך גירושין
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
