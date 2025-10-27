"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui";
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
    prevStep,
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
      amount: totalAmount,
      date: new Date().toISOString(),
      transactionId: `TRX-${Date.now()}`, // Placeholder
      method: "placeholder", // Will be replaced with actual payment method
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

  const handleBack = () => {
    prevStep();
    router.push("/wizard/step-3");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-h1 font-bold mb-2">תשלום</h1>
        <p className="text-body text-neutral-dark">
          סיכום התביעות ותשלום עבור השירות
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-lg p-8 border border-neutral mb-8">
        {/* Client info */}
        <div className="mb-6 pb-6 border-b border-neutral">
          <h2 className="text-h3 font-semibold mb-3">פרטי הלקוח</h2>
          <p className="text-body text-neutral-darkest">
            <span className="font-medium">שם:</span> {basicInfo.fullName}
          </p>
          <p className="text-body text-neutral-darkest">
            <span className="font-medium">דוא"ל:</span> {basicInfo.email}
          </p>
          <p className="text-body text-neutral-darkest">
            <span className="font-medium">טלפון:</span> {basicInfo.phone}
          </p>
        </div>

        {/* Selected claims */}
        <div className="mb-6">
          <h2 className="text-h3 font-semibold mb-4">תביעות שנבחרו</h2>
          <div className="space-y-3">
            {selectedClaimDetails.map((claim) => (
              <div
                key={claim?.key}
                className="flex justify-between items-center p-3 bg-neutral-lightest rounded"
              >
                <span className="text-body font-medium text-neutral-darkest">
                  {claim?.label}
                </span>
                <span className="text-body font-semibold text-primary">
                  {formatCurrency(PRICE_PER_CLAIM)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="pt-6 border-t border-neutral">
          <div className="flex justify-between items-center">
            <span className="text-h2 font-bold text-neutral-darkest">
              סה"כ לתשלום:
            </span>
            <span className="text-h1 font-bold text-primary">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment status or button */}
      {isPaid ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-h3 font-semibold text-green-800">
              התשלום בוצע בהצלחה
            </h3>
          </div>
          <p className="text-body text-green-700 mr-13">
            מספר עסקה: {paymentData?.transactionId}
          </p>
          <p className="text-body-small text-green-600 mr-13 mt-1">
            עוברים לשלב הסופי...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Payment info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-body text-blue-800">
              💳 <strong>שים לב:</strong> זהו סימולציה של תשלום. במימוש מלא יתווסף
              שער תשלום אמיתי (Tranzila/CardCom/Meshulam).
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
              "מעבד תשלום..."
            ) : (
              <>
                <CreditCard className="w-5 h-5 ml-2" />
                שלם {formatCurrency(totalAmount)}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={isProcessing || isPaid}
        >
          חזור
        </Button>
        {isPaid && (
          <Button
            type="button"
            onClick={() => router.push("/wizard/step-5")}
          >
            המשך
          </Button>
        )}
      </div>
    </div>
  );
}
