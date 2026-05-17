"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useWizardStore } from "@/lib/stores/wizard-store";

type ConfirmationStatus = "checking" | "confirmed" | "pending" | "error";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [status, setStatus] = React.useState<ConfirmationStatus>("checking");
  const { setPaymentData, setStep, setSessionId } = useWizardStore();

  React.useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const confirmPayment = async (attempt = 1) => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (response.ok && data.success && data.session?.paymentStatus === "paid") {
          setPaymentData({ paid: true, date: new Date() });
          setSessionId(sessionId);
          setStep(4);
          setStatus("confirmed");
          return;
        }

        if (attempt >= 12) {
          setStatus("pending");
          return;
        }

        timeoutId = setTimeout(() => confirmPayment(attempt + 1), 2500);
      } catch (error) {
        console.error("Payment confirmation check failed:", error);

        if (!cancelled) {
          setStatus("error");
        }
      }
    };

    confirmPayment();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [sessionId, setPaymentData, setSessionId, setStep]);

  const isConfirmed = status === "confirmed";

  const title = {
    checking: "בודקים את אישור התשלום",
    confirmed: "התשלום התקבל",
    pending: "התשלום עדיין מתעדכן",
    error: "לא הצלחנו לבדוק את התשלום",
  }[status];

  const message = {
    checking: "קיבלנו חזרה מ-Grow ואנחנו ממתינים לאישור התשלום במערכת. זה בדרך כלל לוקח כמה שניות.",
    confirmed: "אפשר להמשיך לשלב אימות הזהות והשלמת הבקשה.",
    pending: "אם התשלום בוצע, האישור עדיין לא הגיע למערכת. אפשר להמתין רגע ולרענן את הדף.",
    error: "אירעה תקלה בבדיקת סטטוס התשלום. אם התשלום בוצע, נסו לרענן את הדף בעוד רגע.",
  }[status];

  const icon = {
    checking: <Loader2 className="mb-5 h-16 w-16 animate-spin text-primary" />,
    confirmed: <CheckCircle className="mb-5 h-16 w-16 text-green-600" />,
    pending: <AlertCircle className="mb-5 h-16 w-16 text-orange-500" />,
    error: <AlertCircle className="mb-5 h-16 w-16 text-red-500" />,
  }[status];

  const handleContinue = () => {
    if (isConfirmed) {
      router.push("/wizard/step-5");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      {icon}
      <h1 className="mb-3 text-h1 font-bold text-neutral-darkest">{title}</h1>
      <p className="mb-8 text-body-large leading-8 text-neutral-dark">
        {message}
      </p>
      <Button size="lg" onClick={handleContinue} disabled={!isConfirmed}>
        המשך לשלב הבא
      </Button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-body-large text-neutral-dark">טוען אישור תשלום...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </React.Suspense>
  );
}
