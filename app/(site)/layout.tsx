import type { ReactNode } from "react";
import { Header, Footer } from "@/components/layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageTransition } from "@/components/animations/page-transition";
import { ToastProvider } from "@/lib/context/ToastContext";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <ErrorBoundary>
        <ToastProvider>
          <Header />
          <main className="pt-20">
            <PageTransition type="fade-slide" duration={300}>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </ToastProvider>
      </ErrorBoundary>
    </>
  );
}
