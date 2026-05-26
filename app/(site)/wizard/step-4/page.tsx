"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CreditCard, Check, Shield, Lock, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui";
import { SlideInView } from "@/components/animations/slide-in-view";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { CLAIMS, calculatePricing, type PricingBreakdown } from "@/lib/constants/claims";
import { formatCurrency } from "@/lib/utils/format";

export default function Step4Payment() {
  const router = useRouter();
  const {
    basicInfo,
    selectedClaims,
    paymentOverrideAmount,
    sessionId,
    setSessionId,
  } = useWizardStore();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isPaid, setIsPaid] = React.useState(false);
  const [sessionCreated, setSessionCreated] = React.useState(false);
  const [legalConsentAccepted, setLegalConsentAccepted] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState("");
  const [serverSessionAmount, setServerSessionAmount] = React.useState<number | null>(null);
  const [serverPricingBreakdown, setServerPricingBreakdown] = React.useState<PricingBreakdown | null>(null);
  const sessionCreationStartedRef = React.useRef(false);
  const paymentRequestInFlightRef = React.useRef(false);

  const calculatedPricing = calculatePricing(selectedClaims);
  const pricingBreakdown = serverPricingBreakdown || calculatedPricing;
  const totalAmount =
    typeof serverSessionAmount === "number" &&
    Number.isFinite(serverSessionAmount) &&
    serverSessionAmount > 0
      ? serverSessionAmount
      : typeof paymentOverrideAmount === "number" &&
          Number.isFinite(paymentOverrideAmount) &&
          paymentOverrideAmount > 0
      ? paymentOverrideAmount
      : pricingBreakdown.total;

  // Create session when component mounts (if not already created)
  React.useEffect(() => {
    const createSession = async () => {
      // Effects can run twice in development; one wizard must create one session.
      if (sessionId || sessionCreated || sessionCreationStartedRef.current) {
        return;
      }

      // Validate we have required data
      if (!basicInfo?.email || selectedClaims.length === 0) {
        console.warn('Cannot create session: missing email or claims');
        return;
      }

      sessionCreationStartedRef.current = true;

      try {
        console.log('📝 Creating wizard session...');

        const wizardState = useWizardStore.getState();
        const response = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wizardState,
            email: basicInfo.email,
            phone: basicInfo.phone,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSessionId(data.sessionId);
          setSessionCreated(true);
          console.log('✅ Session created:', data.sessionId);
          console.log('📧 Recovery email sent to:', basicInfo.email);
        } else {
          console.error('Failed to create session:', data.message);
          sessionCreationStartedRef.current = false;
        }
      } catch (error) {
        console.error('Error creating session:', error);
        sessionCreationStartedRef.current = false;
      }
    };

    createSession();
  }, [sessionId, basicInfo?.email, selectedClaims.length, sessionCreated, setSessionId, basicInfo.phone]);

  React.useEffect(() => {
    if (!sessionId) {
      setIsPaid(false);
      setServerSessionAmount(null);
      setServerPricingBreakdown(null);
      return;
    }

    let cancelled = false;

    const fetchSessionAmount = async () => {
      try {
        const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const data = await response.json();
        const amount = Number(data.session?.totalAmount);

        if (!cancelled) {
          setIsPaid(response.ok && data.success && data.session?.paymentStatus === "paid");
        }

        const savedPricing = data.session?.pricingBreakdown as PricingBreakdown | undefined;
        const hasValidPricingSnapshot =
          response.ok &&
          data.success &&
          savedPricing &&
          Number(savedPricing.total) === amount &&
          Number.isFinite(amount) &&
          amount > 0;

        if (!cancelled && hasValidPricingSnapshot) {
          setServerSessionAmount(amount);
          setServerPricingBreakdown(savedPricing);
        } else if (!cancelled) {
          // Older unpaid sessions are re-priced at checkout using today's centralized schedule.
          setServerSessionAmount(null);
          setServerPricingBreakdown(null);
        }
      } catch (error) {
        console.warn("Could not fetch saved payment amount:", error);

        if (!cancelled) {
          setIsPaid(false);
        }
      }
    };

    fetchSessionAmount();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Get selected claim details
  const selectedClaimDetails = selectedClaims
    .map((key) => CLAIMS.find((c) => c.key === key))
    .filter(Boolean);

  const bundledClaim = selectedClaimDetails.find((claim) => claim?.isBundle);
  const bundledClaimKeys = new Set(bundledClaim?.bundledClaims || []);

  const handlePayment = async () => {
    if (!legalConsentAccepted || paymentRequestInFlightRef.current) {
      return;
    }

    paymentRequestInFlightRef.current = true;
    setIsProcessing(true);
    setPaymentError("");

    try {
      const activeSessionId = sessionId || useWizardStore.getState().sessionId;

      if (!activeSessionId) {
        setPaymentError("לא הצלחנו ליצור מזהה בקשה לתשלום. נסו שוב בעוד רגע.");
        setIsProcessing(false);
        paymentRequestInFlightRef.current = false;
        return;
      }

      const response = await fetch("/api/payments/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          fullName: basicInfo.fullName,
          phone: basicInfo.phone,
          email: basicInfo.email,
          amount: totalAmount,
          claimNames: selectedClaimDetails.map((claim) => claim?.label).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.paymentUrl) {
        setPaymentError(data.message || "לא הצלחנו ליצור קישור תשלום. נסו שוב.");
        setIsProcessing(false);
        paymentRequestInFlightRef.current = false;
        return;
      }

      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error("Payment link creation failed:", error);
      setPaymentError("אירעה שגיאה ביצירת קישור התשלום. נסו שוב.");
      setIsProcessing(false);
      paymentRequestInFlightRef.current = false;
    }
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
                  {selectedClaimDetails.map((claim, index) => {
                    const isIncludedInBundle =
                      !!bundledClaim &&
                      !!claim &&
                      claim.key !== bundledClaim.key &&
                      bundledClaimKeys.has(claim.key);

                    return (
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
                          {isIncludedInBundle ? (
                            "כלול בחבילה"
                          ) : (
                            <>
                              <span className="block">שירות: {formatCurrency(claim?.price || 0)}</span>
                              <span className="block text-body-small text-neutral-dark">
                                אגרה: {formatCurrency(claim?.courtFee || 0)}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VAT is charged on legal service fees only, never on filing fees. */}
              <div className="pt-6 border-t-2 border-neutral-light bg-primary/5 -mx-8 px-8 pb-8 -mb-8 rounded-b-xl">
                <div className="mb-5 space-y-3 text-body">
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-dark">מחיר שירות:</span>
                    <span className="font-semibold">{formatCurrency(pricingBreakdown.serviceSubtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-dark">
                      מע&quot;מ על השירות ({Math.round(pricingBreakdown.vatRate * 100)}%):
                    </span>
                    <span className="font-semibold">{formatCurrency(pricingBreakdown.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-dark">אגרת בית משפט / אגרה ממשלתית בנפרד:</span>
                    <span className="font-semibold">{formatCurrency(pricingBreakdown.courtFeeTotal)}</span>
                  </div>
                  <p className="text-body-small text-neutral-dark">
                    האגרה אינה חייבת במע&quot;מ.
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-h2 font-bold text-neutral-darkest">
                    סה"כ לתשלום:
                  </span>
                  <span className="text-h1 font-bold text-primary">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <p className="text-body-small text-neutral-dark mt-2">
                  תשלום חד-פעמי לפי הפירוט המוצג לעיל
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-body text-blue-800">
                    התשלום מתבצע בעמוד מאובטח של Grow. לאחר לחיצה ניצור עבורך קישור תשלום אישי.
                  </p>
                </div>

                {paymentError && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <p className="text-body-small">{paymentError}</p>
                  </div>
                )}

                {/* Payment button */}
                <label className="flex items-start gap-3 rounded-lg border border-neutral-light bg-white p-4 text-right text-body-small text-neutral-dark">
                  <input
                    type="checkbox"
                    checked={legalConsentAccepted}
                    onChange={(event) => setLegalConsentAccepted(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span>
                    קראתי ואני מאשר/ת את{" "}
                    <Link href="/terms" className="text-primary hover:underline">תנאי הרכישה ותקנון האתר</Link>
                    , את{" "}
                    <Link href="/privacy" className="text-primary hover:underline">מדיניות הפרטיות</Link>
                    {" "}ואת{" "}
                    <Link href="/cancellation-policy" className="text-primary hover:underline">מדיניות הביטולים וההחזרים</Link>
                    .
                  </span>
                </label>

                <Button
                  onClick={handlePayment}
                  loading={isProcessing}
                  disabled={isProcessing || !legalConsentAccepted}
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
                  <span>בדיקה ידנית של עו&quot;ד מומחה לפני שליחה</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>תמיכה אישית בטלפון או בוואטסאפ לאורך כל הדרך</span>
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
                  <strong className="text-primary">3-5 ימים</strong> - קבלת טיוטת מסמכים מלאה לאישור
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
