"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Check, Shield, Lock, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui";
import { SlideInView } from "@/components/animations/slide-in-view";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { CLAIMS } from "@/lib/constants/claims";
import { formatCurrency } from "@/lib/utils/format";

const PRICE_PER_CLAIM = 3900;

export default function Step4Payment() {
  const router = useRouter();
  const {
    basicInfo,
    selectedClaims,
    paymentData,
    setPaymentData,
    nextStep,
  } = useWizardStore();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isPaid, setIsPaid] = React.useState(!!paymentData?.paid);

  // Calculate total
  const totalAmount = selectedClaims.length * PRICE_PER_CLAIM;

  // Get selected claim details
  const selectedClaimDetails = selectedClaims
    .map((key) => CLAIMS.find((c) => c.key === key))
    .filter(Boolean);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing (replace with actual payment integration)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mark as paid
    const paymentInfo = {
      paid: true,
      date: new Date(),
    };

    setPaymentData(paymentInfo);
    setIsPaid(true);
    setIsProcessing(false);

    // Auto-proceed to next step after short delay
    setTimeout(() => {
      nextStep();
      router.push("/wizard/step-5");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <SlideInView direction="up" delay={0}>
        <div className="mb-8 text-center">
          <h1 className="text-h1 font-bold mb-2">תשלום מאובטח</h1>
          <p className="text-body text-neutral-dark mb-4">
            סיכום התביעות ותשלום חד-פעמי עבור השירות המשפטי
          </p>
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 text-body-small text-neutral-dark">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span>תשלום מאובטח</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-green-600" />
              <span>הצפנת SSL</span>
            </div>
          </div>
        </div>
      </SlideInView>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Summary Card */}
        <div className="lg:col-span-2">
          <SlideInView direction="up" delay={100}>
            <div className="bg-white rounded-xl border-2 border-neutral-light shadow-md p-8 mb-6">
              {/* Client info */}
              <div className="mb-6 pb-6 border-b border-neutral-light">
                <h2 className="text-h3 font-semibold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  פרטי הלקוח
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-body-small text-neutral-dark mb-1">שם מלא</p>
                    <p className="text-body font-semibold">{basicInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-body-small text-neutral-dark mb-1">דוא"ל</p>
                    <p className="text-body font-semibold">{basicInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-body-small text-neutral-dark mb-1">טלפון</p>
                    <p className="text-body font-semibold">{basicInfo.phone}</p>
                  </div>
                </div>
              </div>

              {/* Selected claims */}
              <div className="mb-6">
                <h2 className="text-h3 font-semibold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  תביעות שנבחרו
                </h2>
                <div className="space-y-3">
                  {selectedClaimDetails.map((claim, index) => (
                    <div
                      key={claim?.key}
                      className="flex justify-between items-center p-4 bg-neutral-lightest rounded-lg border border-neutral-light"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-caption font-bold">
                          {index + 1}
                        </div>
                        <span className="text-body font-medium text-neutral-darkest">
                          {claim?.label}
                        </span>
                      </div>
                      <span className="text-body-large font-bold text-primary">
                        {formatCurrency(PRICE_PER_CLAIM)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 border-t-2 border-neutral-light bg-primary/5 -mx-8 px-8 pb-8 -mb-8 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <span className="text-h2 font-bold text-neutral-darkest">
                    סה"כ לתשלום:
                  </span>
                  <span className="text-h1 font-bold text-primary">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <p className="text-body-small text-neutral-dark mt-2">
                  תשלום חד-פעמי ללא עלויות נוספות
                </p>
              </div>
            </div>
          </SlideInView>

          {/* Payment Section */}
          {isPaid ? (
            <SlideInView direction="up" delay={200}>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold text-green-800">
                      התשלום בוצע בהצלחה!
                    </h3>
                    <p className="text-body-small text-green-600">
                      עוברים לשלב הסופי...
                    </p>
                  </div>
                </div>
              </div>
            </SlideInView>
          ) : (
            <SlideInView direction="up" delay={200}>
              <div className="space-y-4">
                {/* Payment simulation notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-body text-blue-800">
                    💳 <strong>שים לב:</strong> זהו סימולציה של תשלום. במימוש מלא יתווסף שער תשלום אמיתי.
                  </p>
                </div>

                {/* Payment button */}
                <Button
                  onClick={handlePayment}
                  loading={isProcessing}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      מעבד תשלום...
                    </span>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 ml-2" />
                      שלם {formatCurrency(totalAmount)} בבטחה
                    </>
                  )}
                </Button>
              </div>
            </SlideInView>
          )}
        </div>

        {/* Sidebar - Trust & Benefits */}
        <div className="lg:col-span-1">
          <SlideInView direction="up" delay={150}>
            {/* Security Badge */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-h4 font-semibold text-green-800">
                  תשלום מאובטח
                </h3>
              </div>
              <ul className="space-y-2 text-body-small text-green-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>הצפנה מלאה SSL/TLS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>תקן אבטחה PCI-DSS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>פרטי אשראי לא נשמרים</span>
                </li>
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white border-2 border-neutral-light rounded-xl p-6 mb-6">
              <h3 className="text-h4 font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                מה כלול בשירות?
              </h3>
              <ul className="space-y-3 text-body-small text-neutral-dark">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>הכנת כל המסמכים המשפטיים</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>הגשת התביעה לבית המשפט</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>ייצוג משפטי מלא</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>ליווי עד לסיום ההליך</span>
                </li>
              </ul>
            </div>

            {/* Timeline */}
            <div className="bg-white border-2 border-neutral-light rounded-xl p-6">
              <h3 className="text-h4 font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                זמני תגובה
              </h3>
              <ul className="space-y-3 text-body-small text-neutral-dark">
                <li>
                  <strong className="text-primary">24 שעות</strong> - יצירת קשר ראשונית
                </li>
                <li>
                  <strong className="text-primary">3-5 ימים</strong> - הגשת תביעה
                </li>
                <li>
                  <strong className="text-primary">שוטף</strong> - עדכונים במייל ו-SMS
                </li>
              </ul>
            </div>
          </SlideInView>
        </div>
      </div>

      {/* Continue Button (after payment) */}
      {isPaid && (
        <SlideInView direction="up" delay={300}>
          <div className="flex justify-center mt-8">
            <Button
              type="button"
              size="lg"
              onClick={() => router.push("/wizard/step-5")}
              className="min-w-[300px]"
            >
              המשך לשלב הסופי
            </Button>
          </div>
        </SlideInView>
      )}
    </div>
  );
}
