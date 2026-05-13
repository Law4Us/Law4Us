import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_CONTACT, LEGAL_VERSION } from "@/lib/constants/legal";

const legalNavLinks = [
  { href: "/terms", label: "תקנון ותנאי שימוש" },
  { href: "/privacy", label: "מדיניות פרטיות" },
  { href: "/cancellation-policy", label: "ביטולים והחזרים" },
  { href: "/accessibility", label: "הצהרת נגישות" },
];

type LegalPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function LegalPage({ title, subtitle, children }: LegalPageProps) {
  return (
    <div className="bg-[#f7f8f6]">
      <section className="mx-auto max-w-[1180px] px-5 py-10 text-right md:px-8 md:py-16">
        <div className="mb-8 border-b border-neutral-light pb-8">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-white px-4 py-2 text-body-small font-semibold text-primary shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            מסמך משפטי
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr,260px] lg:items-end">
            <div>
              <h1 className="text-[2.25rem] font-bold leading-tight text-neutral-darkest md:text-[3.25rem]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-4 max-w-3xl text-body-large leading-8 text-neutral-dark">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-neutral-light bg-white p-4 shadow-sm">
              <p className="text-caption font-semibold uppercase tracking-wide text-neutral-dark">
                גרסת מסמך
              </p>
              <p className="mt-1 text-h4 font-bold text-neutral-darkest">{LEGAL_VERSION}</p>
              <p className="mt-2 text-body-small text-neutral-dark">
                מומלץ לעיין מחדש לפני תשלום או שליחת מידע.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px,1fr] lg:items-start">
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-xl border border-neutral-light bg-white p-5 shadow-sm">
              <h2 className="text-h4 font-bold text-neutral-darkest">מסמכי האתר</h2>
              <nav className="mt-4 grid gap-2" aria-label="מסמכי האתר">
                {legalNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg border border-transparent px-3 py-2 text-body-small font-medium text-neutral-dark transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h2 className="text-h4 font-bold text-neutral-darkest">צריכים עזרה?</h2>
              <p className="mt-2 text-body-small leading-6 text-neutral-dark">
                לכל שאלה על שימוש באתר, פרטיות, ביטול עסקה או נגישות אפשר לפנות למשרד.
              </p>
              <a
                href={`mailto:${LEGAL_CONTACT.email}`}
                className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-body-small font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                שליחת מייל
              </a>
            </div>
          </aside>

          <article className="rounded-xl border border-neutral-light bg-white p-6 shadow-sm md:p-10">
            <div
              className={[
                "prose prose-neutral max-w-none",
                "prose-headings:text-neutral-darkest prose-p:text-neutral-dark prose-li:text-neutral-dark",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-ul:my-3 prose-li:my-1 prose-p:leading-8",
                "[&_section]:border-b [&_section]:border-neutral-light [&_section]:pb-7 [&_section]:mb-7",
                "[&_section:last-child]:border-b-0 [&_section:last-child]:pb-0 [&_section:last-child]:mb-0",
                "[&_h2]:relative [&_h2]:mb-3 [&_h2]:pr-4 [&_h2]:text-[1.35rem]",
                "[&_h2]:before:absolute [&_h2]:before:right-0 [&_h2]:before:top-1 [&_h2]:before:h-7 [&_h2]:before:w-1 [&_h2]:before:rounded-full [&_h2]:before:bg-primary [&_h2]:before:content-['']",
              ].join(" ")}
            >
              {children}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export function LegalContactBlock() {
  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <h2>פרטי התקשרות</h2>
      <p>
        {LEGAL_CONTACT.operatorName}, {LEGAL_CONTACT.address}
        <br />
        טלפון:{" "}
        <a href={`tel:${LEGAL_CONTACT.phone.replace(/-/g, "")}`}>
          {LEGAL_CONTACT.phone}
        </a>
        {" | "}
        נייד:{" "}
        <a href={`tel:${LEGAL_CONTACT.mobile.replace(/-/g, "")}`}>
          {LEGAL_CONTACT.mobile}
        </a>
        <br />
        דוא"ל:{" "}
        <a href={`mailto:${LEGAL_CONTACT.email}`}>{LEGAL_CONTACT.email}</a>
      </p>
    </section>
  );
}

export function PolicyLinksSentence() {
  return (
    <>
      <Link href="/terms">תנאי השימוש</Link>,{" "}
      <Link href="/privacy">מדיניות הפרטיות</Link>,{" "}
      <Link href="/cancellation-policy">מדיניות הביטולים וההחזרים</Link>
    </>
  );
}
