"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useWizardStore } from "@/lib/stores/wizard-store";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const { setPaymentData, setStep, setSessionId } = useWizardStore();

  React.useEffect(() => {
    setPaymentData({ paid: true, date: new Date() });
    setStep(4);

    if (sessionId) {
      setSessionId(sessionId);
    }
  }, [sessionId, setPaymentData, setSessionId, setStep]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <CheckCircle className="mb-5 h-16 w-16 text-green-600" />
      <h1 className="mb-3 text-h1 font-bold text-neutral-darkest">התשלום התקבל</h1>
      <p className="mb-8 text-body-large leading-8 text-neutral-dark">
        אפשר להמשיך לשלב אימות הזהות והשלמת הבקשה. אם החלון נפתח לאחר תשלום ב-Grow,
        סטטוס התשלום יתעדכן גם במערכת ברקע.
      </p>
      <Button size="lg" onClick={() => router.push("/wizard/step-5")}>
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
