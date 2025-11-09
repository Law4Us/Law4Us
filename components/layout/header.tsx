"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { animations } from "@/lib/utils/animations";

const navigation = [
  { name: "איך זה עובד", href: "/#how" },
  { name: "מי אנחנו", href: "/about" },
  { name: "בלוג", href: "/blog" },
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

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
      <nav className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo + Navigation Links - Desktop */}
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
                className={animations.navLinkHover}
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

          {/* Logo - Mobile (centered) */}
          <Link href="/" className="lg:hidden flex items-center">
            <Image
              src="/law4uslogo-blac.svg"
              alt="Law4Us Logo"
              width={96}
              height={24}
              priority
              style={{ height: '24px', width: 'auto' }}
            />
          </Link>

          {/* CTA Button - Desktop */}
          <div className="hidden lg:block">
            <Link
              href="/wizard"
              className={cn(
                "inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                animations.primaryCTAHover
              )}
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
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            style={{ top: '80px', animation: 'fadeIn 300ms ease-out' }}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div
            className="lg:hidden fixed left-0 right-0 z-50 border-t shadow-lg"
            style={{
              backgroundColor: '#EEF2F3',
              borderColor: 'rgba(12, 23, 25, 0.1)',
              top: '80px',
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto',
              animation: 'slideDown 300ms ease-out'
            }}
          >
            <div className="px-6 py-8">
              <div className="flex flex-col gap-6">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(animations.navLinkHover, "py-3 border-b")}
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      lineHeight: '100%',
                      letterSpacing: '-0.02em',
                      color: '#0C1719',
                      borderColor: 'rgba(12, 23, 25, 0.08)',
                      animation: `fadeInUp 400ms ease-out ${index * 50}ms both`
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/wizard"
                  className={cn(
                    "mt-4 inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    animations.primaryCTAHover
                  )}
                  style={{
                    backgroundColor: '#019FB7',
                    border: '0.5px solid #018DA2',
                    borderRadius: '4px',
                    color: 'white',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: '110%',
                    letterSpacing: '0',
                    animation: 'fadeInUp 400ms ease-out 350ms both'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  התחילו בהליך גירושין
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
